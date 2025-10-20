export function toLocalePath(locale: string, path: string): string {
  if (!path) return `/${locale}`;
  // External URLs keep as-is
  if (/^https?:\/\//i.test(path)) return path;
  // Ensure leading slash
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

