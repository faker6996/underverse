import assert from "node:assert/strict";
import test from "node:test";
import {
  solarToLunar,
  lunarToSolar,
  formatLunarDate,
  formatLunarBadge,
} from "../src/utils/lunar.ts";

// ---------------------------------------------------------------------------
// solarToLunar – Solar (Gregorian) → Lunar conversion
// ---------------------------------------------------------------------------

test("solarToLunar: Tet 2024 (Feb 10 2024 → Lunar 1/1/2024)", () => {
  assert.deepEqual(solarToLunar(new Date(2024, 1, 10)), {
    day: 1, month: 1, year: 2024, is_leap_month: false,
  });
});

test("solarToLunar: Tet 2025 (Jan 29 2025 → Lunar 1/1/2025)", () => {
  assert.deepEqual(solarToLunar(new Date(2025, 0, 29)), {
    day: 1, month: 1, year: 2025, is_leap_month: false,
  });
});

test("solarToLunar: Tet 2023 (Jan 22 2023 → Lunar 1/1/2023)", () => {
  assert.deepEqual(solarToLunar(new Date(2023, 0, 22)), {
    day: 1, month: 1, year: 2023, is_leap_month: false,
  });
});

test("solarToLunar: Mid-Autumn 2023 (Sep 29 2023 → Lunar 15/8/2023)", () => {
  assert.deepEqual(solarToLunar(new Date(2023, 8, 29)), {
    day: 15, month: 8, year: 2023, is_leap_month: false,
  });
});

test("solarToLunar: Leap month detection (Feb 20 2023 → Lunar leap month 1)", () => {
  const result = solarToLunar(new Date(2023, 1, 20));
  assert.equal(result.is_leap_month, true);
});

test("solarToLunar: Non-leap month (Jul 06 2026 → Lunar 22/5/2026)", () => {
  assert.deepEqual(solarToLunar(new Date(2026, 6, 6)), {
    day: 22, month: 5, year: 2026, is_leap_month: false,
  });
});

// ---------------------------------------------------------------------------
// lunarToSolar – Lunar → Solar (Gregorian) conversion
// ---------------------------------------------------------------------------

test("lunarToSolar: Lunar 1/1/2024 → 2024-02-10", () => {
  assert.equal(
    lunarToSolar({ day: 1, month: 1, year: 2024, is_leap_month: false }),
    "2024-02-10",
  );
});

test("lunarToSolar: Lunar 1/1/2025 → 2025-01-29", () => {
  assert.equal(
    lunarToSolar({ day: 1, month: 1, year: 2025, is_leap_month: false }),
    "2025-01-29",
  );
});

test("lunarToSolar: Lunar 15/8/2023 → 2023-09-29 (Mid-Autumn)", () => {
  assert.equal(
    lunarToSolar({ day: 15, month: 8, year: 2023, is_leap_month: false }),
    "2023-09-29",
  );
});

test("lunarToSolar: returns empty string for invalid input (missing day)", () => {
  assert.equal(
    lunarToSolar({ day: 0, month: 1, year: 2024, is_leap_month: false }),
    "",
  );
});

// ---------------------------------------------------------------------------
// Roundtrip: Solar → Lunar → Solar
// ---------------------------------------------------------------------------

test("roundtrip: solarToLunar → lunarToSolar preserves date", () => {
  const testDates = [
    new Date(2024, 1, 10),  // Tet 2024
    new Date(2025, 0, 29),  // Tet 2025
    new Date(2023, 0, 22),  // Tet 2023
    new Date(2023, 8, 29),  // Mid-Autumn 2023
    new Date(2026, 6, 6),   // Normal day 2026
    new Date(2024, 5, 15),  // Mid-year 2024
    new Date(2024, 11, 31), // New Year's Eve 2024
  ];

  for (const date of testDates) {
    const lunar = solarToLunar(date);
    const solarStr = lunarToSolar(lunar);
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const expected = `${yyyy}-${mm}-${dd}`;

    assert.equal(solarStr, expected, `Roundtrip failed for ${expected} (lunar: ${JSON.stringify(lunar)})`);
  }
});

// ---------------------------------------------------------------------------
// formatLunarDate
// ---------------------------------------------------------------------------

test("formatLunarDate: formats day/month/year", () => {
  assert.equal(
    formatLunarDate({ day: 1, month: 1, year: 2024, is_leap_month: false }),
    "1/1/2024",
  );
  assert.equal(
    formatLunarDate({ day: 15, month: 8, year: 2023, is_leap_month: false }),
    "15/8/2023",
  );
});

test("formatLunarDate: returns empty string for null/undefined", () => {
  assert.equal(formatLunarDate(null), "");
  assert.equal(formatLunarDate(undefined), "");
});

// ---------------------------------------------------------------------------
// formatLunarBadge
// ---------------------------------------------------------------------------

test("formatLunarBadge: Tet 2024 badge", () => {
  assert.equal(formatLunarBadge(new Date(2024, 1, 10)), "(L1.1)");
});

test("formatLunarBadge: Tet 2025 badge", () => {
  assert.equal(formatLunarBadge(new Date(2025, 0, 29)), "(L1.1)");
});

test("formatLunarBadge: format is (L<month>.<day>)", () => {
  const badge = formatLunarBadge(new Date(2023, 8, 29)); // Mid-Autumn 15/8
  assert.match(badge, /^\(L\d+\.\d+\)$/);
});
