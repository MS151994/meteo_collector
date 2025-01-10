import 'reflect-metadata';
import {createExpressServer, useContainer} from 'routing-controllers';
import {container} from './infrastructure/ioc/Container';
import {MeteorologicController} from './controllers/MeteorologicController';
import {Logger} from 'winston';
import {TYPES} from './infrastructure/ioc/Types';
import * as pack from '../package.json';

const prefix = '[Meteorologic Collector]';
useContainer(container);

const logger: Logger = container.get<Logger>(TYPES.Logger);

const app = createExpressServer({
  controllers: [MeteorologicController],
  defaults: {
    undefinedResultCode: 404,
  },
});

app.listen(process.env.PORT || 8080, (): void => {
  logger
    .info(`${prefix} started with version: v${pack.version}`)
    .info(`${prefix} log level is set to ${process.env.LOG_LEVEL ?? 'debug'}`)
    .info(`${prefix} listen on port ${process.env.PORT ?? 8080}`);
  if (process.env.ENABLE_ICON === 'true') {
    logger.info(
      `${prefix} enabled icon with config: ${JSON.stringify({
        path: process.env.ICON_LOCATION,
        mimeType: process.env.ICON_MIME,
      })}`,
    );
  }
});
