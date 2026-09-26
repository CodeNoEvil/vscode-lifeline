# Lifeline

A Visual Studio Code extension that shows a clock and, on a machine that has one, the battery in the status bar.

Upstream [hugginsio/vscode-lifeline](https://github.com/hugginsio/vscode-lifeline) was last released as 1.2.0 in December 2020 and archived in 2022. This fork is the 2.0.0 continuation.

## Features

The clock sits at the right of the status bar. The battery sits just to its left, and shows `+` while charging (`+83%`). Swap that order in the settings.

Desktops are not given a fake battery. On macOS the extension reads `pmset -g batt` and shows a percentage only when that output contains one. An iMac that reports `Now drawing from 'AC Power'` and nothing else stays clock-only. A laptop at a real `0%` still shows `0%`.

The same rule is applied on Windows (`Win32_Battery`) and Linux (`/sys/class/power_supply/BAT*`). A failed read leaves the previous indicator alone instead of flashing `0%`.

## Configuration

### `lifeline.battery.interval`

Polling interval for the battery, in milliseconds. Default `3000`. Ignored when no battery is present.

### `lifeline.clock.format`

Clock format. Default `h:mm:ss A`. Tokens follow the common moment set (`h`, `hh`, `H`, `HH`, `m`, `mm`, `s`, `ss`, `A`, `a`, plus `YYYY`, `MM`, `DD`, `ddd`, `MMMM`). Put literal text in `[brackets]`.

### `lifeline.clock.interval`

Polling interval for the clock, in milliseconds. Default `1000`.

### `lifeline.swap`

Swap the battery and the clock. Default `false`. Ignored when no battery is present.

## Preview

| Device unplugged | Device charging |
| - | - |
| ![Device unplugged](./media/device-unplugged.png) | ![Device charging](./media/device-charging.png) |
