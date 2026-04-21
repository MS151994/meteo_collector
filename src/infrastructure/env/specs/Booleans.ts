import {bool} from 'envalid';

export default {
  ENABLE_WARNINGS_STYLES_PLUGIN: bool({default: false, desc: 'Switch for styles for each warnings '}),
  ENABLE_WARNINGS_CRON: bool({default: true, desc: 'Enable cron-based warnings notifications'}),
  ENABLE_HA_MQTT: bool({default: false, desc: 'Enable Home Assistant MQTT Discovery + state publishing'}),
  HA_MQTT_ENABLE_AVAILABILITY: bool({default: true, desc: 'Publish MQTT availability (online/offline) for HA entity'}),
};
