import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const { act } = React;
const requirePackage = createRequire(path.resolve(import.meta.dirname, "../package.json"));
const { createRoot } = requirePackage("react-dom/client");

const restoreDom = installJSDOM();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
after(() => restoreDom());
let mountedRoots = [];

afterEach(async () => {
  cleanup();
  for (const entry of mountedRoots) {
    await act(async () => {
      entry.root.unmount();
    });
    entry.container.remove();
  }
  mountedRoots = [];
});

async function renderElement(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });

  await act(async () => {
    root.render(element);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return { container, root };
}

async function clickWithAct(user, target) {
  await act(async () => {
    await user.click(target);
  });
}

function getRequiredInput(container) {
  const input = container.querySelector('input[required][aria-hidden="true"]');
  assert.ok(input, "expected hidden required input");
  return input;
}

async function triggerRequiredValidation(form, input) {
  assert.ok(form, "expected form element");
  await act(async () => {
    fireEvent.submit(form);
    fireEvent.invalid(input);
  });
}

test("DateRangePicker supports month and year quick selection before picking a range", async () => {
  const mod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/components"), "DatePicker.tsx"));
  const DateRangePicker = mod.DateRangePicker;
  const user = userEvent.setup({ document: window.document });
  const targetYear = new Date().getFullYear() + 1;

  function Harness() {
    const [range, setRange] = React.useState({ start: undefined, end: undefined });

    return React.createElement(DateRangePicker, {
      startDate: range.start,
      endDate: range.end,
      onChange: (start, end) => setRange({ start, end }),
      placeholder: "Select date range...",
    });
  }

  await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: /select date range/i });

  await clickWithAct(user, trigger);
  await clickWithAct(user, body.getByRole("button", { name: String(new Date().getFullYear()) }));
  await clickWithAct(user, await body.findByRole("button", { name: String(targetYear) }));
  await clickWithAct(user, await body.findByRole("button", { name: "Feb" }));

  await waitFor(() => {
    assert.ok(body.getByText("Su"));
    assert.ok(body.getByRole("button", { name: String(targetYear) }));
  });

  await clickWithAct(user, body.getByRole("button", { name: "10" }));
  await clickWithAct(user, body.getByRole("button", { name: "15" }));

  await waitFor(() => {
    const text = trigger.textContent || "";
    assert.doesNotMatch(text, /Select date range/i);
    assert.match(text, new RegExp(String(targetYear)));
  });
});

test("DateRangePicker footer supports Today and Clear actions", async () => {
  const mod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/components"), "DatePicker.tsx"));
  const DateRangePicker = mod.DateRangePicker;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [range, setRange] = React.useState({ start: undefined, end: undefined });

    return React.createElement(DateRangePicker, {
      startDate: range.start,
      endDate: range.end,
      onChange: (start, end) => setRange({ start, end }),
      placeholder: "Select date range...",
    });
  }

  await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: /select date range/i });

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "Today" }));

  await waitFor(() => {
    const text = trigger.textContent || "";
    assert.doesNotMatch(text, /Select date range/i);
    assert.match(text, /\s-\s/);
  });

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "Clear" }));

  await waitFor(() => {
    assert.match(trigger.textContent || "", /Select date range/i);
  });
});

test("DateRangePicker shows required error on submit and clears it after selecting today", async () => {
  const mod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/components"), "DatePicker.tsx"));
  const DateRangePicker = mod.DateRangePicker;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [range, setRange] = React.useState({ start: undefined, end: undefined });

    return React.createElement(
      "form",
      null,
      React.createElement(DateRangePicker, {
        startDate: range.start,
        endDate: range.end,
        onChange: (start, end) => setRange({ start, end }),
        label: "Booking range",
        required: true,
        placeholder: "Select date range...",
      }),
    );
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const form = view.container.querySelector("form");
  const input = getRequiredInput(view.container);
  const trigger = body.getByRole("button", { name: /booking range/i });

  assert.equal(input.checkValidity(), false);
  await triggerRequiredValidation(form, input);

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "true");
    assert.ok(body.getByText("This field is required"));
  });

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "Today" }));

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "false");
    assert.equal(input.checkValidity(), true);
    assert.equal(body.queryByText("This field is required"), null);
  });
});
