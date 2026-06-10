import { json } from "@tanstack/react-start";
import { isAppError } from "./services/errors";

/**
 * Run an API handler and translate AppError into the documented JSON error
 * shape (stable `code` + `message`, optional `details`). Unexpected errors
 * become an opaque 500.
 */
export async function handleApi(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (isAppError(error)) {
      return json(error.toBody(), { status: error.status });
    }
    console.error("[api] unhandled error:", error);
    return json(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
      { status: 500 },
    );
  }
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
  } catch {
    // fall through to the empty body below
  }
  return {};
}

export function queryParam(request: Request, name: string): string | undefined {
  const value = new URL(request.url).searchParams.get(name);
  return value === null || value === "" ? undefined : value;
}
