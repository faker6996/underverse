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

// Resolve absolute paths to prevent CWD dependency issues in test runner
const componentsDir = path.resolve(import.meta.dirname, "../src/components/UEditor");

const { FormCheckbox } = await importTsModule(path.join(componentsDir, "form-checkbox.ts"));
const { FormRadio } = await importTsModule(path.join(componentsDir, "form-radio.ts"));
const { prepareUEditorContentForSave } = await importTsModule(path.join(componentsDir, "prepare-content-for-save.ts"));

test("prepareUEditorContentForSave processes file cards and replaces data URL base64", async () => {
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5eUAAAAASUVORK5CYII=";
  const dataUrl = `data:application/pdf;base64,${dummyBase64}`;
  const inputHtml = `<div data-type="file-card" href="${dataUrl}" data-src="${dataUrl}" data-file-name="report.pdf">Report</div>`;

  const result = await prepareUEditorContentForSave({
    html: inputHtml,
    uploadFileForSave: async (file) => {
      assert.equal(file.name, "report.pdf");
      assert.equal(file.type, "application/pdf");
      return "https://cdn.example.com/files/report.pdf";
    },
  });

  assert.equal(result.errors.length, 0);
  assert.equal(result.uploaded.length, 1);
  assert.equal(result.uploaded[0]?.url, "https://cdn.example.com/files/report.pdf");
  assert.match(result.html, /href="https:\/\/cdn\.example\.com\/files\/report\.pdf"/);
  assert.match(result.html, /data-src="https:\/\/cdn\.example\.com\/files\/report\.pdf"/);
  assert.ok(!result.html.includes("data:application/pdf;base64"));
});

test("FormCheckbox extension parses and renders correctly", () => {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, FormCheckbox],
    content: `<p>Check here: <input type="checkbox" data-type="form-checkbox" data-checked="true" id="chk-test" name="test-name" /></p>`,
  });

  const html = editor.getHTML();
  assert.match(html, /type="checkbox"/);
  assert.match(html, /data-type="form-checkbox"/);
  assert.match(html, /data-checked="true"/);
  assert.match(html, /id="chk-test"/);
  assert.match(html, /name="test-name"/);

  editor.destroy();
});

test("FormRadio extension parses, renders, and unchecks sibling radios in the same group", () => {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, FormRadio],
    content: `
      <p>
        <input type="radio" data-type="form-radio" data-checked="true" id="rad-1" name="group-a" />
        <input type="radio" data-type="form-radio" data-checked="false" id="rad-2" name="group-a" />
        <input type="radio" data-type="form-radio" data-checked="true" id="rad-3" name="group-b" />
      </p>
    `,
  });

  // Verify initial parsed checked states
  let rad1Checked = false;
  let rad2Checked = false;
  let rad3Checked = false;

  editor.state.doc.descendants((node) => {
    if (node.type.name === "formRadio") {
      if (node.attrs.id === "rad-1") rad1Checked = node.attrs.checked;
      if (node.attrs.id === "rad-2") rad2Checked = node.attrs.checked;
      if (node.attrs.id === "rad-3") rad3Checked = node.attrs.checked;
    }
  });

  assert.equal(rad1Checked, true);
  assert.equal(rad2Checked, false);
  assert.equal(rad3Checked, true);

  // Check rad-2, which is in group-a. This should uncheck rad-1 (group-a) but leave rad-3 (group-b) checked.
  editor.commands.checkFormRadio("rad-2");

  editor.state.doc.descendants((node) => {
    if (node.type.name === "formRadio") {
      if (node.attrs.id === "rad-1") rad1Checked = node.attrs.checked;
      if (node.attrs.id === "rad-2") rad2Checked = node.attrs.checked;
      if (node.attrs.id === "rad-3") rad3Checked = node.attrs.checked;
    }
  });

  assert.equal(rad1Checked, false, "rad-1 (same group) should be unchecked");
  assert.equal(rad2Checked, true, "rad-2 should now be checked");
  assert.equal(rad3Checked, true, "rad-3 (different group) should remain checked");

  editor.destroy();
});
