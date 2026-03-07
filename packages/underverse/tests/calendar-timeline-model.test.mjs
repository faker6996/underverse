import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRows,
  computeSlotStarts,
  eventsByResourceId,
  getGroupResourceCounts,
  normalizeEvents,
  resourcesById,
} from "../src/components/CalendarTimeline/model.ts";

const timeZone = "UTC";

test("buildRows keeps declared group order and appends unknown plus ungrouped resources", () => {
  const rows = buildRows({
    resources: [
      { id: "r1", label: "Alpha", groupId: "team-a" },
      { id: "r2", label: "Beta", groupId: "team-b" },
      { id: "r3", label: "Gamma", groupId: "team-c" },
      { id: "r4", label: "Delta" },
    ],
    groups: [
      { id: "team-a", label: "Team A" },
      { id: "team-b", label: "Team B" },
    ],
    collapsed: { "team-b": true },
  });

  assert.deepEqual(
    rows.map((row) => (row.kind === "group" ? `group:${row.group.id}` : `resource:${row.resource.id}`)),
    [
      "group:team-a",
      "resource:r1",
      "group:team-b",
      "group:team-c",
      "resource:r3",
      "group:__ungrouped__",
      "resource:r4",
    ],
  );
});

test("getGroupResourceCounts counts only grouped resources", () => {
  const counts = getGroupResourceCounts([
    { id: "r1", label: "Alpha", groupId: "team-a" },
    { id: "r2", label: "Beta", groupId: "team-a" },
    { id: "r3", label: "Gamma", groupId: "team-b" },
    { id: "r4", label: "Delta" },
  ]);

  assert.equal(counts.get("team-a"), 2);
  assert.equal(counts.get("team-b"), 1);
  assert.equal(counts.has("__ungrouped__"), false);
});

test("computeSlotStarts respects work-hour day ranges and step size", () => {
  const result = computeSlotStarts({
    view: "day",
    date: new Date("2026-03-07T12:15:00Z"),
    timeZone,
    weekStartsOn: 1,
    dayTimeStepMinutes: 30,
    dayRangeMode: "work",
    workHours: { startHour: 9, endHour: 12 },
  });

  assert.equal(result.start.toISOString(), "2026-03-07T09:00:00.000Z");
  assert.equal(result.end.toISOString(), "2026-03-07T12:00:00.000Z");
  assert.deepEqual(
    result.slotStarts.map((slot) => slot.toISOString()),
    [
      "2026-03-07T09:00:00.000Z",
      "2026-03-07T09:30:00.000Z",
      "2026-03-07T10:00:00.000Z",
      "2026-03-07T10:30:00.000Z",
      "2026-03-07T11:00:00.000Z",
      "2026-03-07T11:30:00.000Z",
    ],
  );
});

test("normalizeEvents clamps to the visible range and groups by resource", () => {
  const normalized = normalizeEvents({
    events: [
      {
        id: "e1",
        resourceId: "r1",
        start: "2026-03-06T22:00:00Z",
        end: "2026-03-08T10:00:00Z",
        title: "Across range",
      },
      {
        id: "e2",
        resourceId: "r1",
        start: "2026-03-07T10:00:00Z",
        end: "2026-03-07T10:00:00Z",
        title: "Zero length",
      },
      {
        id: "e3",
        resourceId: "r2",
        start: "not-a-date",
        end: "2026-03-07T13:00:00Z",
        title: "Invalid",
      },
      {
        id: "e4",
        resourceId: "r3",
        start: "2026-03-10T00:00:00Z",
        end: "2026-03-10T02:00:00Z",
        title: "Outside range",
      },
    ],
    range: {
      start: new Date("2026-03-07T00:00:00Z"),
      end: new Date("2026-03-09T00:00:00Z"),
    },
    view: "day",
    timeZone,
  });

  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].id, "e1");
  assert.equal(normalized[0]._start.toISOString(), "2026-03-07T00:00:00.000Z");
  assert.equal(normalized[0]._end.toISOString(), "2026-03-08T10:00:00.000Z");
  assert.equal(normalized[1].id, "e2");
  assert.equal(normalized[1]._end.getTime() - normalized[1]._start.getTime(), 60_000);

  const byResource = eventsByResourceId(normalized);
  assert.deepEqual(
    byResource.get("r1")?.map((event) => event.id),
    ["e1", "e2"],
  );

  const resourceMap = resourcesById([
    { id: "r1", label: "Resource 1" },
    { id: "r2", label: "Resource 2" },
  ]);
  assert.equal(resourceMap.get("r1")?.label, "Resource 1");
  assert.equal(resourceMap.has("r3"), false);
});
