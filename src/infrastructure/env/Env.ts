import {cleanEnv} from 'envalid';
import Booleans from './specs/Booleans';
import Strings from './specs/Strings';
import Numbers from './specs/Numbers';

const Env = cleanEnv(process.env, {
  ...Booleans,
  ...Strings,
  ...Numbers,
});

export default Env;
