import 'reflect-metadata';
import {createExpressServer, useContainer} from 'routing-controllers';
import {container} from './infrastructure/ioc/Container';
import {MeteorologicController} from './controllers/MeteorologicController';
import {HealthController} from './controllers/HealthController';
import {HistoryController} from './controllers/HistoryController';
import {TYPES} from './infrastructure/ioc/Types';
import * as pack from '../package.json';
import Env from './infrastructure/env/Env';
import {WarningsCronService} from './services/WarningsCronService';
import {LoggerService} from './infrastructure/logger/LoggerService';
import {AsyncLocalStorageService} from './infrastructure/middleware/AsyncLocalStorageService';

const prefix = '[Meteorologic Collector]';
useContainer(container);

const logger: LoggerService = container.get<LoggerService>(TYPES.LoggerService);
const warningsCronService: WarningsCronService = container.get<WarningsCronService>(TYPES.WarningsCronService);

const app = createExpressServer({
  controllers: [MeteorologicController, HealthController, HistoryController],
  middlewares: [AsyncLocalStorageService],
  defaults: {
    undefinedResultCode: 404,
  },
});

app.listen(Env.API_PORT, (): void => {
  logger.info(`${prefix} started with version: v${pack.version}`);
  logger.info(`${prefix} log level is set to: ${Env.LOG_LEVEL.toUpperCase()}`);
  logger.info(`${prefix} listen on port: ${Env.API_PORT}`);
  logger.info(`${prefix} warnings styles plugins: ${Env.ENABLE_WARNINGS_STYLES_PLUGIN}`);
});

if (Env.ENABLE_WARNINGS_CRON) {
  warningsCronService.start();
} else {
  logger.info(`${prefix} cron disabled via ENABLE_WARNINGS_CRON`);
}
