import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, render } from "@testing-library/react";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(() => cleanup());

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");
const constantsRoot = path.resolve(import.meta.dirname, "../src/constants");

const directLabelModules = [
  "CheckBox.tsx",
  "Combobox.tsx",
  "DatePicker.tsx",
  "DateTimePicker.tsx",
  "Input.tsx",
  "LunarDatePicker.tsx",
  "MonthYearPicker.tsx",
  "MultiCombobox.tsx",
  "RadioGroup.tsx",
  "Slider.tsx",
  "Switch.tsx",
  "TagInput.tsx",
  "TimePicker.tsx",
];

test("form-control label renderers depend on the shared typography token", () => {
  const tokenSource = fs.readFileSync(path.join(constantsRoot, "form-control-size.ts"), "utf8");
  assert.match(tokenSource, /formControlLabelClass\s*=\s*["']font-medium["']/);

  for (const file of directLabelModules) {
    const source = fs.readFileSync(path.join(componentsRoot, file), "utf8");
    assert.match(source, /\bformControlLabelClass\b/, `${file} must use the shared label typography token`);
  }

  const primitiveSource = fs.readFileSync(path.join(componentsRoot, "label.tsx"), "utf8");
  assert.match(primitiveSource, /\bformControlLabelClass\b/, "Label primitive must use the shared label typography token");
});

test("previous label-weight outliers render at medium weight", async () => {
  const checkboxModule = await importTsModule(path.join(componentsRoot, "CheckBox.tsx"));
  const datePickerModule = await importTsModule(path.join(componentsRoot, "DatePicker.tsx"));
  const lunarDatePickerModule = await importTsModule(path.join(componentsRoot, "LunarDatePicker.tsx"));
  const timePickerModule = await importTsModule(path.join(componentsRoot, "TimePicker.tsx"));

  const cases = [
    React.createElement(checkboxModule.Checkbox, { label: "Checkbox label" }),
    React.createElement(datePickerModule.DatePicker, { label: "Date label", onChange: () => {} }),
    React.createElement(lunarDatePickerModule.LunarDatePicker, { label: "Lunar label", onChange: () => {} }),
    React.createElement(timePickerModule.default, { label: "Time label" }),
  ];

  for (const element of cases) {
    const view = render(element);
    const label = view.getByText(/^(Checkbox|Date|Lunar|Time) label$/);
    assert.ok(label.classList.contains("font-medium"));
    assert.equal(label.classList.contains("font-semibold"), false);
    view.unmount();
  }
});

test("labelClassName still overrides the shared default", async () => {
  const inputModule = await importTsModule(path.join(componentsRoot, "Input.tsx"));
  const view = render(
    React.createElement(inputModule.default, {
      label: "Custom label",
      labelClassName: "font-bold",
    }),
  );

  const label = view.getByText("Custom label");
  assert.ok(label.classList.contains("font-bold"));
  assert.equal(label.classList.contains("font-medium"), false);
});
