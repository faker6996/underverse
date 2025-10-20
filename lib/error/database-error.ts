export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    // In development, surface the original PG error message to aid debugging
    const isProd = process.env.NODE_ENV === "production";
    const detail = originalError?.detail || originalError?.message || originalError?.toString?.();
    super(!isProd && detail ? `Database error: ${detail}` : message);
    this.name = "DatabaseError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}
