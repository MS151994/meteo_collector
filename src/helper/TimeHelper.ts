import {injectable} from "inversify";

@injectable()
export class TimeHelper {
  public getDurationTime(dateTo: Date | null): string {
    let diff = ``;
    if (dateTo) {
      let diffMs = dateTo.getTime() - new Date().getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      diffMs -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      diffMs -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diffMs / (1000 * 60));

      if (days) {
        diff += `${days} dzień${days !== 1 ? "i" : ""} `;
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
}
