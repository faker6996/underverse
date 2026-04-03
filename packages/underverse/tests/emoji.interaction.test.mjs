import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule, requireTempModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const { NextIntlClientProvider } = requireTempModule("next-intl");

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(async () => {
  cleanup();
  document.documentElement.lang = "en";
  await new Promise((resolve) => setTimeout(resolve, 0));
});

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");
const contextsRoot = path.resolve(import.meta.dirname, "../src/contexts");
test("EmojiPicker filters emoji results and calls onEmojiSelect", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "EmojiPicker.tsx"));
  const EmojiPicker = mod.default;
  const user = userEvent.setup({ document: window.document });
  const selections = [];
  document.documentElement.lang = "en";

  const view = render(
    React.createElement(EmojiPicker, {
      onEmojiSelect: (emoji) => selections.push(emoji),
    }),
  );

  const searchInput = await view.findByPlaceholderText("Search emoji");
  await user.type(searchInput, "heart");

  const matchingEmojiButton = await waitFor(() => {
    const button = within(window.document.body).getByRole("button", { name: "heart eyes" });
    assert.ok(button);
    return button;
  });

  await user.click(matchingEmojiButton);

  assert.deepEqual(selections, ["😍"]);
  assert.equal(searchInput.value, "");
});

test("EmojiPicker uses localized placeholder and empty state", async () => {
  const pickerMod = await importTsModule(path.join(componentsRoot, "EmojiPicker.tsx"));
  const EmojiPicker = pickerMod.default;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "vi";

  const view = render(React.createElement(EmojiPicker, { onEmojiSelect: () => {} }));

  const searchInput = await view.findByPlaceholderText("Tìm kiếm biểu tượng cảm xúc");
  await user.type(searchInput, "khong-co-emoji");

  await waitFor(() => {
    assert.ok(within(view.container).getByText("Không tìm thấy emoji"));
    assert.ok(within(view.container).getByText("Thử từ khóa khác"));
  });
});

test("EmojiPicker prefers NextIntlAdapter messages over document locale fallback", async () => {
  const pickerMod = await importTsModule(path.join(componentsRoot, "EmojiPicker.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const EmojiPicker = pickerMod.default;
  const { NextIntlAdapter } = adapterMod;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "en";

  const view = render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "ko",
        onError: () => {},
        messages: {
          UEditor: {
            emojiPicker: {
              searchPlaceholder: "브리지 이모지 검색",
              noResults: "브리지 결과 없음",
              tryDifferentSearch: "브리지 다른 키워드",
            },
          },
        },
      },
      React.createElement(
        NextIntlAdapter,
        null,
        React.createElement(EmojiPicker, { onEmojiSelect: () => {} }),
      ),
    ),
  );

  const searchInput = await view.findByPlaceholderText("브리지 이모지 검색");
  await user.type(searchInput, "khong-co-emoji");

  await waitFor(() => {
    assert.ok(within(view.container).getByText("브리지 결과 없음"));
    assert.ok(within(view.container).getByText("브리지 다른 키워드"));
  });
});

test("UEditor emoji suggestion inserts the selected emoji", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "en";

  const view = render(
    React.createElement(UEditor, {
      content: "",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  await user.type(editorElement, ":heart");

  const suggestionButton = await waitFor(() => {
    const button = within(window.document.body).getByRole("button", { name: "heart eyes" });
    assert.ok(button);
    return button;
  });

  await user.click(suggestionButton);

  await waitFor(() => {
    const textContent = editorElement.textContent ?? "";
    assert.match(textContent, /😍/);
    assert.doesNotMatch(textContent, /:heart/);
  });
});

test("UEditor emoji suggestion localizes the empty state", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "vi";

  const view = render(
    React.createElement(UEditor, {
      content: "",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  await user.type(editorElement, ":khongco");

  await waitFor(() => {
    assert.ok(within(window.document.body).getByText("Không tìm thấy emoji"));
  });
});

test("UEditor emoji suggestion prefers NextIntlAdapter messages over document locale fallback", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const UEditor = mod.default;
  const { NextIntlAdapter } = adapterMod;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "en";

  const view = render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "ko",
        onError: () => {},
        messages: {
          UEditor: {
            emojiSuggestion: {
              title: "브리지 이모지",
              noResults: "브리지 제안 없음",
              showingCount: "브리지 {shown}/{total}",
            },
          },
        },
      },
      React.createElement(
        NextIntlAdapter,
        null,
        React.createElement(UEditor, {
          content: "",
          showBubbleMenu: false,
          showFloatingMenu: false,
          showCharacterCount: false,
        }),
      ),
    ),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  await user.type(editorElement, ":khongco");

  await waitFor(() => {
    assert.ok(within(window.document.body).getByText("브리지 제안 없음"));
  });
});

test("UEditor slash command inserts a table block", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  document.documentElement.lang = "en";

  const view = render(
    React.createElement(UEditor, {
      content: "",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  await user.type(editorElement, "/table");

  const tableCommandButton = await waitFor(() => {
    const button = within(window.document.body).getByRole("button", { name: /table/i });
    assert.ok(button);
    return button;
  });

  await user.click(tableCommandButton);

  await waitFor(() => {
    const table = view.container.querySelector("table");
    assert.ok(table);
    assert.equal(table.querySelectorAll("tr").length, 3);
  });
});
