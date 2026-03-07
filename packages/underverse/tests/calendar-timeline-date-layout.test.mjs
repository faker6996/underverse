import assert from "node:assert/strict";
import test from "node:test";

import {
  addZonedMonths,
  addZonedYears,
  getIsoWeekInfo,
  getZonedWeekday,
  localeToBCP47,
  startOfZonedDay,
  startOfZonedWeek,
  zonedDateAtTime,
} from "../src/components/CalendarTimeline/date.ts";
import { binarySearchFirstGE, binarySearchLastLE, clamp, intervalPack } from "../src/components/CalendarTimeline/layout.ts";

const timeZone = "UTC";

test("date helpers map locales and keep week/year boundaries correct", () => {
  assert.equal(localeToBCP47("vi"), "vi-VN");
  assert.equal(localeToBCP47("en"), "en-US");
  assert.equal(localeToBCP47("fr"), "fr");

  assert.deepEqual(getIsoWeekInfo(new Date("2021-01-01T12:00:00Z"), timeZone), { year: 2020, week: 53 });
  assert.deepEqual(getIsoWeekInfo(new Date("2021-01-04T12:00:00Z"), timeZone), { year: 2021, week: 1 });
});

test("zoned date helpers clamp to calendar boundaries and preserve local intent", () => {
  assert.equal(startOfZonedDay(new Date("2026-03-07T14:25:10Z"), timeZone).toISOString(), "2026-03-07T00:00:00.000Z");
  assert.equal(startOfZonedWeek(new Date("2026-03-11T14:25:10Z"), 1, timeZone).toISOString(), "2026-03-09T00:00:00.000Z");
  assert.equal(zonedDateAtTime(new Date("2026-03-07T14:25:10Z"), timeZone, { hour: 9, minute: 30 }).toISOString(), "2026-03-07T09:30:00.000Z");
  assert.equal(getZonedWeekday(new Date("2026-03-07T14:25:10Z"), timeZone), 6);
});

test("month/year arithmetic handles end-of-month and leap-year rollover", () => {
  assert.equal(addZonedMonths(new Date("2024-01-31T10:00:00Z"), 1, timeZone).toISOString(), "2024-02-29T10:00:00.000Z");
  assert.equal(addZonedMonths(new Date("2025-01-31T10:00:00Z"), 1, timeZone).toISOString(), "2025-02-28T10:00:00.000Z");
  assert.equal(addZonedYears(new Date("2024-02-29T10:00:00Z"), 1, timeZone).toISOString(), "2025-02-28T10:00:00.000Z");
});

test("layout helpers clamp values, search slots, and reuse packed lanes", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);

  const slots = [
    new Date("2026-03-07T09:00:00Z"),
    new Date("2026-03-07T10:00:00Z"),
    new Date("2026-03-07T11:00:00Z"),
    new Date("2026-03-07T12:00:00Z"),
  ];

  assert.equal(binarySearchFirstGE(slots, new Date("2026-03-07T08:30:00Z")), 0);
  assert.equal(binarySearchFirstGE(slots, new Date("2026-03-07T10:15:00Z")), 2);
  assert.equal(binarySearchFirstGE(slots, new Date("2026-03-07T13:00:00Z")), 4);

  assert.equal(binarySearchLastLE(slots, new Date("2026-03-07T08:30:00Z")), 0);
  assert.equal(binarySearchLastLE(slots, new Date("2026-03-07T10:00:00Z")), 1);
  assert.equal(binarySearchLastLE(slots, new Date("2026-03-07T10:15:00Z")), 1);
  assert.equal(binarySearchLastLE([], new Date("2026-03-07T10:15:00Z")), -1);

  const packed = intervalPack([
    { id: "a", startIdx: 0, endIdx: 2 },
    { id: "b", startIdx: 0, endIdx: 1 },
    { id: "c", startIdx: 1, endIdx: 3 },
    { id: "d", startIdx: 2, endIdx: 4 },
  ]);

  assert.equal(packed.laneCount, 2);
  assert.deepEqual(
    packed.packed.map((item) => ({ id: item.id, lane: item.lane })),
    [
      { id: "b", lane: 0 },
      { id: "a", lane: 1 },
      { id: "c", lane: 0 },
      { id: "d", lane: 1 },
    ],
  );
});
