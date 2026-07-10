import {ContainerModule, interfaces} from 'inversify';
import {MeteorologicController} from '../../controllers/MeteorologicController';
import {HealthController} from '../../controllers/HealthController';
import {HistoryController} from '../../controllers/HistoryController';

export const controllerModule = new ContainerModule((bind: interfaces.Bind): void => {
  bind<MeteorologicController>(MeteorologicController).toSelf().inSingletonScope();
  bind<HealthController>(HealthController).toSelf().inSingletonScope();
  bind<HistoryController>(HistoryController).toSelf().inSingletonScope();
});
