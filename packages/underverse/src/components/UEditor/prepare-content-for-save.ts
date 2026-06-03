import type {
  UEditorPrepareContentForSaveResult,
  UEditorPrepareContentUploadMeta,
  UEditorUploadImageForSave,
  UEditorUploadImageForSaveResult,
} from "./types.ts";
import { sanitizeUEditorUrl } from "./url-safety.ts";

type ImgTagMatch = {
  start: number;
  end: number;
  tag: string;
  srcAttr: {
    start: number;
    end: number;
    value: string;
    quote: "\"" | "'" | "";
  } | null;
};

type Base64Candidate = {
  id: string;
  match: ImgTagMatch;
  index: number;
  src: string;
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/x-icon": "ico",
  "image/avif": "avif",
};

function isDataImageUrl(value: string): boolean {
  return /^data:image\//i.test(value.trim());
}

function parseDataImageUrl(dataUrl: string): { mime: string; base64Data: string } | null {
  const value = dataUrl.trim();
  if (!isDataImageUrl(value)) return null;

  const commaIndex = value.indexOf(",");
  if (commaIndex < 0) return null;

  const header = value.slice(5, commaIndex);
  const base64Data = value.slice(commaIndex + 1).trim();
  if (!/;base64/i.test(header)) return null;

  const mime = header.split(";")[0]?.trim().toLowerCase();
  if (!mime || !base64Data) return null;

  return { mime, base64Data };
}

function decodeBase64ToBytes(base64Data: string): Uint8Array {
  const normalized = base64Data.replace(/\s+/g, "");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(normalized, "base64"));
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function inferFileExtension(mime: string): string {
  return MIME_EXTENSION_MAP[mime] ?? "bin";
}

function createFileFromDataImageUrl(dataUrl: string, index: number): File {
  const parsed = parseDataImageUrl(dataUrl);
  if (!parsed) {
    throw new Error("Invalid data image URL format.");
  }

  const bytes = decodeBase64ToBytes(parsed.base64Data);
  const extension = inferFileExtension(parsed.mime);
  const name = `ueditor-image-${index + 1}.${extension}`;
  return new File([bytes as unknown as BlobPart], name, { type: parsed.mime });
}

function normalizeUploadResult(result: UEditorUploadImageForSaveResult): { url: string; meta?: UEditorPrepareContentUploadMeta } {
  if (typeof result === "string") {
    const url = sanitizeUEditorUrl(result, "image");
    if (!url) throw new Error("Upload handler returned an empty URL.");
    return { url };
  }

  if (!result || typeof result !== "object") {
    throw new Error("Upload handler returned invalid result.");
  }

  const url = typeof result.url === "string" ? sanitizeUEditorUrl(result.url, "image") : "";
  if (!url) throw new Error("Upload handler object result is missing `url`.");

  const { url: _ignoredUrl, ...rest } = result;
  const meta = Object.keys(rest).length > 0 ? rest : undefined;
  return { url, meta };
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const limit = Math.max(1, Math.floor(concurrency));
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runNext() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
  return results;
}

function getErrorReason(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Unknown upload error.";
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");
}

export function normalizeImageUrl(url: string): string {
  const input = decodeHtmlEntities(url.trim());
  if (!input) return "";
  if (isDataImageUrl(input)) return input;

  const isAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input);
  if (!isAbsolute) {
    return input.split("#")[0] ?? input;
  }

  try {
    const parsed = new URL(input);
    parsed.hash = "";

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      parsed.hostname = parsed.hostname.toLowerCase();
      if ((parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443")) {
        parsed.port = "";
      }
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
    }

    return parsed.toString();
  } catch {
    return input.split("#")[0] ?? input;
  }
}

