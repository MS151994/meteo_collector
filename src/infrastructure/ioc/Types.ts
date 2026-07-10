const TYPES = {
  WeatherApplication: Symbol.for('WeatherApplication'),
  WarningsPipeline: Symbol.for('WarningsPipeline'),
  WeatherService: Symbol.for('WeatherService'),
  WarningsCronWorker: Symbol.for('WarningsCronWorker'),
  WarningsHistoryService: Symbol.for('WarningsHistoryService'),
  NotificationEventService: Symbol.for('NotificationEventService'),
  WarningNotificationFactory: Symbol.for('WarningNotificationFactory'),
  WarningNotifier: Symbol.for('WarningNotifier'),
  HomeAssistantMqttService: Symbol.for('HomeAssistantMqttService'),
  MqttClient: Symbol.for('MqttClient'),
  RedisClient: Symbol.for('RedisClient'),
  LoggerService: Symbol.for('LoggerService'),
  AsyncLocalStorageService: Symbol.for('AsyncLocalStorageService'),
  HttpClient: Symbol.for('HttpClient'),
  LocationHelper: Symbol.for('LocationHelper'),
  WarningSignatureHelper: Symbol.for('WarningSignatureHelper'),
  TimeHelper: Symbol.for('TimeHelper'),
  StylesPlugin: Symbol.for('StylesPlugin'),
};

export {TYPES};
