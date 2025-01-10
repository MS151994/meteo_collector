import {str} from 'envalid';

export default {
  IMGW_API_HOST: str({default: 'https://danepubliczne.imgw.pl/api/data/warningsmeteo', desc: 'IMGW API'}),
  LOG_LEVEL: str({default: 'debug', desc: 'Log level'}),
  ICON_PATH: str({default: '/', desc: 'icon location'}),
  ICON_MIME_TYPE: str({default: '.png', desc: 'icon extension'}),
};
