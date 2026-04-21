import {inject, injectable} from 'inversify';
import {Logger} from 'winston';
import {TYPES} from '../infrastructure/ioc/Types';
import {WeatherApplication} from '../application/WeatherApplication';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {WarningPayload} from '../payloads/WarningPayload';
import Env from '../infrastructure/env/Env';
import cron from 'node-cron';
import {promises as fs} from 'fs';
import path from 'path';
import {HttpClient} from '../infrastructure/http/HttpClient';
import {PostWarningEventHttpQuery} from '../infrastructure/http/query/PostWarningEventHttpQuery';
import {HomeAssistantMqttService} from './HomeAssistantMqttService';

type EventSeverity = 'warning';

@injectable()
export class WarningsCronService {
  @inject(TYPES.Logger)
  private readonly logger: Logger;

  @inject(TYPES.WeatherApplication)
  private readonly weatherApplication: WeatherApplication;

  @inject(TYPES.HttpClient)
  private readonly httpClient: HttpClient;

  @inject(TYPES.HomeAssistantMqttService)
  private readonly haMqttService: HomeAssistantMqttService;

  private readonly prefix: string = '[Meteorologic Collector]';
  private readonly signatureFilePath: string = path.resolve('data/last_warnings_signature.json');
  private lastWarningsSignature: string | null = null;

  public start(): void {
    cron.schedule(Env.WARNINGS_CRON_SCHEDULE, async (): Promise<void> => {
      await this.runCron();
    });

    this.logger.info(
      `${this.prefix} cron scheduled: ${Env.WARNINGS_CRON_SCHEDULE} with territory ${Env.WARNINGS_TERRITORY}`,
    );

    if (Env.ENABLE_HA_MQTT) {
      void this.haMqttService.start().catch((error: unknown) => {
        this.logger.error(`${this.prefix} mqtt start error: ${error instanceof Error ? error.message : String(error)}`);
      });
    }

    void this.runInitial();
  }