function replaceSrcInTag(match: ImgTagMatch, nextSrc: string): string {
  if (!match.srcAttr) return match.tag;

  const { start, end, quote } = match.srcAttr;
  const escaped =
    quote === "\""
      ? nextSrc.replace(/"/g, "&quot;")
      : quote === "'"
        ? nextSrc.replace(/'/g, "&#39;")
        : nextSrc;

  const srcAttr = quote ? `src=${quote}${escaped}${quote}` : `src=${escaped}`;
  return `${match.tag.slice(0, start)}${srcAttr}${match.tag.slice(end)}`;
}

function collectImgTagMatches(html: string): ImgTagMatch[] {
  const matches: ImgTagMatch[] = [];
  const imgRegex = /<img\b[^>]*>/gi;
  const srcAttrRegex = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

  let tagMatch: RegExpExecArray | null = imgRegex.exec(html);
  while (tagMatch) {
    const tag = tagMatch[0];
    const start = tagMatch.index;
    const end = start + tag.length;

    const srcMatch = srcAttrRegex.exec(tag);
    let srcAttr: ImgTagMatch["srcAttr"] = null;

    if (srcMatch) {
      const value = srcMatch[1] ?? srcMatch[2] ?? srcMatch[3] ?? "";
      const quote: "\"" | "'" | "" = srcMatch[1] !== undefined ? "\"" : srcMatch[2] !== undefined ? "'" : "";
      srcAttr = {
        start: srcMatch.index,
        end: srcMatch.index + srcMatch[0].length,
        value,
        quote,
      };
    }

    matches.push({ start, end, tag, srcAttr });
    tagMatch = imgRegex.exec(html);
  }

  return matches;
}

export function extractImageSrcsFromHtml(html: string): string[] {
  if (!html || !html.includes("<img")) return [];

  return collectImgTagMatches(html)
    .map((match) => decodeHtmlEntities(match.srcAttr?.value.trim() ?? ""))
    .filter(Boolean);
}

function createResult({
  html,
  uploaded,
  inlineUploaded,
  errors,
}: {
  html: string;
  uploaded: UEditorPrepareContentForSaveResult["uploaded"];
  inlineUploaded: UEditorPrepareContentForSaveResult["inlineUploaded"];
  errors: UEditorPrepareContentForSaveResult["errors"];
}): UEditorPrepareContentForSaveResult {
  return {
    html,
    uploaded,
    inlineImageUrls: extractImageSrcsFromHtml(html),
    inlineUploaded,
    errors,
  };
}

export class UEditorPrepareContentForSaveError extends Error {
  readonly result: UEditorPrepareContentForSaveResult;

  constructor(result: UEditorPrepareContentForSaveResult) {
    super(
      `Failed to upload ${result.errors.length} image(s): ${result.errors
        .map((item) => `#${item.index} ${item.reason}`)
        .join("; ")}`,
    );
    this.name = "UEditorPrepareContentForSaveError";
    this.result = result;
  }
}

function isDataUrl(value: string): boolean {
  return /^data:[^/]+\/[^;]+;base64,/i.test(value.trim());
}

function parseDataUrl(dataUrl: string): { mime: string; base64Data: string } | null {
  const value = dataUrl.trim();
  if (!/^data:/i.test(value)) return null;

  const commaIndex = value.indexOf(",");
  if (commaIndex < 0) return null;

  const header = value.slice(5, commaIndex);
  const base64Data = value.slice(commaIndex + 1).trim();
  if (!/;base64/i.test(header)) return null;

  const mime = header.split(";")[0]?.trim().toLowerCase();
  if (!mime || !base64Data) return null;

  return { mime, base64Data };
}

function createFileFromDataUrl(dataUrl: string, name: string): File {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error("Invalid data URL format.");
  }

  const bytes = decodeBase64ToBytes(parsed.base64Data);
  return new File([bytes as unknown as BlobPart], name || "attachment.bin", { type: parsed.mime });
}

type FileTagMatch = {
  start: number;
  end: number;
  tag: string;
  hrefAttr: {
    start: number;
    end: number;
    value: string;
    quote: "\"" | "'" | "";
  } | null;
  dataSrcAttr: {
    start: number;
    end: number;
    value: string;
    quote: "\"" | "'" | "";
  } | null;
};

function collectFileCardMatches(html: string): FileTagMatch[] {
  const matches: FileTagMatch[] = [];
  const tagRegex = /<(div|a)\b[^>]*data-type="file-card"[^>]*>/gi;
  const hrefAttrRegex = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;
  const dataSrcRegex = /\bdata-src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

  let tagMatch: RegExpExecArray | null = tagRegex.exec(html);
  while (tagMatch) {
    const tag = tagMatch[0];
    const start = tagMatch.index;
    const end = start + tag.length;

    const hrefMatch = hrefAttrRegex.exec(tag);
    let hrefAttr = null;
    if (hrefMatch) {
      const value = hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? "";
      const quote = hrefMatch[1] !== undefined ? "\"" : hrefMatch[2] !== undefined ? "'" : "";
      hrefAttr = {
        start: hrefMatch.index,
        end: hrefMatch.index + hrefMatch[0].length,
        value,
        quote: quote as "\"" | "'" | "",
      };
    }

    const dataSrcMatch = dataSrcRegex.exec(tag);
    let dataSrcAttr = null;
    if (dataSrcMatch) {
      const value = dataSrcMatch[1] ?? dataSrcMatch[2] ?? dataSrcMatch[3] ?? "";
      const quote = dataSrcMatch[1] !== undefined ? "\"" : dataSrcMatch[2] !== undefined ? "'" : "";
      dataSrcAttr = {
        start: dataSrcMatch.index,
        end: dataSrcMatch.index + dataSrcMatch[0].length,
        value,
        quote: quote as "\"" | "'" | "",
      };
    }

    matches.push({ start, end, tag, hrefAttr, dataSrcAttr });
    tagMatch = tagRegex.exec(html);
  }

  return matches;
}

function replaceFileCardAttrs(tag: string, nextUrl: string): string {
  let result = tag;

  const hrefRegex = /(\bhref\s*=\s*)(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+)/i;
  const dataSrcRegex = /(\bdata-src\s*=\s*)(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+)/i;

  if (hrefRegex.test(result)) {
    result = result.replace(hrefRegex, `$1"${nextUrl}"`);
  }
  if (dataSrcRegex.test(result)) {
    result = result.replace(dataSrcRegex, `$1"${nextUrl}"`);
  }

  return result;
}

export async function prepareUEditorContentForSave({
  html,
  uploadImageForSave,
  uploadFileForSave,
  uploadConcurrency = 3,
}: {
  html: string;
  uploadImageForSave?: UEditorUploadImageForSave;
  uploadFileForSave?: (file: File) => Promise<string | ({ url: string } & Record<string, unknown>)>;
  uploadConcurrency?: number;
}): Promise<UEditorPrepareContentForSaveResult> {
  const hasImages = html && html.includes("<img");
  const hasFileCards = html && html.includes("data-type=\"file-card\"");

  if (!hasImages && !hasFileCards) {
    return createResult({ html, uploaded: [], inlineUploaded: [], errors: [] });
  }

  const imgMatches = hasImages ? collectImgTagMatches(html) : [];
  const fileCardMatches = hasFileCards ? collectFileCardMatches(html) : [];

  if (imgMatches.length === 0 && fileCardMatches.length === 0) {
    return createResult({ html, uploaded: [], inlineUploaded: [], errors: [] });
  }

  const base64Candidates: Base64Candidate[] = [];
  for (const match of imgMatches) {
    if (!match.srcAttr) continue;
    const src = match.srcAttr.value.trim();
    if (!isDataImageUrl(src)) continue;

    base64Candidates.push({
      id: `${match.start}:${match.end}`,
      match,
      index: base64Candidates.length,
      src,
    });
  }

  const fileCandidates: { id: string; match: FileTagMatch; index: number; src: string; fileName: string }[] = [];
  for (const match of fileCardMatches) {
    const src = (match.dataSrcAttr?.value || match.hrefAttr?.value || "").trim();
    if (!src || !isDataUrl(src)) continue;

    const fileNameRegex = /\bdata-file-name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;
    const fileNameMatch = fileNameRegex.exec(match.tag);
    const fileName = fileNameMatch ? (fileNameMatch[1] ?? fileNameMatch[2] ?? fileNameMatch[3] ?? "attachment.bin") : "attachment.bin";

    fileCandidates.push({
      id: `${match.start}:${match.end}`,
      match,
      index: fileCandidates.length,
      src,
      fileName,
    });
  }

  if (base64Candidates.length === 0 && fileCandidates.length === 0) {
    return createResult({ html, uploaded: [], inlineUploaded: [], errors: [] });
  }

  const uploaded: UEditorPrepareContentForSaveResult["uploaded"] = [];
  const inlineUploaded: UEditorPrepareContentForSaveResult["inlineUploaded"] = [];
  const errors: UEditorPrepareContentForSaveResult["errors"] = [];
  const replacements = new Map<string, string>();

  // Process Images
  if (base64Candidates.length > 0) {
    if (!uploadImageForSave) {
      for (const item of base64Candidates) {
        errors.push({
          index: item.index,
          reason: "`uploadImageForSave` is required to transform base64 images before save.",
        });
      }
    } else {
      const uploadResults = await runWithConcurrency(
        base64Candidates,
        uploadConcurrency,
        async (candidate) => {
          try {
            const file = createFileFromDataImageUrl(candidate.src, candidate.index);
            const uploadResult = await uploadImageForSave(file);
            const normalized = normalizeUploadResult(uploadResult);
            return { candidate, file, ...normalized };
          } catch (error) {
            return { candidate, error: getErrorReason(error) };
          }
        },
      );

      for (const item of uploadResults) {
        if ("error" in item) {
          errors.push({
            index: item.candidate.index,
            reason: item.error ?? "Unknown upload error.",
          });
          continue;
        }

        replacements.set(item.candidate.id, item.url);
        uploaded.push({
          url: item.url,
          file: item.file,
          meta: item.meta,
        });
        inlineUploaded.push({
          index: item.candidate.index,
          url: item.url,
          file: item.file,
          meta: item.meta,
        });
      }
    }
  }

  // Process File Cards
  if (fileCandidates.length > 0) {
    const uploadFn = uploadFileForSave || uploadImageForSave;
    if (!uploadFn) {
      for (const item of fileCandidates) {
        errors.push({
          index: base64Candidates.length + item.index,
          reason: "`uploadFileForSave` or `uploadImageForSave` is required to transform base64 files before save.",
        });
      }
    } else {
      const fileUploadResults = await runWithConcurrency(
        fileCandidates,
        uploadConcurrency,
        async (candidate) => {
          try {
            const file = createFileFromDataUrl(candidate.src, candidate.fileName);
            const uploadResult = await uploadFn(file);
            const normalized = normalizeUploadResult(uploadResult);
            return { candidate, file, ...normalized };
          } catch (error) {
            return { candidate, error: getErrorReason(error) };
          }
        },
      );

      for (const item of fileUploadResults) {
        if ("error" in item) {
          errors.push({
            index: base64Candidates.length + item.candidate.index,
            reason: item.error ?? "Unknown file upload error.",
          });
          continue;
        }

        replacements.set(item.candidate.id, item.url);
        uploaded.push({
          url: item.url,
          file: item.file,
          meta: item.meta,
        });
      }
    }
  }

  // Combine and sort replacements
  const allMatches: ({ type: "img"; match: ImgTagMatch } | { type: "file"; match: FileTagMatch })[] = [];
  for (const match of imgMatches) {
    allMatches.push({ type: "img", match });
  }
  for (const match of fileCardMatches) {
    allMatches.push({ type: "file", match });
  }
  allMatches.sort((a, b) => a.match.start - b.match.start);

  let transformed = "";
  let cursor = 0;

  for (const item of allMatches) {
    const match = item.match;
    transformed += html.slice(cursor, match.start);

    const replacementKey = `${match.start}:${match.end}`;
    const replacementUrl = replacements.get(replacementKey);

    if (item.type === "img") {
      const imgMatch = match as ImgTagMatch;
      transformed += replacementUrl ? replaceSrcInTag(imgMatch, replacementUrl) : imgMatch.tag;
    } else {
      const fileMatch = match as FileTagMatch;
      transformed += replacementUrl ? replaceFileCardAttrs(fileMatch.tag, replacementUrl) : fileMatch.tag;
    }

    cursor = match.end;
  }

  transformed += html.slice(cursor);

  return createResult({ html: transformed, uploaded, inlineUploaded, errors });
}
