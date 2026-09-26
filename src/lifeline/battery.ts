import { StatusBarAlignment, StatusBarItem, window } from "vscode";
import { getConfig } from "../config";
import { Position } from "../constants";
import { ExtensionConfiguration } from "../interfaces";
import { formatBattery, readBattery } from "../power";

export class Battery {
  private config: ExtensionConfiguration;
  private item: StatusBarItem | undefined;
  private interval: NodeJS.Timeout;

  constructor(currentConfig: ExtensionConfiguration) {
    this.config = currentConfig;
    void this.refresh();
    this.interval = setInterval(() => {
      void this.refresh();
    }, this.config.batteryInterval);
  }

  updateConfig(): void {
    this.config = getConfig();
    this.restart();
    if (!this.item) {
      return;
    }
    const text = this.item.text;
    const tooltip = this.item.tooltip;
    this.item.dispose();
    this.item = this.createItem();
    this.item.text = text;
    this.item.tooltip = tooltip;
    this.item.show();
  }

  dispose(): void {
    clearInterval(this.interval);
    this.item?.dispose();
    this.item = undefined;
  }

  private restart(): void {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      void this.refresh();
    }, this.config.batteryInterval);
  }

  private createItem(): StatusBarItem {
    return window.createStatusBarItem(StatusBarAlignment.Right, this.config.swap ? Position.RIGHT : Position.LEFT);
  }

  private hide(): void {
    this.item?.dispose();
    this.item = undefined;
  }

  private async refresh(): Promise<void> {
    const probe = await readBattery();
    if (!probe.ok) {
      return;
    }
    if (!probe.reading) {
      this.hide();
      return;
    }
    if (!this.item) {
      this.item = this.createItem();
    }
    this.item.text = formatBattery(probe.reading);
    this.item.tooltip = probe.reading.charging ? "Charging" : "On battery";
    this.item.show();
  }
}
