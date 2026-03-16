import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { importTsModule } from "./helpers/import-ts-module.mjs";

const contextsRoot = path.resolve(import.meta.dirname, "../src/contexts");

test("getUnderverseDefaultTranslation resolves nested dot-path keys for UEditor", async () => {
  const mod = await importTsModule(path.join(contextsRoot, "TranslationContext.tsx"));
  const { getUnderverseDefaultTranslation } = mod;

  assert.equal(getUnderverseDefaultTranslation("en", "UEditor", "toolbar.normal"), "Normal text");
  assert.equal(getUnderverseDefaultTranslation("vi", "UEditor", "toolbar.normal"), "Văn bản thường");
  assert.equal(getUnderverseDefaultTranslation("en", "UEditor", "toolbar.textStyle"), "Text Style");
  assert.equal(getUnderverseDefaultTranslation("vi", "UEditor", "toolbar.textStyle"), "Kiểu chữ");
});
