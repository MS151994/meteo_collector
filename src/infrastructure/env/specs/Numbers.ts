import {num} from 'envalid';

export default {
  API_PORT: num({default: 8080, desc: 'api port'}),
};
