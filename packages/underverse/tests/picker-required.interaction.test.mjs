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

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

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

async function clickWithAct(user, target) {
  await act(async () => {
    await user.click(target);
  });
}

test("DatePicker shows required error on submit and clears it after selecting today", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DatePicker.tsx"));
  const DatePicker = mod.DatePicker;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState(undefined);

    return React.createElement(
      "form",
      null,
      React.createElement(DatePicker, {
        value,
        onChange: setValue,
        label: "Delivery date",
        required: true,
        todayLabel: "Today",
        clearLabel: "Clear",
      }),
    );
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const form = view.container.querySelector("form");
  const input = getRequiredInput(view.container);
  const trigger = body.getByRole("button", { name: /delivery date/i });

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

test("TimePicker popover variant shows required error on submit and clears it after choosing now", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "TimePicker.tsx"));
  const TimePicker = mod.default;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState(undefined);

    return React.createElement(
      "form",
      null,
      React.createElement(TimePicker, {
        value,
        onChange: setValue,
        label: "Meeting time",
        required: true,
        showNow: true,
      }),
    );
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const form = view.container.querySelector("form");
  const input = getRequiredInput(view.container);
  const trigger = view.container.querySelector('button[aria-label="Select time"]');
  assert.ok(trigger);

  assert.equal(input.checkValidity(), false);
  await triggerRequiredValidation(form, input);

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "true");
    assert.ok(body.getByText("This field is required"));
  });

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "Set current time" }));

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "false");
    assert.equal(input.checkValidity(), true);
    assert.equal(body.queryByText("This field is required"), null);
  });
});

test("TimePicker inline variant clears required error after choosing now", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "TimePicker.tsx"));
  const TimePicker = mod.default;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState(undefined);

    return React.createElement(
      "form",
      null,
      React.createElement(TimePicker, {
        value,
        onChange: setValue,
        label: "Inline meeting time",
        variant: "inline",
        required: true,
        showNow: true,
      }),
    );
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const form = view.container.querySelector("form");
  const input = getRequiredInput(view.container);

  assert.equal(input.checkValidity(), false);
  await triggerRequiredValidation(form, input);

  await waitFor(() => {
    assert.ok(body.getByText("This field is required"));
    assert.equal(input.checkValidity(), false);
  });

  await clickWithAct(user, body.getByRole("button", { name: "Set current time" }));

  await waitFor(() => {
    assert.equal(input.checkValidity(), true);
    assert.equal(body.queryByText("This field is required"), null);
  });
});

test("MonthYearPicker shows required error on submit and clears it after choosing this month", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "MonthYearPicker.tsx"));
  const MonthYearPicker = mod.MonthYearPicker ?? mod.default;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState(undefined);

    return React.createElement(
      "form",
      null,
      React.createElement(MonthYearPicker, {
        value,
        onChange: setValue,
        label: "Billing period",
        required: true,
      }),
    );
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const form = view.container.querySelector("form");
  const input = getRequiredInput(view.container);
  const trigger = view.container.querySelector('button[aria-label="Select month and year"]');
  assert.ok(trigger);

  assert.equal(input.checkValidity(), false);
  await triggerRequiredValidation(form, input);

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "true");
    assert.ok(body.getByText("This field is required"));
  });

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "This Month" }));

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "false");
    assert.equal(input.checkValidity(), true);
    assert.equal(body.queryByText("This field is required"), null);
  });
});

test("DateTimePicker shows required error on submit and clears it after selecting a day", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DateTimePicker.tsx"));
  const DateTimePicker = mod.DateTimePicker;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState(undefined);

    return React.createElement(
      "form",
      null,
      React.createElement(DateTimePicker, {
        value,
        onChange: setValue,
        label: "Appointment",
        placeholder: "Pick date and time",
        required: true,
      }),
    );
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const form = view.container.querySelector("form");
  const input = getRequiredInput(view.container);
  const trigger = body.getByRole("button", { name: /pick date and time/i });

  assert.equal(input.checkValidity(), false);
  await triggerRequiredValidation(form, input);

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "true");
    assert.ok(body.getByText("This field is required"));
  });

  await clickWithAct(user, trigger);

  const todayTitle = new Date().toDateString();
  const todayButton = await waitFor(() => {
    const candidate = Array.from(window.document.body.querySelectorAll("button")).find((button) => button.getAttribute("title") === todayTitle);
    assert.ok(candidate);
    return candidate;
  });

  await clickWithAct(user, todayButton);
  await clickWithAct(user, await body.findByRole("button", { name: "Done" }));

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "false");
    assert.equal(input.checkValidity(), true);
    assert.equal(body.queryByText("This field is required"), null);
  });
});
