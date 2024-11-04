import { Container } from "inversify";
import { WarningsService } from "../../services/WarningsService";
import { TYPES } from "./Types";
import { controllerModule } from "./ControllerModule";
import winston, { Logger } from "winston";
import { LoggerSettings } from "../logger/LoggerSettings";
import { Parser } from "../../utils/Parser";
import { HttpClient } from "../http/HttpClient";
import { WarningRepository } from "../repository/WarningRepository";
import { LocationHelper } from "../../helper/LocationHelper";
import { TimeHelper } from "../../helper/TimeHelper";

export const bind = (container: Container): void => {
  container.load(controllerModule);
  //Services
  container
    .bind<WarningsService>(TYPES.WeatherService)
    .to(WarningsService)
    .inSingletonScope();

  //Helpers
  container
    .bind<LocationHelper>(TYPES.LocationHelper)
    .to(LocationHelper)
    .inSingletonScope();
  container
    .bind<TimeHelper>(TYPES.TimeHelper)
    .to(TimeHelper)
    .inSingletonScope();
  //Repository
  container
    .bind<WarningRepository>(TYPES.WarningRepository)
    .to(WarningRepository)
    .inSingletonScope();
  //Http Client
  container
    .bind<HttpClient>(TYPES.HttpClient)
    .to(HttpClient)
    .inSingletonScope();
  //Logger
  container
    .bind<Logger>(TYPES.Logger)
    .toConstantValue(winston.createLogger(LoggerSettings));

  //Parser
  container.bind<Parser>(TYPES.Parser).to(Parser).inSingletonScope();
};
