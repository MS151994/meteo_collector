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
        return "yellow";
      }
      case 2: {
        return "orange";
      }
      case 3: {
        return "red";
      }
      default: {
        return "green";
      }
    }
  }

  private setIcon(level: number) {
    const iconLocation: string = process.env.ICON_LOCATION ?? "/";
    const extension: string = process.env.ICON_EXTENSION ?? "";

    switch (level) {
      case 1: {
        return `${iconLocation}/code-yellow${extension}`;
      }
      case 2: {
        return `${iconLocation}/code-orange${extension}`;
      }
      case 3: {
        return `${iconLocation}/code-red${extension}`;
      }
      default: {
        return `${iconLocation}/code-green${extension}`;
      }
    }
  }
}
