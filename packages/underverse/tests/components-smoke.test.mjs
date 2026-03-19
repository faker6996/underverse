import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import React, { renderToStaticMarkup } from "./helpers/workspace-react.mjs";

import { importTsModule } from "./helpers/import-ts-module.mjs";

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

const importCases = [
  ["Button", "Button.tsx"],
  ["Badge", "Badge.tsx"],
  ["Card", "Card.tsx"],
  ["Input", "Input.tsx"],
  ["DataTable", "DataTable/index.ts"],
  ["CalendarTimeline", "CalendarTimeline.tsx"],
  ["ImageUpload", "ImageUpload.tsx"],
  ["FileUpload", "FileUpload.tsx"],
  ["MusicPlayer", "MusicPlayer.tsx"],
  ["Modal", "Modal.tsx"],
  ["Popover", "Popover.tsx"],
  ["Toast", "Toast.tsx"],
  ["Combobox", "Combobox.tsx"],
  ["UEditor", "UEditor.tsx"],
];

const renderCases = [
  {
    name: "Button",
    file: "Button.tsx",
    createElement: (mod) => React.createElement(mod.default, null, "Save"),
  },
  {
    name: "Badge",
    file: "Badge.tsx",
    createElement: (mod) => React.createElement(mod.default, null, "Stable"),
  },
  {
    name: "Card",
    file: "Card.tsx",
    createElement: (mod) => React.createElement(mod.default, { title: "Overview", description: "Summary" }, React.createElement("p", null, "Content")),
  },
  {
    name: "Input",
    file: "Input.tsx",
    createElement: (mod) => React.createElement(mod.default, { placeholder: "Search" }),
  },
  {
    name: "Checkbox",
    file: "CheckBox.tsx",
    createElement: (mod) => React.createElement(mod.Checkbox, { label: "Remember me", defaultChecked: true }),
  },
  {
    name: "Progress",
    file: "Progress.tsx",
    createElement: (mod) => React.createElement(mod.Progress, { value: 64, label: "Upload", showValue: true }),
  },
  {
    name: "AccessDenied",
    file: "AccessDenied.tsx",
    createElement: (mod) => React.createElement(mod.default, { title: "Forbidden", description: "Restricted zone" }),
  },
];

test("large component modules can be imported from package source", async () => {
  for (const [name, relativePath] of importCases) {
    const mod = await importTsModule(path.join(componentsRoot, relativePath));
    assert.ok(mod, `Module ${name} failed to load`);
    assert.ok(Object.keys(mod).length > 0, `Module ${name} exported nothing`);
  }
});

test("representative component groups render to static markup", async () => {
  for (const renderCase of renderCases) {
    const mod = await importTsModule(path.join(componentsRoot, renderCase.file));
    const html = renderToStaticMarkup(renderCase.createElement(mod));
    assert.ok(typeof html === "string" && html.length > 0, `${renderCase.name} rendered empty markup`);
  }
});
