import {ContainerModule, interfaces} from 'inversify';
import {MeteorologicController} from '../../controllers/MeteorologicController';
import {HealthController} from '../../controllers/HealthController';

export const controllerModule = new ContainerModule((bind: interfaces.Bind): void => {
  bind<MeteorologicController>(MeteorologicController).toSelf().inSingletonScope();
  bind<HealthController>(HealthController).toSelf().inSingletonScope();
});
