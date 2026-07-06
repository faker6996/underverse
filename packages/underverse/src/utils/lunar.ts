export type LunarDateValue = {
  day: number;
  month: number;
  year: number;
  is_leap_month: boolean;
};

const TIME_ZONE = 7;
const NEW_MOON_EPOCH = 2415021.076998695;
const SYNODIC_MONTH = 29.530588853;

/**
 * Converts a Gregorian (Solar) Date object to a LunarDateValue object.
 * Applies the standard Vietnamese Lunar Calendar algorithm based on the timezone offset (UTC+7).
 *
 * @param {Date} date - The Gregorian Date object to convert.
 * @returns {LunarDateValue} The corresponding lunar date containing day, month, year, and leap month indicator.
 */
export function solarToLunar(date: Date): LunarDateValue {
  const dayNumber = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const k = Math.floor((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let monthStart = getNewMoonDay(k + 1, TIME_ZONE);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, TIME_ZONE);
  }

  let a11 = getLunarMonth11(date.getFullYear(), TIME_ZONE);
  let b11 = a11;
  let lunarYear: number;

  if (a11 >= monthStart) {
    lunarYear = date.getFullYear();
    a11 = getLunarMonth11(date.getFullYear() - 1, TIME_ZONE);
  } else {
    lunarYear = date.getFullYear() + 1;
    b11 = getLunarMonth11(date.getFullYear() + 1, TIME_ZONE);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, TIME_ZONE);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }

  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    is_leap_month: lunarLeap,
  };
}

/**
 * Converts a LunarDateValue back to a Gregorian (Solar) date string.
 *
 * @param {LunarDateValue} lunar - The lunar date object to convert.
 * @returns {string} The corresponding Gregorian date in 'YYYY-MM-DD' format.
 */
export function lunarToSolar(lunar: LunarDateValue): string {
  const { day, month, year, is_leap_month } = lunar;
  if (!day || !month || !year) return "";

  let a11: number;
  let b11: number;
  if (month < 11) {
    a11 = getLunarMonth11(year - 1, TIME_ZONE);
    b11 = getLunarMonth11(year, TIME_ZONE);
  } else {
    a11 = getLunarMonth11(year, TIME_ZONE);
    b11 = getLunarMonth11(year + 1, TIME_ZONE);
  }

  let off = month - 11;
  if (off < 0) off += 12;

  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, TIME_ZONE);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;

    if (is_leap_month && month !== leapMonth) {
      return "";
    }

    if (is_leap_month || off >= leapOff) {
      off += 1;
    }
  }

  const k = Math.floor(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  const monthStart = getNewMoonDay(k + off, TIME_ZONE);
  const solarJd = monthStart + day - 1;
  const { day: solarDay, month: solarMonth, year: solarYear } = jdToDate(solarJd);
  return `${solarYear}-${String(solarMonth).padStart(2, "0")}-${String(solarDay).padStart(2, "0")}`;
}

/**
 * Formats a LunarDateValue into a basic localized short string representation.
 * For example: '15/8/2026'.
 *
 * @param {LunarDateValue | null} lunar - The lunar date object to format.
 * @returns {string} The formatted short string representation, or an empty string if null.
 */
export function formatLunarDate(lunar?: LunarDateValue | null): string {
  if (!lunar) return "";
  return `${lunar.day}/${lunar.month}/${lunar.year}`;
}

const lunarDisplayFormatter = new Intl.DateTimeFormat("en-u-ca-chinese", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Generates a compact lunar badge string (e.g., '(L8.15)') directly from a Gregorian date.
 * Relies on Intl.DateTimeFormat with the 'chinese' calendar type.
 *
 * @param {Date} date - The Gregorian date to convert and format.
 * @returns {string} A short badge string representing the lunar month and day.
 */
export function formatLunarBadge(date: Date): string {
  const zonedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 5, 0, 0));
  const parts = lunarDisplayFormatter.formatToParts(zonedDate);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const monthLabel = parts.find((part) => part.type === "month")?.value ?? "";
  const monthMap: Record<string, string> = {
    First: "1",
    Second: "2",
    Third: "3",
    Fourth: "4",
    Fifth: "5",
    Sixth: "6",
    Seventh: "7",
    Eighth: "8",
    Ninth: "9",
    Tenth: "10",
    Eleventh: "11",
    Twelfth: "12",
  };
  const monthTokenMatch = monthLabel.match(/(\d+|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)/i);
  const monthToken = monthTokenMatch?.[0] ?? "";
  const normalizedMonthToken = monthToken.charAt(0).toUpperCase() + monthToken.slice(1).toLowerCase();
  const month = /^\d+$/.test(monthToken) ? monthToken : (monthMap[normalizedMonthToken] ?? "");

  if (!day || !month) return "";

  return `(L${month}.${day})`;
}

function jdFromDate(day: number, month: number, year: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number) {
  let a: number;
  let b: number;
  let c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return { day, month, year };
}

function getNewMoonDay(k: number, timeZone: number): number {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const dr = Math.PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
  const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const mpr = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  let c1 = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
  c1 -= 0.4068 * Math.sin(mpr * dr) + 0.0161 * Math.sin(dr * 2 * mpr);
  c1 -= 0.0004 * Math.sin(dr * 3 * mpr);
  c1 += 0.0104 * Math.sin(dr * 2 * f) - 0.0051 * Math.sin(dr * (m + mpr));
  c1 -= 0.0074 * Math.sin(dr * (m - mpr)) + 0.0004 * Math.sin(dr * (2 * f + m));
  c1 -= 0.0004 * Math.sin(dr * (2 * f - m)) - 0.0006 * Math.sin(dr * (2 * f + mpr));
  c1 += 0.001 * Math.sin(dr * (2 * f - mpr)) + 0.0005 * Math.sin(dr * (2 * mpr + m));
  const deltaT = t < -11
    ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
    : -0.000278 + 0.000265 * t + 0.000262 * t2;
  const jdNew = jd1 + c1 - deltaT;
  return Math.floor(jdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
  const t = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const t2 = t * t;
  const dr = Math.PI / 180;
  const m = 357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let dl = (1.9146 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
  dl += (0.019993 - 0.000101 * t) * Math.sin(dr * 2 * m) + 0.00029 * Math.sin(dr * 3 * m);
  let l = l0 + dl;
  l *= dr;
  l -= Math.PI * 2 * Math.floor(l / (Math.PI * 2));
  return Math.floor((l / Math.PI) * 6);
}

function getLunarMonth11(year: number, timeZone: number): number {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = Math.floor(off / SYNODIC_MONTH);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 15);
  return i - 1;
}
