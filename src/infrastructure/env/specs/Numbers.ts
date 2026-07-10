import {num} from 'envalid';

export default {
  API_PORT: num({default: 8080, desc: 'api port'}),
  MQTT_QOS: num({default: 0, desc: 'MQTT QoS (0/1/2)'}),
  HISTORY_RETENTION_DAYS: num({default: 7, desc: 'How many days of warnings history to keep'}),
};
