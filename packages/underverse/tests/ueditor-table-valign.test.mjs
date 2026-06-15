import test, { after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";
import { importTsModule } from "./helpers/import-ts-module.mjs";

// Set up virtual DOM for Tiptap
const uninstall = installJSDOM();
after(() => uninstall());

// Import Tiptap and extensions dynamically to ensure window object is already initialized by JSDOM
const { Editor } = await import("@tiptap/core");
const { default: Document } = await import("@tiptap/extension-document");
const { default: Paragraph } = await import("@tiptap/extension-paragraph");
const { default: Text } = await import("@tiptap/extension-text");

// Resolve absolute paths
const componentsDir = path.resolve(import.meta.dirname, "../src/components/UEditor");

const { CustomTableCell, CustomTableHeader } = await importTsModule(path.join(componentsDir, "extensions.ts"));
const { default: UEditorTable } = await importTsModule(path.join(componentsDir, "table-align.ts"));
const { default: UEditorTableRow } = await importTsModule(path.join(componentsDir, "table-row.ts"));

test("CustomTableCell parses style vertical-align correctly", () => {
  const editor = new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      UEditorTable,
      UEditorTableRow,
      CustomTableCell,
      CustomTableHeader,
    ],
    content: `
      <table>
        <tbody>
          <tr>
            <td style="vertical-align: middle;">Cell 1</td>
            <td data-vertical-align="bottom">Cell 2</td>
            <td>Cell 3</td>
          </tr>
        </tbody>
      </table>
    `,
  });

  const doc = editor.state.doc;
  const cells = [];
  doc.descendants((node) => {
    if (node.type.name === "tableCell") {
      cells.push(node);
    }
  });

  assert.equal(cells.length, 3);
  assert.equal(cells[0].attrs.verticalAlign, "middle");
  assert.equal(cells[1].attrs.verticalAlign, "bottom");
  assert.equal(cells[2].attrs.verticalAlign, null);

  // Check generated HTML includes style vertical-align
  const html = editor.getHTML();
  assert.match(html, /vertical-align:\s*middle/);
  assert.match(html, /vertical-align:\s*bottom/);
  assert.match(html, /data-vertical-align="middle"/);
  assert.match(html, /data-vertical-align="bottom"/);

  editor.destroy();
});

test("CustomTableHeader parses style vertical-align correctly", () => {
  const editor = new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      UEditorTable,
      UEditorTableRow,
      CustomTableCell,
      CustomTableHeader,
    ],
    content: `
      <table>
        <thead>
          <tr>
            <th style="vertical-align: bottom;">Header 1</th>
            <th data-vertical-align="top">Header 2</th>
          </tr>
        </thead>
      </table>
    `,
  });

  const doc = editor.state.doc;
  const headers = [];
  doc.descendants((node) => {
    if (node.type.name === "tableHeader") {
      headers.push(node);
    }
  });

  assert.equal(headers.length, 2);
  assert.equal(headers[0].attrs.verticalAlign, "bottom");
  assert.equal(headers[1].attrs.verticalAlign, "top");

  // Check generated HTML includes style vertical-align
  const html = editor.getHTML();
  assert.match(html, /vertical-align:\s*bottom/);
  assert.match(html, /vertical-align:\s*top/);
  assert.match(html, /data-vertical-align="bottom"/);
  assert.match(html, /data-vertical-align="top"/);

  editor.destroy();
});
