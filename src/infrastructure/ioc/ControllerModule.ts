import {ContainerModule, interfaces} from 'inversify';
import {MeteorologicController} from '../../controllers/MeteorologicController';

export const controllerModule = new ContainerModule((bind: interfaces.Bind): void => {
  bind<MeteorologicController>(MeteorologicController).toSelf().inSingletonScope();
});
