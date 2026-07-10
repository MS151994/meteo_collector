import {str} from 'envalid';

export default {
  IMGW_API_HOST: str({default: 'https://danepubliczne.imgw.pl/api/data/warningsmeteo', desc: 'IMGW API'}),
  LOG_LEVEL: str({default: 'debug', desc: 'Log level'}),
  ICON_PATH: str({default: '/', desc: 'icon location'}),
  ICON_MIME_TYPE: str({default: '.png', desc: 'icon extension'}),
  WARNINGS_TERRITORY: str({devDefault: 'zduńskowolski', desc: 'Default warnings territory'}),
  WARNINGS_CRON_SCHEDULE: str({devDefault: '*/3 * * * *', desc: 'Cron schedule for warnings polling'}),
  USER: str({default: '', desc: 'Default user'}),
  PASSWORD: str({default: '', desc: 'Default password'}),
  EVENT_GATEWAY: str({default: '', devDefault: 'localhost', desc: 'Event url'}),

  REDIS_URL: str({
    default: '',
    desc: 'Redis URL for shared state (e.g. redis://redis:6379); empty = in-memory dedup only',
  }),

  MQTT_URL: str({default: '', desc: 'MQTT broker URL (e.g. mqtt://emqx:1883)'}),
  MQTT_USERNAME: str({devDefault: 'meteocollector-client', desc: 'MQTT username'}),
  MQTT_PASSWORD: str({devDefault: 'meteocollector-client', desc: 'MQTT password'}),
  MQTT_CLIENT_ID: str({default: 'meteocollector_4ddb094d19c328', desc: 'MQTT client id (empty = auto-generated)'}),
  MQTT_BASE_TOPIC: str({default: 'meteocollector', desc: 'Base topic prefix for publishing'}),

  HA_MQTT_DISCOVERY_PREFIX: str({default: 'homeassistant', desc: 'Home Assistant MQTT discovery prefix'}),
  HA_MQTT_DEVICE_ID: str({default: 'meteocollector', desc: 'Device id/identifier for HA MQTT device'}),
  HA_MQTT_DEVICE_NAME: str({default: 'Meteo Collector', desc: 'Device name shown in Home Assistant'}),
  HA_MQTT_DEVICE_MODEL: str({default: 'IMGW Meteo Warnings', desc: 'Device model shown in Home Assistant'}),
  HA_MQTT_DEVICE_MANUFACTURER: str({default: 'MeteoCollector', desc: 'Device manufacturer shown in Home Assistant'}),
  HA_MQTT_SENSOR_NAME: str({default: 'meteo_collector', desc: 'MQTT sensor name shown in Home Assistant'}),
  HA_MQTT_UNIQUE_ID: str({default: '', desc: 'Optional unique_id override for the sensor'}),
};
