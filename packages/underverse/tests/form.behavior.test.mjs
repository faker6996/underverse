import assert from "node:assert/strict";
import path from "node:path";
import test, { after } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { render } from "@testing-library/react";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

test("FormLabel is wired to react to focused controls through the FormItem group", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "Form.tsx"));
  const { Form, FormField, FormItem, FormLabel, FormControl } = mod;

  const view = render(
    React.createElement(
      Form,
      { onSubmit: () => {} },
      React.createElement(FormField, {
        name: "email",
        render: () =>
          React.createElement(
            FormItem,
            null,
            React.createElement(FormLabel, null, "Email"),
            React.createElement(
              FormControl,
              null,
              React.createElement("input", { id: "demo-input", type: "text" }),
            ),
          ),
      }),
    ),
  );

  const item = view.container.querySelector(".group.space-y-2");
  assert.ok(item);
  assert.match(item.className, /\bgroup\b/);

  const label = view.getByText("Email");
  assert.match(label.className, /group-focus-within:text-primary/);
});
