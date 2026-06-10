import type { JsonObject } from "#/domain/types";

/**
 * Application error carrying the stable `code` + human message shape. API
 * handlers translate these into JSON error responses; server functions surface
 * them to the UI. Details must stay JSON-safe so they can cross the
 * server-function boundary.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: JsonObject | undefined;

  constructor(
    code: string,
    message: string,
    options: { status?: number; details?: JsonObject } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = options.status ?? 400;
    this.details = options.details;
  }

  toBody(): { error: { code: string; message: string; details?: JsonObject } } {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details === undefined ? {} : { details: this.details }),
      },
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
