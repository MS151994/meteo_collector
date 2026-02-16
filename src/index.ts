import 'reflect-metadata';
import {createExpressServer, useContainer} from 'routing-controllers';
import {container} from './infrastructure/ioc/Container';
import {MeteorologicController} from './controllers/MeteorologicController';
import {Logger} from 'winston';
import {TYPES} from './infrastructure/ioc/Types';
import * as pack from '../package.json';
import Env from './infrastructure/env/Env';
import {WarningsCronService} from './services/WarningsCronService';

const prefix = '[Meteorologic Collector]';
useContainer(container);

const logger: Logger = container.get<Logger>(TYPES.Logger);
const warningsCronService: WarningsCronService = container.get<WarningsCronService>(TYPES.WarningsCronService);

const app = createExpressServer({
  controllers: [MeteorologicController],
  defaults: {
    undefinedResultCode: 404,
  },
});

app.listen(Env.API_PORT, (): void => {
  logger
    .info(`${prefix} started with version: v${pack.version}`)
    .info(`${prefix} log level is set to: ${Env.LOG_LEVEL.toUpperCase()}`)
    .info(`${prefix} listen on port: ${Env.API_PORT}`)
    .info(`${prefix} warnings styles plugins: ${Env.ENABLE_WARNINGS_STYLES_PLUGIN}`);
});

if (Env.ENABLE_WARNINGS_CRON) {
  warningsCronService.start();
} else {
  logger.info(`${prefix} cron disabled via ENABLE_WARNINGS_CRON`);
}
