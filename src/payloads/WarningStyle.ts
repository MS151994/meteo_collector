import Env from '../infrastructure/env/Env';
import {WarnLevelStyle} from '../infrastructure/types/warnLevelStyle';

export class WarningStyle {
  private color: string;
  private icon: string;

  public constructor(level: number) {
    this.color = this.setColor(level);
    this.icon = this.setIcon(level);
  }

  private setColor(level: number): WarnLevelStyle {
    switch (level) {
      case 1: {
        return 'yellow';
      }
      case 2: {
        return 'orange';
      }
      case 3: {
        return 'red';
      }
      default: {
        return 'green';
      }
    }
  }

  private setIcon(level: number): string {
    const path: string = Env.ICON_PATH;
    const mime: string = Env.ICON_MIME_TYPE;

    switch (level) {
      case 1: {
        return `${path}/code-yellow${mime}`;
      }
      case 2: {
        return `${path}/code-orange${mime}`;
      }
      case 3: {
        return `${path}/code-red${mime}`;
      }
      default: {
        return `${path}/code-green${mime}`;
      }
    }
  }
}
