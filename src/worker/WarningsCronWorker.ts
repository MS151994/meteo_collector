import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import Env from '../infrastructure/env/Env';
import cron from 'node-cron';
import {HomeAssistantMqttService} from '../services/HomeAssistantMqttService';
import {WarningsPipeline} from '../application/WarningsPipeline';

@injectable()
export class WarningsCronWorker {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.HomeAssistantMqttService)
  private readonly haMqttService: HomeAssistantMqttService;

  @inject(TYPES.WarningsPipeline)
  private readonly pipeline: WarningsPipeline;

  private readonly prefix: string = '[Meteorologic Collector]';

  public start(): void {
    cron.schedule(Env.WARNINGS_CRON_SCHEDULE, (): void => {
      void this.pipeline.run();
    });

    this.logger.info(
      `${this.prefix} cron scheduled: ${Env.WARNINGS_CRON_SCHEDULE} with territory ${Env.WARNINGS_TERRITORY}`,
    );

    if (Env.ENABLE_HA_MQTT) {
      void this.haMqttService.start().catch((error: unknown) => {
        this.logger.error(`${this.prefix} mqtt start error: ${error instanceof Error ? error.message : String(error)}`);
      });
    }

    void this.pipeline.run();
  }
}
