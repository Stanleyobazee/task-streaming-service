import { Dayjs } from "./date";

interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function ToDate(value: string): Date {
  return Dayjs(value).toDate();
}

export function ToNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);
  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}

export function ToBoolean(value: string): boolean {
  return value === "true";
}
