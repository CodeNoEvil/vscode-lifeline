import { StatusBarAlignment, StatusBarItem, window } from "vscode";
import { formatClock } from "../clock-format";
import { getConfig } from "../config";
import { Position } from "../constants";
import { ExtensionConfiguration } from "../interfaces";

export class Clock {
  private config: ExtensionConfiguration;
  private clock: StatusBarItem;
  private interval: NodeJS.Timeout;

  constructor(currentConfig: ExtensionConfiguration) {
    this.config = currentConfig;
    this.clock = this.createClock();
    this.interval = this.startClock();
    this.clock.show();
  }

  updateConfig(): void {
    this.config = getConfig();
    this.redraw();
  }

  dispose(): void {
    this.clock.dispose();
    clearInterval(this.interval);
  }

  private redraw(): void {
    this.dispose();
    this.clock = this.createClock();
    this.interval = this.startClock();
    this.clock.show();
  }

  private createClock(): StatusBarItem {
    return window.createStatusBarItem(StatusBarAlignment.Right, this.config.swap ? Position.LEFT : Position.RIGHT);
  }

  private startClock(): NodeJS.Timeout {
    const paint = (): void => {
      this.clock.text = formatClock(new Date(), this.config.clockFormat);
    };
    paint();
    return setInterval(paint, this.config.clockInterval);
  }
}
