import {injectable} from 'inversify';
import Env from '../infrastructure/env/Env';

@injectable()
export class TimeHelper {
  public getDurationTime(dateTo: Date | null): string {
    let diff: string = ``;
    if (dateTo) {
      let diffMs: number = dateTo.getTime() - new Date().getTime();
      const days: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      diffMs -= days * (1000 * 60 * 60 * 24);
      const hours: number = Math.floor(diffMs / (1000 * 60 * 60));
      diffMs -= hours * (1000 * 60 * 60);
      const minutes: number = Math.floor(diffMs / (1000 * 60));

      if (days) {
        diff += `${days} dzień${days !== 1 ? 'i' : ''} `;
      }
      if (hours) {
        diff += `${hours} godzin `;
      }
      if (minutes) {
        diff += `${minutes} min`;
      }

      return diff;
    }
    return diff;
  }

  public formatLocal(date: Date): string {
    return date.toLocaleString('pl-PL', {
      timeZone: Env.CRON_JOB_TIMEZONE,
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
