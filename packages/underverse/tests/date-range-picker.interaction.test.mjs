import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React, { createRoot } from "./helpers/workspace-react.mjs";
import { cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const { act } = React;

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

function getVisibleTextInput(container) {
  const input = container.querySelector('input[type="text"]');
  assert.ok(input, "expected visible text input");
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

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: /select date range/i });
  const textInput = getVisibleTextInput(view.container);

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
    assert.doesNotMatch(textInput.value, /Select date range/i);
    assert.match(textInput.value, new RegExp(String(targetYear)));
  });
});

test("DateRangePicker reports a null end date while selecting an incomplete range", async () => {
  const mod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/components"), "DatePicker.tsx"));
  const DateRangePicker = mod.DateRangePicker;
  const user = userEvent.setup({ document: window.document });
  const changes = [];

  function Harness() {
    const [range, setRange] = React.useState({ start: undefined, end: undefined });

    return React.createElement(DateRangePicker, {
      startDate: range.start,
      endDate: range.end,
      onChange: (start, end) => {
        changes.push({ start, end });
        setRange({ start, end });
      },
      placeholder: "Select date range...",
    });
  }

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: /select date range/i });
  const textInput = getVisibleTextInput(view.container);

  await clickWithAct(user, trigger);
  await clickWithAct(user, body.getByRole("button", { name: "10" }));

  await waitFor(() => {
    assert.equal(changes.length, 1);
    assert.ok(changes[0].start instanceof Date);
    assert.equal(changes[0].start.getDate(), 10);
    assert.equal(changes[0].end, null);
    assert.match(textInput.value, /\s-\s\.\.\./);
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

  const view = await renderElement(React.createElement(Harness));
  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: /select date range/i });
  const textInput = getVisibleTextInput(view.container);

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "Today" }));

  await waitFor(() => {
    assert.doesNotMatch(textInput.value, /Select date range/i);
    assert.match(textInput.value, /\s-\s/);
  });

  await clickWithAct(user, trigger);
  await clickWithAct(user, await body.findByRole("button", { name: "Clear" }));

  await waitFor(() => {
    assert.equal(textInput.value, "");
    assert.match(textInput.placeholder, /Select date range/i);
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

test("DatePicker supports manual text input typing", async () => {
  const mod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/components"), "DatePicker.tsx"));
  const DatePicker = mod.DatePicker;
  const user = userEvent.setup({ document: window.document });
  let selectedDate = undefined;

  function Harness() {
    const [val, setVal] = React.useState(undefined);
    return React.createElement(DatePicker, {
      value: val,
      onChange: (d) => {
        selectedDate = d;
        setVal(d);
      },
      placeholder: "Pick a date",
    });
  }

  const { container } = await renderElement(React.createElement(Harness));
  const textInput = getVisibleTextInput(container);

  // Focus and type date in MM/DD/YYYY format since default is English locale
  await act(async () => {
    textInput.focus();
  });
  
  await act(async () => {
    await user.keyboard("12/25/2026");
  });

  await waitFor(() => {
    assert.ok(selectedDate instanceof Date);
    assert.equal(selectedDate.getFullYear(), 2026);
    assert.equal(selectedDate.getMonth(), 11); // December is 11
    assert.equal(selectedDate.getDate(), 25);
  });

  // Blur should format the text to local display
  await act(async () => {
    textInput.blur();
  });

  await waitFor(() => {
    assert.equal(textInput.value, "December 25, 2026");
  });
});

test("DateRangePicker supports manual text input typing for date range", async () => {
  const mod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/components"), "DatePicker.tsx"));
  const DateRangePicker = mod.DateRangePicker;
  const user = userEvent.setup({ document: window.document });
  let rangeResult = { start: undefined, end: undefined };

  function Harness() {
    const [range, setRange] = React.useState({ start: undefined, end: undefined });
    return React.createElement(DateRangePicker, {
      startDate: range.start,
      endDate: range.end,
      onChange: (start, end) => {
        rangeResult = { start, end };
        setRange({ start, end });
      },
      placeholder: "Select date range...",
    });
  }

  const { container } = await renderElement(React.createElement(Harness));
  const textInput = getVisibleTextInput(container);

  await act(async () => {
    textInput.focus();
  });

  await act(async () => {
    await user.keyboard("12/25/2026 - 12/28/2026");
  });

  await waitFor(() => {
    assert.ok(rangeResult.start instanceof Date);
    assert.equal(rangeResult.start.getFullYear(), 2026);
    assert.equal(rangeResult.start.getMonth(), 11);
    assert.equal(rangeResult.start.getDate(), 25);

    assert.ok(rangeResult.end instanceof Date);
    assert.equal(rangeResult.end.getFullYear(), 2026);
    assert.equal(rangeResult.end.getMonth(), 11);
    assert.equal(rangeResult.end.getDate(), 28);
  });
});