  private async runCron(): Promise<void> {
    try {
      const warnings = await this.weatherApplication.getWarnings(Env.WARNINGS_TERRITORY);
      this.logger.info(`${this.prefix} cron warnings response: ${JSON.stringify(warnings)}`);
      await this.processWarnings(warnings, false);
      await this.publishToHomeAssistantMqtt(warnings);
    } catch (error) {
      this.logger.error(
        `${this.prefix} cron warnings error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async runInitial(): Promise<void> {
    try {
      if (this.lastWarningsSignature === null) {
        this.lastWarningsSignature = await this.loadLastSignature();
      }
      const warnings = await this.weatherApplication.getWarnings(Env.WARNINGS_TERRITORY);
      this.logger.info(
        `${this.prefix} cron initial run with response: ${warnings.getWarnings().length ? warnings.getWarnings().length + 'warnings' : warnings.getErrorMessage()}`,
      );
      await this.processWarnings(warnings, true);
      await this.publishToHomeAssistantMqtt(warnings);
    } catch (error) {
      this.logger.error(
        `${this.prefix} cron initial run error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async publishToHomeAssistantMqtt(warnings: WarningsResponsePayload): Promise<void> {
    if (!Env.ENABLE_HA_MQTT) {
      return;
    }

    try {
      await this.haMqttService.publishWarnings(warnings);
    } catch (error) {
      this.logger.error(`${this.prefix} mqtt publish error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async processWarnings(warnings: WarningsResponsePayload, allowLoadSignature: boolean): Promise<void> {
    if (allowLoadSignature && this.lastWarningsSignature === null) {
      this.lastWarningsSignature = await this.loadLastSignature();
    }
    const signature = this.buildWarningsSignature(warnings);
    if (!warnings.getWarnings().length) {
      this.lastWarningsSignature = signature;
      await this.persistSignature(signature);
      return;
    }
    if (signature === this.lastWarningsSignature) {
      return;
    }
    let sent = false;
    try {
      sent = await this.sendWarningEvent(warnings);
    } catch (error) {
      this.logger.error(`${this.prefix} event send error: ${error instanceof Error ? error.message : String(error)}`);
      sent = false;
    }
    if (sent) {
      this.lastWarningsSignature = signature;
      await this.persistSignature(signature);
    }
  }

  private pickPrimaryWarning(warnings: WarningPayload[]): WarningPayload | null {
    if (!warnings.length) {
      return null;
    }

    return warnings.reduce((maxWarning: WarningPayload, currentWarning: WarningPayload) => {
      return currentWarning.getLevel() > maxWarning.getLevel() ? currentWarning : maxWarning;
    });
  }

  private buildWarningsSignature(warningsResponse: WarningsResponsePayload): string {
    const warningsData = warningsResponse.getWarnings().map((warning: WarningPayload) => ({
      phenomenonName: warning.getPhenomenonName(),
      level: warning.getLevel(),
      probability: warning.getProbability(),
      content: warning.getContent(),
      comment: warning.getComment(),
      validFrom: warning.getValidFrom()?.toISOString() ?? null,
      validTo: warning.getValidTo()?.toISOString() ?? null,
      published: warning.getPublishDate()?.toISOString() ?? null,
    }));

    return JSON.stringify({
      location: warningsResponse.location,
      phenomenonName: warningsResponse.phenomenonName,
      warnings: warningsData,
    });
  }

  private async loadLastSignature(): Promise<string | null> {
    try {
      const raw = await fs.readFile(this.signatureFilePath, 'utf8');
      const parsed = JSON.parse(raw) as {signature?: string};
      return parsed.signature ?? null;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return null;
      }
      this.logger.warn(
        `${this.prefix} failed to read signature file: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private async persistSignature(signature: string): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.signatureFilePath), {recursive: true});
      await fs.writeFile(this.signatureFilePath, JSON.stringify({signature}), 'utf8');
    } catch (error) {
      this.logger.warn(
        `${this.prefix} failed to persist signature: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private mapPriority(level: number): number {
    if (level >= 3) {
      return 3;
    }
    if (level === 2) {
      return 2;
    }

    return 1;
  }

  private buildEventPayload(warningsResponse: WarningsResponsePayload): Record<string, string> | null {
    const primaryWarning: WarningPayload | null = this.pickPrimaryWarning(warningsResponse.getWarnings());
    if (!primaryWarning) {
      return null;
    }

    const probability = primaryWarning.getProbability();
    const title = `Pogoda: ${warningsResponse.phenomenonName} ${probability}%`;

    const messageParts = [primaryWarning.getContent()];
    if (primaryWarning.getComment()) {
      messageParts.push(primaryWarning.getComment());
    }
    const message = messageParts.filter(Boolean).join(' ');

    const descriptionParts = [`przewidywane zakończenie: ${warningsResponse.estimatedEndTime}`];
    if (primaryWarning.getComment()) {
      descriptionParts.push(`komentarz: ${primaryWarning.getComment()}`);
    }
    if (warningsResponse.lastUpdate) {
      descriptionParts.push(`ostatnia aktualizacja: ${warningsResponse.lastUpdate.toISOString()}`);
    }
    const published = primaryWarning.getPublishDate();
    if (published) {
      descriptionParts.push(`opublikowano: ${published.toISOString()}`);
    }
    const description = descriptionParts.join(' | ');

    const severity: EventSeverity = 'warning';
    const priority = this.mapPriority(primaryWarning.getLevel());

    return {
      type: 'weather',
      severity,
      priority: String(priority),
      message,
      description,
      title,
    };
  }

  private async sendWarningEvent(warningsResponse: WarningsResponsePayload): Promise<boolean> {
    if (!Env.USER || !Env.PASSWORD) {
      this.logger.warn(`${this.prefix} event send skipped: missing USER or PASSWORD env`);
      return false;
    }

    const payload = this.buildEventPayload(warningsResponse);
    if (!payload) {
      return false;
    }

    await this.httpClient.execute(new PostWarningEventHttpQuery(payload));

    return true;
  }
}
