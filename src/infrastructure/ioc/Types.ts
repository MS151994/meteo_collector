const TYPES = {
  WeatherApplication: Symbol.for('WeatherApplication'),
  WeatherService: Symbol.for('WeatherService'),
  WarningsCronService: Symbol.for('WarningsCronService'),
  HomeAssistantMqttService: Symbol.for('HomeAssistantMqttService'),
  MqttClient: Symbol.for('MqttClient'),
  Logger: Symbol.for('Logger'),
  HttpClient: Symbol.for('HttpClient'),
  LocationHelper: Symbol.for('LocationHelper'),
  TimeHelper: Symbol.for('TimeHelper'),
  StylesPlugin: Symbol.for('StylesPlugin'),
};

export {TYPES};
