import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import {WeatherApplication} from './WeatherApplication';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import Env from '../infrastructure/env/Env';
import {HomeAssistantMqttService} from '../infrastructure/mqtt/HomeAssistantMqttService';
import {WarningsHistoryService} from '../services/WarningsHistoryService';
import {WarningNotifier} from '../services/WarningNotifier';

@injectable()
export class WarningsPipeline {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.WeatherApplication)
  private readonly weatherApplication: WeatherApplication;

  @inject(TYPES.HomeAssistantMqttService)
  private readonly haMqttService: HomeAssistantMqttService;

  @inject(TYPES.WarningsHistoryService)
  private readonly history: WarningsHistoryService;

  @inject(TYPES.WarningNotifier)
  private readonly notifier: WarningNotifier;

  private readonly prefix: string = '[Meteorologic Collector]';

  public async run(): Promise<void> {
    try {
      const warnings = await this.weatherApplication.getWarnings(Env.WARNINGS_TERRITORY);
      this.logger.info(`${this.prefix} pipeline warnings response: ${JSON.stringify(warnings)}`);

      await this.history.record(warnings);
      await this.notifier.notifyNew(warnings);
      await this.publishToHomeAssistantMqtt(warnings);
    } catch (error) {
      this.logger.error(`${this.prefix} pipeline error: ${error instanceof Error ? error.message : String(error)}`);
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
}
