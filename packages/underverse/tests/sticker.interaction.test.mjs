import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React, { createRoot } from "./helpers/workspace-react.mjs";
import { waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule, requireTempModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const { NextIntlClientProvider } = requireTempModule("next-intl");
const { act } = React;

const restoreDom = installJSDOM();
after(() => restoreDom());
let mountedRoots = [];

afterEach(async () => {
  for (const entry of mountedRoots) {
    await act(async () => {
      entry.root.unmount();
    });
    entry.container.remove();
  }
  mountedRoots = [];
  document.documentElement.lang = "en";
  await new Promise((resolve) => setTimeout(resolve, 0));
});

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");
const contextsRoot = path.resolve(import.meta.dirname, "../src/contexts");

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

test("StickerPicker filters sticker results and calls onStickerSelect", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "StickerPicker.tsx"));
  const StickerPicker = mod.default;
  const user = userEvent.setup({ document: window.document });
  const selections = [];
  document.documentElement.lang = "en";

  const view = await renderElement(
    React.createElement(StickerPicker, {
      onStickerSelect: (sticker) => selections.push(sticker),
    }),
  );

  const searchInput = await waitFor(() => {
    const input = within(view.container).getByPlaceholderText("Search stickers");
    assert.ok(input);
    return input;
  });
  await user.type(searchInput, "thumbs");

  const matchingStickerButton = await waitFor(() => {
    const button = within(window.document.body).getByRole("button", { name: "Thumbs Up" });
    assert.ok(button);
    return button;
  });

  const { fireEvent } = await import("@testing-library/react");
  fireEvent.click(matchingStickerButton);

  assert.equal(selections.length, 1);
  assert.equal(selections[0].id, "thumbs_up");
  assert.equal(selections[0].name, "Thumbs Up");
  assert.equal(selections[0].packId, "memoji_apple");
  assert.equal(searchInput.value, "");
});

test("StickerPicker renders the configured number of columns via grid template", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "StickerPicker.tsx"));
  const StickerPicker = mod.default;
  document.documentElement.lang = "en";

  const view = await renderElement(
    React.createElement(StickerPicker, {
      onStickerSelect: () => {},
      columns: 5,
    }),
  );

  const activePackGrid = await waitFor(() => {
    const grid = view.container.querySelector(".grid.gap-2\\.5");
    assert.ok(grid);
    return grid;
  });

  assert.equal(activePackGrid.style.gridTemplateColumns, "repeat(5, minmax(0, 1fr))");
});

test("StickerPicker uses localized placeholder and empty state", async () => {
  const pickerMod = await importTsModule(path.join(componentsRoot, "StickerPicker.tsx"));
  const StickerPicker = pickerMod.default;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "vi";

  const view = await renderElement(React.createElement(StickerPicker, { onStickerSelect: () => {} }));

  const searchInput = await waitFor(() => {
    const input = within(view.container).getByPlaceholderText("Tìm kiếm nhãn dán");
    assert.ok(input);
    return input;
  });
  await user.type(searchInput, "khong-co-sticker");

  await waitFor(() => {
    assert.ok(within(view.container).getByText("Không tìm thấy nhãn dán nào"));
    assert.ok(within(view.container).getByText("Thử từ khóa khác"));
  });
});

test("StickerPicker prefers NextIntlAdapter messages over document locale fallback", async () => {
  const pickerMod = await importTsModule(path.join(componentsRoot, "StickerPicker.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const StickerPicker = pickerMod.default;
  const { NextIntlAdapter } = adapterMod;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "en";

  const view = await renderElement(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "ko",
        onError: () => {},
        messages: {
          UEditor: {
            stickerPicker: {
              searchPlaceholder: "브리지 스티커 검색",
              noResults: "브리지 스티커 결과 없음",
              tryDifferentSearch: "브리지 다른 키워드",
            },
          },
        },
      },
      React.createElement(
        NextIntlAdapter,
        null,
        React.createElement(StickerPicker, { onStickerSelect: () => {} }),
      ),
    ),
  );

  const searchInput = await waitFor(() => {
    const input = within(view.container).getByPlaceholderText("브리지 스티커 검색");
    assert.ok(input);
    return input;
  });
  await user.type(searchInput, "khong-co-sticker");

  await waitFor(() => {
    assert.ok(within(view.container).getByText("브리지 스티커 결과 없음"));
    assert.ok(within(view.container).getByText("브리지 다른 키워드"));
  });
});
