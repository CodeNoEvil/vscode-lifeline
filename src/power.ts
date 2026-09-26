import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface BatteryReading {
  percent: number;
  charging: boolean;
}

export type BatteryProbe =
  | { ok: true; reading: BatteryReading | null }
  | { ok: false };

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** A battery exists only when pmset prints a charge percentage. Desktop Macs do not. */
export function parsePmset(output: string): BatteryReading | null {
  const match = output.match(/(\d+(?:\.\d+)?)\s*%\s*;\s*([^;\n]+)/);
  if (!match) {
    return null;
  }
  const state = match[2].trim().toLowerCase();
  return {
    percent: clampPercent(Number(match[1])),
    charging: state === "charging" || state === "finishing charge",
  };
}

export function parseWindowsBattery(output: string): BatteryReading | null {
  const trimmed = output.trim();
  if (!trimmed || trimmed === "null") {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  const row = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!row || typeof row !== "object") {
    return null;
  }
  const record = row as { EstimatedChargeRemaining?: unknown; BatteryStatus?: unknown };
  const status = Number(record.BatteryStatus);
  const percent = Number(record.EstimatedChargeRemaining);
  if (!Number.isFinite(status) || status === 10 || !Number.isFinite(percent)) {
    return null;
  }
  return {
    percent: clampPercent(percent),
    charging: status >= 6 && status <= 9,
  };
}

export function parseLinuxBattery(capacityText: string, statusText: string): BatteryReading | null {
  const percent = Number(capacityText.trim());
  if (!Number.isFinite(percent)) {
    return null;
  }
  return {
    percent: clampPercent(percent),
    charging: statusText.trim().toLowerCase() === "charging",
  };
}

export function formatBattery(reading: BatteryReading): string {
  const mark = reading.charging ? "+" : "";
  return `${mark}${reading.percent}%`;
}

async function run(command: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync(command, args, {
    timeout: 5000,
    windowsHide: true,
    encoding: "utf8",
  });
  return stdout;
}

async function readLinuxBattery(): Promise<BatteryReading | null> {
  const root = "/sys/class/power_supply";
  let names: string[];
  try {
    names = await readdir(root);
  } catch {
    return null;
  }
  const batteries = names.filter((name) => name.startsWith("BAT")).sort();
  for (const name of batteries) {
    try {
      const capacity = await readFile(`${root}/${name}/capacity`, "utf8");
      const status = await readFile(`${root}/${name}/status`, "utf8");
      const reading = parseLinuxBattery(capacity, status);
      if (reading) {
        return reading;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function readBattery(platform: NodeJS.Platform = process.platform): Promise<BatteryProbe> {
  try {
    if (platform === "darwin") {
      return { ok: true, reading: parsePmset(await run("pmset", ["-g", "batt"])) };
    }
    if (platform === "win32") {
      const script = "Get-CimInstance Win32_Battery | Select-Object EstimatedChargeRemaining, BatteryStatus | ConvertTo-Json -Compress";
      return { ok: true, reading: parseWindowsBattery(await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script])) };
    }
    if (platform === "linux") {
      return { ok: true, reading: await readLinuxBattery() };
    }
    return { ok: true, reading: null };
  } catch {
    return { ok: false };
  }
}
