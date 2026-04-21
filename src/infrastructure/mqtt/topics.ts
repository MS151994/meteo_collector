import Env from '../env/Env';

export const mqttDeviceId = (): string => {
  return Env.HA_MQTT_DEVICE_ID || 'meteocollector';
};

export const mqttUniqueId = (): string => {
  if (Env.HA_MQTT_UNIQUE_ID) {
    return Env.HA_MQTT_UNIQUE_ID;
  }

  return `${mqttDeviceId()}_warnings`;
};

export const mqttBaseTopic = (): string => {
  const base = Env.MQTT_BASE_TOPIC || 'meteocollector';
  return `${base}/${mqttDeviceId()}`;
};

export const mqttWarningsTopic = (): string => {
  return `${mqttBaseTopic()}/warnings`;
};

export const mqttStatusTopic = (): string => {
  return `${mqttBaseTopic()}/status`;
};

export const haDiscoveryTopic = (uniqueId: string = mqttUniqueId()): string => {
  const prefix = Env.HA_MQTT_DISCOVERY_PREFIX || 'homeassistant';
  return `${prefix}/sensor/${mqttDeviceId()}/${uniqueId}/config`;
};
