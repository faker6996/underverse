import test from "node:test";
import assert from "node:assert/strict";
import { extractImageSrcsFromHtml, normalizeImageUrl, prepareUEditorContentForSave } from "../prepare-content-for-save.ts";

const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5eUAAAAASUVORK5CYII=";

const ONE_PIXEL_GIF_BASE64 = "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

test("prepareUEditorContentForSave uploads base64 images and only replaces src", async () => {
  const inputHtml = [
    "<p>Before image</p>",
    `<img alt="hero" width="120" height="80" style="width: 120px; height: 80px;" src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" data-resize="manual" />`,
    '<img src="https://cdn.example.com/keep.png" alt="keep-http" />',
    '<img src="/static/keep-local.png" alt="keep-local" />',
    "<p>After image</p>",
  ].join("");

  const result = await prepareUEditorContentForSave({
    html: inputHtml,
    uploadImageForSave: async (_file) => ({
      url: "https://cdn.example.com/uploaded/hero.png",
      assetId: "asset_001",
    }),
  });

  assert.equal(result.errors.length, 0);
  assert.equal(result.uploaded.length, 1);
  assert.equal(result.inlineUploaded.length, 1);
  assert.equal(result.inlineUploaded[0]?.index, 0);
  assert.equal(result.inlineUploaded[0]?.url, "https://cdn.example.com/uploaded/hero.png");
  assert.deepEqual(result.inlineUploaded[0]?.meta, { assetId: "asset_001" });
  assert.equal(result.uploaded[0]?.url, "https://cdn.example.com/uploaded/hero.png");
  assert.deepEqual(result.uploaded[0]?.meta, { assetId: "asset_001" });
  assert.deepEqual(result.inlineImageUrls, [
    "https://cdn.example.com/uploaded/hero.png",
    "https://cdn.example.com/keep.png",
    "/static/keep-local.png",
  ]);
  assert.match(result.html, /src="https:\/\/cdn\.example\.com\/uploaded\/hero\.png"/);
  assert.match(result.html, /alt="hero"/);
  assert.match(result.html, /width="120"/);
  assert.match(result.html, /height="80"/);
  assert.match(result.html, /style="width: 120px; height: 80px;"/);
  assert.match(result.html, /data-resize="manual"/);
  assert.match(result.html, /src="https:\/\/cdn\.example\.com\/keep\.png"/);
  assert.match(result.html, /src="\/static\/keep-local\.png"/);
  assert.ok(!result.html.includes("data:image/png;base64"));
  assert.ok(result.html.includes("<p>Before image</p>"));
  assert.ok(result.html.includes("<p>After image</p>"));
});

test("prepareUEditorContentForSave returns per-image errors and keeps failed data:image src", async () => {
  let callCount = 0;
  const inputHtml = [
    `<img alt="ok" src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" />`,
    `<img alt="fail" src="data:image/gif;base64,${ONE_PIXEL_GIF_BASE64}" />`,
  ].join("");

  const result = await prepareUEditorContentForSave({
    html: inputHtml,
    uploadImageForSave: async (_file) => {
      callCount += 1;
      if (callCount === 2) {
        throw new Error("S3 upload timeout");
      }
      return "https://cdn.example.com/uploaded/ok.png";
    },
  });

  assert.equal(result.uploaded.length, 1);
  assert.equal(result.inlineUploaded.length, 1);
  assert.equal(result.inlineUploaded[0]?.index, 0);
  assert.equal(result.inlineUploaded[0]?.url, "https://cdn.example.com/uploaded/ok.png");
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0]?.index, 1);
  assert.match(result.errors[0]?.reason ?? "", /S3 upload timeout/);
  assert.match(result.html, /src="https:\/\/cdn\.example\.com\/uploaded\/ok\.png"/);
  assert.match(result.html, /data:image\/gif;base64/);
});

test("prepareUEditorContentForSave does nothing when no data:image exists", async () => {
  const inputHtml = [
    "<p>No base64 here</p>",
    '<img src="https://cdn.example.com/a.png" alt="a" />',
    '<img src="/images/b.png" alt="b" />',
    '<img src="relative/c.png" alt="c" />',
  ].join("");

  const result = await prepareUEditorContentForSave({
    html: inputHtml,
  });

  assert.equal(result.html, inputHtml);
  assert.equal(result.uploaded.length, 0);
  assert.equal(result.inlineUploaded.length, 0);
  assert.equal(result.errors.length, 0);
  assert.deepEqual(result.inlineImageUrls, [
    "https://cdn.example.com/a.png",
    "/images/b.png",
    "relative/c.png",
  ]);
});

test("prepareUEditorContentForSave reports missing uploadImageForSave for data:image", async () => {
  const inputHtml = `<img alt="need-upload" src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" />`;
  const result = await prepareUEditorContentForSave({ html: inputHtml });

  assert.equal(result.html, inputHtml);
  assert.equal(result.uploaded.length, 0);
  assert.equal(result.inlineUploaded.length, 0);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0]?.index, 0);
  assert.match(result.errors[0]?.reason ?? "", /uploadImageForSave/);
  assert.equal(result.inlineImageUrls.length, 1);
  assert.match(result.inlineImageUrls[0] ?? "", /data:image\/png;base64/);
});

test("dedupe helpers provide stable inline URL matching for attachment filtering", async () => {
  const html = [
    '<img src="https://CDN.Example.com/uploaded/photo.png#viewer" />',
    '<img src="/images/poster.png?size=lg" />',
  ].join("");

  const extracted = extractImageSrcsFromHtml(html);
  assert.deepEqual(extracted, [
    "https://CDN.Example.com/uploaded/photo.png#viewer",
    "/images/poster.png?size=lg",
  ]);

  const inlineSet = new Set(extracted.map((item) => normalizeImageUrl(item)));
  const attachments = [
    "https://cdn.example.com/uploaded/photo.png",
    "https://cdn.example.com/extra.png",
    "/images/poster.png?size=lg#thumb",
  ];

  const deduped = attachments.filter((url) => !inlineSet.has(normalizeImageUrl(url)));
  assert.deepEqual(deduped, ["https://cdn.example.com/extra.png"]);
});
