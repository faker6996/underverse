import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(() => cleanup());

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

test("CalendarTimeline supports view switching, group toggle, and create flow", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "CalendarTimeline.tsx"));
  const CalendarTimeline = mod.default;
  const user = userEvent.setup({ document: window.document });
  const views = [];

  render(
    React.createElement(CalendarTimeline, {
      resources: [
        { id: "r1", label: "Room A", groupId: "team-a" },
        { id: "r2", label: "Room B", groupId: "team-a" },
      ],
      groups: [{ id: "team-a", label: "Team A", collapsible: true }],
      events: [{ id: "e1", resourceId: "r1", start: "2026-03-07T09:00:00Z", end: "2026-03-07T10:00:00Z", title: "Standup" }],
      defaultView: "month",
      defaultDate: new Date("2026-03-07T00:00:00Z"),
      locale: "en",
      timeZone: "UTC",
      labels: {
        month: "Month",
        week: "Week",
        day: "Day",
        sprint: "Sprint",
        today: "Today",
        prev: "Prev",
        next: "Next",
        newEvent: "New Event",
        createEventTitle: "Create Event",
        create: "Create",
        cancel: "Cancel",
        resource: "Resource",
        start: "Start",
        end: "End",
        expandGroup: "Expand Group",
        collapseGroup: "Collapse Group",
        more: (n) => `${n} more`,
        deleteConfirm: "Delete?",
      },
      onViewChange: (view) => views.push(view),
      interactions: { creatable: true },
      onCreateEvent: async () => {},
    }),
  );
  const body = within(window.document.body);

  assert.ok(body.getByText("Room A"));
  assert.ok(body.getByText("Room B"));

  await user.click(body.getByRole("button", { name: "Week" }));
  await waitFor(() => {
    assert.equal(views.at(-1), "week");
  });

  await user.click(body.getByRole("button", { name: "Collapse Group" }));
  await waitFor(() => {
    assert.equal(body.queryByText("Room A"), null);
    assert.equal(body.queryByText("Room B"), null);
  });

  await user.click(body.getByRole("button", { name: /New Event/i }));
  assert.ok(await body.findByText("Create Event"));
});

test("CalendarTimeline create flow submits the expected payload", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "CalendarTimeline.tsx"));
  const CalendarTimeline = mod.default;
  const user = userEvent.setup({ document: window.document });
  const created = [];

  render(
    React.createElement(CalendarTimeline, {
      resources: [
        { id: "r1", label: "Room A" },
        { id: "r2", label: "Room B" },
      ],
      events: [],
      defaultView: "day",
      defaultDate: new Date("2026-03-07T00:00:00Z"),
      now: new Date("2026-03-07T09:30:00Z"),
      locale: "en",
      timeZone: "UTC",
      labels: {
        month: "Month",
        week: "Week",
        day: "Day",
        sprint: "Sprint",
        today: "Today",
        prev: "Prev",
        next: "Next",
        newEvent: "New Event",
        createEventTitle: "Create Event",
        create: "Create",
        cancel: "Cancel",
        resource: "Resource",
        start: "Start",
        end: "End",
        expandGroup: "Expand Group",
        collapseGroup: "Collapse Group",
        more: (n) => `${n} more`,
        deleteConfirm: "Delete?",
      },
      interactions: { creatable: true },
      onCreateEvent: (draft) => created.push(draft),
    }),
  );
  const body = within(window.document.body);

  await user.click(body.getByRole("button", { name: /New Event/i }));
  await body.findByText("Create Event");

  const [resourceCombobox, , endCombobox] = body.getAllByRole("combobox");

  await user.click(resourceCombobox);
  await user.click(within(body.getByRole("listbox")).getByRole("option", { name: /Room B/i }));

  await user.click(endCombobox);
  const endOptions = within(body.getByRole("listbox")).getAllByRole("option");
  await user.click(endOptions[1]);

  await user.click(body.getByRole("button", { name: "Create" }));

  await waitFor(() => {
    assert.equal(created.length, 1);
  });

  assert.equal(created[0].resourceId, "r2");
  assert.equal(created[0].start.toISOString(), "2026-03-07T10:00:00.000Z");
  assert.equal(created[0].end.toISOString(), "2026-03-07T12:00:00.000Z");
});
