import { workspace } from "vscode";
import { ExtensionConfiguration } from "./interfaces";

export function getConfig(): ExtensionConfiguration {
  const config = workspace.getConfiguration("lifeline");
  return {
    swap: config.get("swap", false),
    clockFormat: config.get("clock.format", "h:mm:ss A"),
    clockInterval: Math.max(1000, config.get("clock.interval", 1000)),
    batteryInterval: Math.max(1000, config.get("battery.interval", 3000)),
  };
}
