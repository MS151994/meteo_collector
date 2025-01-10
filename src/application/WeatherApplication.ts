import {inject, injectable} from 'inversify';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {Territory} from '../infrastructure/types/territory';
import {TYPES} from '../infrastructure/ioc/Types';
import {WarningsService} from '../services/WarningsService';
import {Logger} from 'winston';
import {StylesPlugin} from '../plugin/StylesPlugin';
import Env from '../infrastructure/env/Env';

@injectable()
export class WeatherApplication {
  @inject(TYPES.WeatherService)
  private readonly warningsService: WarningsService;

  @inject(TYPES.StylesPlugin)
  private readonly plugin: StylesPlugin;

  @inject(TYPES.Logger)
  private readonly logger: Logger;

  protected readonly prefix: string = 'WeatherApplication';

  public async getWarnings(territory: Territory): Promise<WarningsResponsePayload> {
    this.logger.info(`[${this.prefix}] Get weather warnings for: ${territory} from: IMGW API`);
    const warnings: WarningsResponsePayload = await this.warningsService.getLocalWarnings(territory);

    if (!warnings.getWarnings().length) {
      this.logger.warn(`[${this.prefix}] Not found warnings for given location (${territory})`);

      warnings.setErrorMessage(`Not found warnings for given location (${territory})`);
    }

    if (Env.ENABLE_WARNINGS_STYLES_PLUGIN) {
      this.plugin.setStyles(warnings.getWarnings());
    }

    return warnings;
  }
}
