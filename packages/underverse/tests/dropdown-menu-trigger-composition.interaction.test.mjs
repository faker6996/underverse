import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React, { createRoot } from "./helpers/workspace-react.mjs";
import { act, cleanup, fireEvent, waitFor, within } from "@testing-library/react";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(() => cleanup());

let mountedRoots = [];
afterEach(async () => {
  for (const entry of mountedRoots) {
    await act(async () => {
      entry.root.unmount();
    });
    entry.container.remove();
  }
  mountedRoots = [];
  await new Promise((resolve) => setTimeout(resolve, 0));
});

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

async function loadComponents() {
  const [{ default: DropdownMenu }, { Tooltip }] = await Promise.all([
    importTsModule(path.join(componentsRoot, "DropdownMenu.tsx")),
    importTsModule(path.join(componentsRoot, "Tooltip.tsx")),
  ]);

  return { DropdownMenu, Tooltip };
}

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

test("DropdownMenu opens from a Tooltip asChild trigger on click", async () => {
  const { DropdownMenu, Tooltip } = await loadComponents();
  let selected = 0;

  await renderElement(
    React.createElement(DropdownMenu, {
      trigger: React.createElement(
        Tooltip,
        {
          content: "More actions",
          asChild: true,
        },
        React.createElement("button", { type: "button" }, "Actions"),
      ),
      items: [
        {
          label: "Edit item",
          onClick: () => {
            selected += 1;
          },
        },
      ],
    }),
  );

  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: "Actions" });

  await act(async () => {
    fireEvent.click(trigger);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const menu = await body.findByRole("menu");
  assert.ok(menu);

  const menuItem = body.getByRole("menuitem", { name: "Edit item" });
  await act(async () => {
    fireEvent.click(menuItem);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(selected, 1);
  await waitFor(() => {
    assert.equal(body.queryByRole("menuitem", { name: "Edit item" }), null);
  });
});

test("DropdownMenu keyboard trigger works through Tooltip asChild", async () => {
  const { DropdownMenu, Tooltip } = await loadComponents();

  await renderElement(
    React.createElement(DropdownMenu, {
      trigger: React.createElement(
        Tooltip,
        {
          content: "More actions",
          asChild: true,
        },
        React.createElement("button", { type: "button" }, "Keyboard Actions"),
      ),
      items: [
        { label: "First action", onClick: () => {} },
        { label: "Second action", onClick: () => {} },
      ],
    }),
  );

  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: "Keyboard Actions" });

  await act(async () => {
    trigger.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  assert.equal(window.document.activeElement, trigger);

  await act(async () => {
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const firstItem = await body.findByRole("menuitem", { name: "First action" });
  assert.equal(window.document.activeElement, firstItem);
});
