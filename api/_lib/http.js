/**
 * HTTP helpers shared by the API functions.
 * Error bodies always use { code, message } and never include internal details.
 */

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const json = (body, status = 200, headers = undefined) =>
  Response.json(body, { status, headers });

export const noContent = (headers = undefined) => new Response(null, { status: 204, headers });

const errorResponse = (status, code, message) => json({ code, message }, status);

export const readJson = async (request) => {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
  }
};

/**
 * Reads the numeric ID that follows `segment` in the request path,
 * e.g. pathId(request, 'items') for /api/v1/items/42/purchases → 42.
 */
export const pathId = (request, segment) => {
  const parts = new URL(request.url).pathname.split('/');
  const value = parts[parts.indexOf(segment) + 1];

  if (!/^[1-9]\d{0,17}$/.test(value ?? '')) {
    throw new HttpError(404, 'NOT_FOUND', 'Resource not found.');
  }
  return value;
};

/**
 * Wraps a route handler so thrown HttpErrors become { code, message } responses and anything
 * unexpected becomes a generic 500. Only the error class name is logged, because driver error
 * messages can echo query values (names, notes).
 */
export const withErrors = (handler) => async (request) => {
  try {
    return await handler(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return errorResponse(error.status, error.code, error.message);
    }
    // The SQLSTATE code (e.g. 42P01 = table missing) helps diagnose database failures and
    // never contains data values.
    const sqlState =
      typeof error?.code === 'string' && /^[0-9A-Z]{5}$/.test(error.code) ? ` (${error.code})` : '';
    console.error(`Unhandled API error: ${error?.name ?? 'UnknownError'}${sqlState}`);
    return errorResponse(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  }
};
