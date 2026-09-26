import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatClock } from "../clock-format";
import { formatBattery, parseLinuxBattery, parsePmset, parseWindowsBattery } from "../power";

const IMAC = "Now drawing from 'AC Power'\n";

const MACBOOK_CHARGING = [
  "Now drawing from 'AC Power'",
  " -InternalBattery-0 (id=4063443)\t83%; charging; 0:48 remaining present: true",
  "",
].join("\n");

const MACBOOK_EMPTY = [
  "Now drawing from 'Battery Power'",
  " -InternalBattery-0 (id=4063443)\t0%; discharging; 0:00 remaining present: true",
  "",
].join("\n");

const MACBOOK_CHARGED = [
  "Now drawing from 'AC Power'",
  " -InternalBattery-0 (id=4063443)\t100%; charged; 0:00 remaining present: true",
  "",
].join("\n");

describe("parsePmset", () => {
  it("treats a desktop Mac with no percentage line as no battery", () => {
    assert.equal(parsePmset(IMAC), null);
  });

  it("reads a charging laptop", () => {
    assert.deepEqual(parsePmset(MACBOOK_CHARGING), { percent: 83, charging: true });
    assert.equal(formatBattery({ percent: 83, charging: true }), "+83%");
  });

  it("keeps a real empty battery visible", () => {
    assert.deepEqual(parsePmset(MACBOOK_EMPTY), { percent: 0, charging: false });
    assert.equal(formatBattery({ percent: 0, charging: false }), "0%");
  });

  it("does not mark a full battery as charging", () => {
    assert.deepEqual(parsePmset(MACBOOK_CHARGED), { percent: 100, charging: false });
  });
});

describe("other platforms", () => {
  it("treats empty Windows output as no battery", () => {
    assert.equal(parseWindowsBattery(""), null);
    assert.equal(parseWindowsBattery("null"), null);
  });

  it("reads a Windows battery", () => {
    const output = JSON.stringify({ EstimatedChargeRemaining: 41, BatteryStatus: 1 });
    assert.deepEqual(parseWindowsBattery(output), { percent: 41, charging: false });
  });

  it("reads a charging Windows battery from an array", () => {
    const output = JSON.stringify([{ EstimatedChargeRemaining: 70, BatteryStatus: 6 }]);
    assert.deepEqual(parseWindowsBattery(output), { percent: 70, charging: true });
  });

  it("reads Linux sysfs", () => {
    assert.deepEqual(parseLinuxBattery("55\n", "Discharging\n"), { percent: 55, charging: false });
    assert.deepEqual(parseLinuxBattery("12\n", "Charging\n"), { percent: 12, charging: true });
    assert.equal(parseLinuxBattery("nope", "Charging"), null);
  });
});

describe("formatClock", () => {
  const evening = new Date(2026, 8, 25, 21, 4, 5);

  it("formats the default clock pattern", () => {
    assert.equal(formatClock(evening, "h:mm:ss A"), "9:04:05 PM");
  });

  it("keeps bracketed text literal", () => {
    assert.equal(formatClock(evening, "[h]:mm"), "h:04");
  });
});
