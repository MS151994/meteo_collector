import {str} from 'envalid';

export default {
  IMGW_API_HOST: str({default: 'https://danepubliczne.imgw.pl/api/data/warningsmeteo', desc: 'IMGW API'}),
  LOG_LEVEL: str({default: 'debug', desc: 'Log level'}),
  ICON_PATH: str({default: '/', desc: 'icon location'}),
  ICON_MIME_TYPE: str({default: '.png', desc: 'icon extension'}),
  WARNINGS_TERRITORY: str({devDefault: 'zduńskowolski', desc: 'Default warnings territory'}),
  WARNINGS_CRON_SCHEDULE: str({devDefault: '*/30 * * * *', desc: 'Cron schedule for warnings polling'}),
  USER: str({default: '', desc: 'Default user'}),
  PASSWORD: str({default: '', desc: 'Default password'}),
  EVENT_GATEWAY: str({default: '', devDefault: 'localhost', desc: 'Event url'}),
};
