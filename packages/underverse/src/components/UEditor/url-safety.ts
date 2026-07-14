export type UEditorUrlKind = "link" | "image" | "file";

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);
const FILE_PROTOCOLS = new Set(["http:", "https:", "blob:"]);

function normalizeUrlInput(raw: string) {
  return raw.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "");
}

function isProtocolRelativeUrl(value: string) {
  return value.startsWith("//");
}

function isRelativeUrl(value: string) {
  return value.startsWith("/") || value.startsWith("./") || value.startsWith("../") || value.startsWith("#");
}

function isValidIpv4Hostname(hostname: string) {
  const parts = hostname.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function isValidWebHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (normalized === "localhost" || isValidIpv4Hostname(normalized)) return true;
  if (normalized.startsWith("[") && normalized.endsWith("]") && normalized.includes(":")) return true;

  const labels = normalized.split(".");
  if (labels.length < 2) return false;

  const validLabel = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)$/;
  return labels.every((label) => validLabel.test(label)) && /[a-z]/.test(labels.at(-1) ?? "");
}

function isValidLinkUrl(parsed: URL) {
  if (parsed.protocol === "http:" || parsed.protocol === "https:") {
    return isValidWebHostname(parsed.hostname);
  }

  if (parsed.protocol === "mailto:") {
    return /^[^@]+@[^@]+\.[^@]+$/.test(decodeURIComponent(parsed.pathname));
  }

  if (parsed.protocol === "tel:") {
    const number = decodeURIComponent(parsed.pathname);
    return /^\+?[\d().-]+$/.test(number) && (number.match(/\d/g)?.length ?? 0) >= 3;
  }

  return false;
}

function isDataImageUrl(value: string) {
  return /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml|bmp|x-icon|avif);base64,/i.test(value);
}

function isDataFileUrl(value: string) {
  return /^data:[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*(?:;[a-z0-9!#$&^_.+-]+=[^;,]*)*;base64,[a-z0-9+/]*={0,2}$/i.test(value);
}

export function isSafeUEditorUrl(raw: string, kind: UEditorUrlKind): boolean {
  const value = normalizeUrlInput(raw);
  if (!value) return false;

  if (kind === "image" && isDataImageUrl(value)) return true;
  if (kind === "file" && isDataFileUrl(value)) return true;
  if (isProtocolRelativeUrl(value)) return false;
  if (isRelativeUrl(value)) return true;

  try {
    const parsed = new URL(value);
    if (kind === "image") return IMAGE_PROTOCOLS.has(parsed.protocol);
    if (kind === "file") return FILE_PROTOCOLS.has(parsed.protocol);
    return LINK_PROTOCOLS.has(parsed.protocol) && isValidLinkUrl(parsed);
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
