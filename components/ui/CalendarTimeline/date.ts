import type { CalendarTimelineDateInput } from "./types";

export function toDate(input: CalendarTimelineDateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

export function localeToBCP47(locale: string) {
  if (locale === "vi") return "vi-VN";
  if (locale === "en") return "en-US";
  if (locale === "ko") return "ko-KR";
  if (locale === "ja") return "ja-JP";
  return locale;
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
export function getDtf(locale: string, timeZone: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}__${timeZone}__${JSON.stringify(options)}`;
  const cached = dtfCache.get(key);
  if (cached) return cached;
  const dtf = new Intl.DateTimeFormat(locale, { timeZone, ...options });
  dtfCache.set(key, dtf);
  return dtf;
}

function getZonedParts(date: Date, timeZone: string) {
  const dtf = getDtf("en-US", timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function getIsoWeekInfo(date: Date, timeZone: string) {
  // ISO week number based on the calendar date in the provided timezone.
  const p = getZonedParts(date, timeZone);
  const target = new Date(Date.UTC(p.year, p.month - 1, p.day));

  // Monday = 0 ... Sunday = 6
  const dayNr = (target.getUTCDay() + 6) % 7;
  // Shift to Thursday in current week to determine ISO week-year
  target.setUTCDate(target.getUTCDate() - dayNr + 3);

  const isoYear = target.getUTCFullYear();
  // Week 1 is the week with Jan 4th (also a Thursday in ISO week logic)
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3);

  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return { year: isoYear, week };
}

function partsToUtcMs(p: { year: number; month: number; day: number; hour: number; minute: number; second: number }) {
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

function zonedTimeToUtcMs(
  args: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  timeZone: string,
) {
  let utc = partsToUtcMs(args);
  for (let i = 0; i < 3; i++) {
    const actual = getZonedParts(new Date(utc), timeZone);
    const diff = partsToUtcMs(args) - partsToUtcMs(actual);
    if (diff === 0) break;
    utc += diff;
  }
  return utc;
}

export function startOfZonedDay(date: Date, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  return new Date(zonedTimeToUtcMs({ ...p, hour: 0, minute: 0, second: 0 }, timeZone));
}

export function startOfZonedMonth(date: Date, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  return new Date(zonedTimeToUtcMs({ year: p.year, month: p.month, day: 1, hour: 0, minute: 0, second: 0 }, timeZone));
}

export function addZonedDays(date: Date, days: number, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  return new Date(zonedTimeToUtcMs({ ...p, day: p.day + days }, timeZone));
}

export function addZonedMonths(date: Date, months: number, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  const base = new Date(Date.UTC(p.year, p.month - 1 + months, 1, p.hour, p.minute, p.second));
  const next = getZonedParts(base, "UTC");
  const daysInTargetMonth = new Date(Date.UTC(next.year, next.month, 0)).getUTCDate();
  const clampedDay = Math.min(p.day, daysInTargetMonth);
  return new Date(zonedTimeToUtcMs({ year: next.year, month: next.month, day: clampedDay, hour: p.hour, minute: p.minute, second: p.second }, timeZone));
}

export function startOfZonedWeek(date: Date, weekStartsOn: number, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  const diff = (weekday - weekStartsOn + 7) % 7;
  return new Date(zonedTimeToUtcMs({ year: p.year, month: p.month, day: p.day - diff, hour: 0, minute: 0, second: 0 }, timeZone));
}
