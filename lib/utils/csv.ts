export type CsvPrimitive = string | number | boolean | null | undefined | Date;

function stringify(val: CsvPrimitive): string {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) return val.toISOString();
  const s = String(val);
  // Escape quotes by doubling them per CSV RFC 4180
  const escaped = s.replace(/"/g, '""');
  // Wrap with quotes to preserve delimiters/newlines
  return `"${escaped}"`;
}

export function detectExcelDelimiter(): "," | ";" {
  // If decimal separator is comma → Excel (vi-VN, fr-FR, ...) expects semicolon as CSV delimiter
  const localized = (1.1).toLocaleString();
  return localized.includes(',') ? ';' : ',';
}

export function buildCsv(
  headers: string[],
  rows: CsvPrimitive[][],
  opts?: { headerUppercase?: boolean; delimiter?: string; linebreak?: 'lf' | 'crlf' }
): string {
  const delimiter = opts?.delimiter ?? ',';
  const lb = opts?.linebreak === 'crlf' ? '\r\n' : '\n';
  const head = (opts?.headerUppercase ? headers.map((h) => h.toUpperCase()) : headers)
    .map(stringify)
    .join(delimiter);
  const body = rows.map((r) => r.map(stringify).join(delimiter)).join(lb);
  return head + (body ? lb + body : '');
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvPrimitive[][],
  opts?: { headerUppercase?: boolean; withBom?: boolean; delimiter?: string; linebreak?: 'lf' | 'crlf' }
) {
  const csv = buildCsv(headers, rows, {
    headerUppercase: !!opts?.headerUppercase,
    delimiter: opts?.delimiter,
    linebreak: opts?.linebreak ?? 'crlf',
  });
  const content = (opts?.withBom ? "\ufeff" : "") + csv;
  if (typeof window === "undefined") return content; // SSR safe
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

