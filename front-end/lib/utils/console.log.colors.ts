/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/utils/console.ts
export const Colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

export function logColor(
  label: string,
  value: any,
  colorLabel = Colors.green,
  colorValue = Colors.cyan
) {
  console.log(
    `${colorLabel}${label}:${Colors.reset} ${colorValue}${value}${Colors.reset}`
  );
}
