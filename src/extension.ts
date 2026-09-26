import { ExtensionContext, workspace } from "vscode";
import { getConfig } from "./config";
import { Battery } from "./lifeline/battery";
import { Clock } from "./lifeline/clock";

export function activate(context: ExtensionContext): void {
  const config = getConfig();
  const clock = new Clock(config);
  const battery = new Battery(config);
  context.subscriptions.push(
    clock,
    battery,
    workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("lifeline")) {
        return;
      }
      clock.updateConfig();
      battery.updateConfig();
    }),
  );
}

export function deactivate(): void {
  return undefined;
}
