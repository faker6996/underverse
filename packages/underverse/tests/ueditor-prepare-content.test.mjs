import assert from "node:assert/strict";
import test from "node:test";

import {
  extractImageSrcsFromHtml,
  normalizeImageUrl,
  prepareUEditorContentForSave,
  UEditorPrepareContentForSaveError,
} from "../src/components/UEditor/prepare-content-for-save.ts";
import { sanitizeUEditorUrl } from "../src/components/UEditor/url-safety.ts";

const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5eUAAAAASUVORK5CYII=";

test("normalizeImageUrl canonicalizes hosts, ports, fragments, and html entities", () => {
  assert.equal(normalizeImageUrl(" https://CDN.Example.com:443/path/to/image.png/#viewer "), "https://cdn.example.com/path/to/image.png");
  assert.equal(normalizeImageUrl("http://cdn.example.com:80/path/to/image.png#viewer"), "http://cdn.example.com/path/to/image.png");
  assert.equal(normalizeImageUrl("/uploads/image.png#thumb"), "/uploads/image.png");
  assert.equal(normalizeImageUrl("https://cdn.example.com/image.png?x=1&amp;y=2#hash"), "https://cdn.example.com/image.png?x=1&y=2");
});

test("extractImageSrcsFromHtml reads quoted, unquoted, and entity-encoded src values", () => {
  const html = [
    '<img src="https://cdn.example.com/a.png?x=1&amp;y=2" alt="a" />',
    "<img src='/images/b.png#preview' alt='b' />",
    "<img src=relative/c.png alt=c />",
  ].join("");

  assert.deepEqual(extractImageSrcsFromHtml(html), [
    "https://cdn.example.com/a.png?x=1&y=2",
    "/images/b.png#preview",
    "relative/c.png",
  ]);
});

test("sanitizeUEditorUrl blocks unsafe editor urls", () => {
  assert.equal(sanitizeUEditorUrl("example.com/post", "link"), "https://example.com/post");
  assert.equal(sanitizeUEditorUrl("/posts/1", "link"), "/posts/1");
  assert.equal(sanitizeUEditorUrl("mailto:hello@example.com", "link"), "mailto:hello@example.com");
  assert.equal(sanitizeUEditorUrl("javascript:alert(1)", "link"), "");
  assert.equal(sanitizeUEditorUrl("data:text/html;base64,PGgxPkJvb208L2gxPg==", "image"), "");
  assert.equal(sanitizeUEditorUrl("https://cdn.example.com/photo.png", "image"), "https://cdn.example.com/photo.png");
});

test("prepareUEditorContentForSave keeps invalid data urls untouched and records structured upload errors", async () => {
  const html = [
    '<img src="data:image/png,not-base64" alt="invalid-format" />',
    `<img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="empty-result" />`,
    `<img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="throws" />`,
  ].join("");

  let callCount = 0;
  const result = await prepareUEditorContentForSave({
    html,
    uploadImageForSave: async () => {
      callCount += 1;
      if (callCount === 1) return { url: "   " };
      throw new Error("network failed");
    },
  });

  assert.equal(result.uploaded.length, 0);
  assert.equal(result.inlineUploaded.length, 0);
  assert.equal(result.errors.length, 3);
  assert.match(result.errors[0]?.reason ?? "", /invalid data image url format/i);
  assert.match(result.errors[1]?.reason ?? "", /empty URL|missing `url`/i);
  assert.match(result.errors[2]?.reason ?? "", /network failed/i);
  assert.match(result.html, /data:image\/png,not-base64/);
  assert.match(result.html, /data:image\/png;base64/);
});

test("UEditorPrepareContentForSaveError exposes the original result payload", async () => {
  const result = await prepareUEditorContentForSave({
    html: `<img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="needs-upload" />`,
  });

  const error = new UEditorPrepareContentForSaveError(result);
  assert.equal(error.result, result);
  assert.match(error.message, /Failed to upload 1 image/);
  assert.match(error.message, /uploadImageForSave/);
});
