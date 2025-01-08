export class WarningStyle {
  private color: string;
  private icon: string;

  public constructor(level: number) {
    this.color = this.setColor(level);
    this.icon = this.setIcon(level);
  }

  private setColor(level: number) {
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

  private setIcon(level: number) {
    const iconLocation: string = process.env.ICON_LOCATION ?? '/';
    const mime: string = process.env.ICON_MIME ?? '';

    switch (level) {
      case 1: {
        return `${iconLocation}/code-yellow${mime}`;
      }
      case 2: {
        return `${iconLocation}/code-orange${mime}`;
      }
      case 3: {
        return `${iconLocation}/code-red${mime}`;
      }
      default: {
        return `${iconLocation}/code-green${mime}`;
      }
    }
  }
}
