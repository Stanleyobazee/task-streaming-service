import * as utc from "dayjs/plugin/utc";
import * as dayjs from "dayjs";
import { ManipulateType } from "dayjs";
dayjs.extend(utc);

export function CurrentTime(): Date {
  return dayjs().toDate();
}

export function CurrentTimeAdd(value: number, unit: ManipulateType): string {
  return dayjs().add(value, unit).format();
}

export function daysFromToday(date: Date): number {
  return dayjs(CurrentTime()).diff(date, "days");
}

export const Dayjs = dayjs;
