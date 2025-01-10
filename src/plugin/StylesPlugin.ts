import {WarningPayload} from '../payloads/WarningPayload';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {Logger} from 'winston';

@injectable()
export class StylesPlugin {
  @inject(TYPES.Logger)
  private readonly logger: Logger;

  protected readonly prefix: string = 'PluginModule';

  public setStyles(warnings: WarningPayload[]): void {
    this.logger.debug(`[${this.prefix}] Set styles for each warnings`);
    for (const warning of warnings) {
      warning.setStyle(warning.getLevel());
    }
  }
}
