import {injectable} from 'inversify';
import {WarningPayload} from '../payloads/WarningPayload';
import {NotificationPayload} from '../payloads/NotificationPayload';
import {SeverityType} from '../infrastructure/enum/SeverityType';
import {PriorityType} from '../infrastructure/enum/PriorityType';
import {LabelType} from '../infrastructure/enum/LabelType';

@injectable()
export class WarningNotificationFactory {
  public fromWarning(warning: WarningPayload): NotificationPayload {
    return new NotificationPayload({
      type: 'weather',
      label: LabelType.NOTIFICATION,
      title: `Pogoda: ${warning.getPhenomenonName()} ${warning.getProbability()}%`,
      message: [warning.getContent(), warning.getComment()].filter(Boolean).join(' '),
      description: this.buildDescription(warning),
      severity: SeverityType.WARNING,
      priority: this.mapPriority(warning.getLevel()),
    });
  }

  private buildDescription(warning: WarningPayload): string {
    const parts = [`przewidywane zakończenie: ${warning.getDuration()}`];
    if (warning.getComment()) {
      parts.push(`komentarz: ${warning.getComment()}`);
    }
    const published = warning.getPublishDate();
    if (published) {
      parts.push(`opublikowano: ${published.toISOString()}`);
    }

    return parts.join(' | ');
  }

  private mapPriority(level: number): PriorityType {
    if (level >= 3) {
      return PriorityType.HIGH;
    }
    if (level === 2) {
      return PriorityType.MEDIUM;
    }

    return PriorityType.LOW;
  }
}
