export type UEditorUrlKind = "link" | "image";

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

function normalizeUrlInput(raw: string) {
  return raw.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "");
}

function isProtocolRelativeUrl(value: string) {
  return value.startsWith("//");
}

function isRelativeUrl(value: string) {
  return value.startsWith("/") || value.startsWith("./") || value.startsWith("../") || value.startsWith("#");
}

function isDataImageUrl(value: string) {
  return /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml|bmp|x-icon|avif);base64,/i.test(value);
}

export function isSafeUEditorUrl(raw: string, kind: UEditorUrlKind): boolean {
  const value = normalizeUrlInput(raw);
  if (!value) return false;

  if (kind === "image" && isDataImageUrl(value)) return true;
  if (isRelativeUrl(value)) return true;
  if (isProtocolRelativeUrl(value)) return false;

  try {
    const parsed = new URL(value);
    return kind === "image" ? IMAGE_PROTOCOLS.has(parsed.protocol) : LINK_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUEditorUrl(raw: string, kind: UEditorUrlKind): string {
  const value = raw.trim();
  if (!value) return "";

  if (isSafeUEditorUrl(value, kind)) return normalizeUrlInput(value);

  if (kind === "link" && !isProtocolRelativeUrl(value) && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    const withProtocol = `https://${value}`;
    return isSafeUEditorUrl(withProtocol, kind) ? withProtocol : "";
  }

  return "";
}
