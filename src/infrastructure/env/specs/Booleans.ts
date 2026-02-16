import {bool} from 'envalid';

export default {
  ENABLE_WARNINGS_STYLES_PLUGIN: bool({default: false, desc: 'Switch for styles for each warnings '}),
  ENABLE_WARNINGS_CRON: bool({default: true, desc: 'Enable cron-based warnings notifications'}),
};
