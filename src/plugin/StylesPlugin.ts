import {WarningPayload} from '../payloads/WarningPayload';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {LoggerService} from '../infrastructure/logger/LoggerService';

@injectable()
export class StylesPlugin {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  protected readonly prefix: string = 'PluginModule';

  public setStyles(warnings: WarningPayload[]): void {
    this.logger.debug(`[${this.prefix}] Set styles for each warnings`);
    for (const warning of warnings) {
      warning.setStyle(warning.getLevel());
    }
  }
}
