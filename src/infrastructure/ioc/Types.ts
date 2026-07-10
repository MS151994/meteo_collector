const TYPES = {
  WeatherApplication: Symbol.for('WeatherApplication'),
  WeatherService: Symbol.for('WeatherService'),
  WarningsCronService: Symbol.for('WarningsCronService'),
  WarningsHistoryService: Symbol.for('WarningsHistoryService'),
  HomeAssistantMqttService: Symbol.for('HomeAssistantMqttService'),
  MqttClient: Symbol.for('MqttClient'),
  RedisClient: Symbol.for('RedisClient'),
  LoggerService: Symbol.for('LoggerService'),
  AsyncLocalStorageService: Symbol.for('AsyncLocalStorageService'),
  HttpClient: Symbol.for('HttpClient'),
  LocationHelper: Symbol.for('LocationHelper'),
  TimeHelper: Symbol.for('TimeHelper'),
  StylesPlugin: Symbol.for('StylesPlugin'),
};

export {TYPES};
