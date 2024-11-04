import { ContainerModule, interfaces } from "inversify";
import Bind = interfaces.Bind;
import { MeteorologicController } from "../../controllers/MeteorologicController";

export const controllerModule = new ContainerModule((bind: Bind) => {
  bind<MeteorologicController>(MeteorologicController)
    .toSelf()
    .inSingletonScope();
});
