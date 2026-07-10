import {injectable} from 'inversify';
import {createHash} from 'crypto';
import {WarningPayload} from '../payloads/WarningPayload';

@injectable()
export class WarningSignatureHelper {
  public forHistory(warning: WarningPayload): string {
    return this.hash([warning.getContent(), warning.getLevel(), warning.getProbability()]);
  }

  public forNotification(warning: WarningPayload): string {
    return this.hash([
      warning.getPhenomenonName(),
      warning.getLevel(),
      warning.getProbability(),
      warning.getContent(),
      warning.getComment(),
    ]);
  }

  private hash(parts: Array<string | number>): string {
    return createHash('sha1').update(parts.join('|')).digest('hex');
  }
}
