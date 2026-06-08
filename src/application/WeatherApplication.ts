import {inject, injectable} from 'inversify';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {Territory} from '../infrastructure/types/territory';
import {TYPES} from '../infrastructure/ioc/Types';
import {WarningsService} from '../services/WarningsService';
import {StylesPlugin} from '../plugin/StylesPlugin';
import Env from '../infrastructure/env/Env';
import {LoggerService} from '../infrastructure/logger/LoggerService';

@injectable()
export class WeatherApplication {
  @inject(TYPES.WeatherService)
  private readonly warningsService: WarningsService;

  @inject(TYPES.StylesPlugin)
  private readonly plugin: StylesPlugin;

  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  protected readonly prefix: string = 'WeatherApplication';

  public async getWarnings(territory: Territory): Promise<WarningsResponsePayload> {
    this.logger.info(`[${this.prefix}] Get weather warnings for: ${territory} from: IMGW API`);
    const warnings: WarningsResponsePayload = await this.warningsService.getLocalWarnings(territory);

    if (!warnings.getWarnings().length) {
      this.logger.warning(`[${this.prefix}] Not found warnings for given location (${territory})`);

      warnings.setErrorMessage(`Not found warnings for given location (${territory})`);
    }

    if (Env.ENABLE_WARNINGS_STYLES_PLUGIN) {
      this.plugin.setStyles(warnings.getWarnings());
    }

    return warnings;
  }
}
