import {Container} from 'inversify';
import {WarningsService} from '../../services/WarningsService';
import {TYPES} from './Types';
import {controllerModule} from './ControllerModule';
import winston, {Logger} from 'winston';
import {LoggerSettings} from '../logger/LoggerSettings';
import {HttpClient} from '../http/HttpClient';
import {LocationHelper} from '../../helper/LocationHelper';
import {TimeHelper} from '../../helper/TimeHelper';
import {WeatherApplication} from '../../application/WeatherApplication';
import {StylesPlugin} from '../../plugin/StylesPlugin';

export const bind = (container: Container): void => {
  container.load(controllerModule);
  //Application
  container.bind<WeatherApplication>(TYPES.WeatherApplication).to(WeatherApplication).inSingletonScope();

  //Services
  container.bind<WarningsService>(TYPES.WeatherService).to(WarningsService).inSingletonScope();

  //Helpers
  container.bind<LocationHelper>(TYPES.LocationHelper).to(LocationHelper).inSingletonScope();
  container.bind<TimeHelper>(TYPES.TimeHelper).to(TimeHelper).inSingletonScope();
  //Http Client
  container.bind<HttpClient>(TYPES.HttpClient).to(HttpClient).inSingletonScope();
  //Logger
  container.bind<Logger>(TYPES.Logger).toConstantValue(winston.createLogger(LoggerSettings));

  //Plugins
  container.bind<StylesPlugin>(TYPES.StylesPlugin).to(StylesPlugin).inSingletonScope();
};
