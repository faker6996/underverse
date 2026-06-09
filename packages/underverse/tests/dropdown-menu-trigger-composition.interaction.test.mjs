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
  const [dropdownModule, { Tooltip }] = await Promise.all([
    importTsModule(path.join(componentsRoot, "DropdownMenu.tsx")),
    importTsModule(path.join(componentsRoot, "Tooltip.tsx")),
  ]);
  const { default: DropdownMenu, DropdownMenuItem } = dropdownModule;

  return { DropdownMenu, DropdownMenuItem, Tooltip };
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

test("Tooltip closes when its trigger is pressed to open a DropdownMenu", async () => {
  const { DropdownMenu, Tooltip } = await loadComponents();

  await renderElement(
    React.createElement(DropdownMenu, {
      trigger: React.createElement(
        Tooltip,
        {
          content: "Open actions",
          asChild: true,
          delay: 1,
        },
        React.createElement("button", { type: "button" }, "Press Actions"),
      ),
      items: [{ label: "Archive", onClick: () => {} }],
    }),
  );

  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: "Press Actions" });

  await act(async () => {
    fireEvent.mouseEnter(trigger);
    await new Promise((resolve) => setTimeout(resolve, 5));
  });

  assert.ok(await body.findByRole("tooltip"));

  await act(async () => {
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.ok(await body.findByRole("menu"));
  await waitFor(() => {
    assert.equal(body.queryByRole("tooltip"), null);
  });
});

test("Tooltip closes on document pointer move outside the trigger", async () => {
  const { Tooltip } = await loadComponents();

  await renderElement(
    React.createElement(
      Tooltip,
      {
        content: "Avatar details",
        asChild: true,
        delay: 1,
      },
      React.createElement("button", { type: "button" }, "Avatar"),
    ),
  );

  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: "Avatar" });
  trigger.getBoundingClientRect = () => ({
    x: 10,
    y: 10,
    left: 10,
    top: 10,
    right: 60,
    bottom: 60,
    width: 50,
    height: 50,
    toJSON: () => {},
  });

  await act(async () => {
    fireEvent.mouseEnter(trigger);
    await new Promise((resolve) => setTimeout(resolve, 5));
  });

  assert.ok(await body.findByRole("tooltip"));

  await act(async () => {
    fireEvent.pointerMove(window.document, { clientX: 120, clientY: 120 });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  await waitFor(() => {
    assert.equal(body.queryByRole("tooltip"), null);
  });
});

test("Tooltip opened by focus is not closed by document pointer move", async () => {
  const { Tooltip } = await loadComponents();

  await renderElement(
    React.createElement(
      Tooltip,
      {
        content: "Keyboard details",
        asChild: true,
      },
      React.createElement("button", { type: "button" }, "Keyboard Avatar"),
    ),
  );

  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: "Keyboard Avatar" });
  trigger.getBoundingClientRect = () => ({
    x: 10,
    y: 10,
    left: 10,
    top: 10,
    right: 60,
    bottom: 60,
    width: 50,
    height: 50,
    toJSON: () => {},
  });

  await act(async () => {
    trigger.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.ok(await body.findByRole("tooltip"));

  await act(async () => {
    fireEvent.pointerMove(window.document, { clientX: 120, clientY: 120 });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.ok(body.getByRole("tooltip"));
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

test("DropdownMenu keyboard navigation works with child menu items", async () => {
  const { DropdownMenu, DropdownMenuItem } = await loadComponents();

  await renderElement(
    React.createElement(
      DropdownMenu,
      {
        trigger: React.createElement("button", { type: "button" }, "Font size"),
      },
      React.createElement(DropdownMenuItem, { label: "12", onClick: () => {} }),
      React.createElement(DropdownMenuItem, { label: "13", onClick: () => {}, active: true }),
      React.createElement(DropdownMenuItem, { label: "14", onClick: () => {} }),
    ),
  );

  const body = within(window.document.body);
  const trigger = body.getByRole("button", { name: "Font size" });

  await act(async () => {
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const firstItem = await body.findByRole("button", { name: "12" });
  const secondItem = body.getByRole("button", { name: "13" });
  const thirdItem = body.getByRole("button", { name: "14" });
  assert.equal(window.document.activeElement, firstItem);

  await act(async () => {
    fireEvent.keyDown(window.document, { key: "ArrowDown" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(window.document.activeElement, secondItem);

  await act(async () => {
    fireEvent.keyDown(window.document, { key: "ArrowDown" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(window.document.activeElement, thirdItem);

  await act(async () => {
    fireEvent.keyDown(window.document, { key: "ArrowUp" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(window.document.activeElement, secondItem);
});

test("DropdownMenu arrow navigation works when focus stays in an editor-like element", async () => {
  const { DropdownMenu, DropdownMenuItem } = await loadComponents();

  await renderElement(
    React.createElement(
      "div",
      null,
      React.createElement("div", {
        contentEditable: true,
        "data-testid": "editor",
        tabIndex: 0,
        onKeyDown: (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.stopPropagation();
          }
        },
      }),
      React.createElement(
        DropdownMenu,
        {
          trigger: React.createElement("button", { type: "button" }, "Font size"),
        },
        React.createElement(DropdownMenuItem, { label: "12", onClick: () => {} }),
        React.createElement(DropdownMenuItem, { label: "13", onClick: () => {} }),
        React.createElement(DropdownMenuItem, { label: "14", onClick: () => {} }),
      ),
    ),
  );

  const body = within(window.document.body);
  const editor = body.getByTestId("editor");
  const trigger = body.getByRole("button", { name: "Font size" });

  await act(async () => {
    editor.focus();
    fireEvent.click(trigger);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(window.document.activeElement, editor);

  await act(async () => {
    fireEvent.keyDown(editor, { key: "ArrowDown" });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const firstItem = await body.findByRole("button", { name: "12" });
  assert.equal(window.document.activeElement, firstItem);
});
