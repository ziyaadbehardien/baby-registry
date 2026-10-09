import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { setErrorStatus } from '../error/errorSlice';

// Statuses the UI handles inline (validation, wrong passphrase, conflicts, rate limits)
// rather than with the global error banner.
const INLINE_STATUSES = [400, 401, 404, 409, 422, 429, 503];

// The session lives in an HttpOnly cookie that the browser sends automatically on same-origin
// requests; the app never sees or stores a token.
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  timeout: 30000,
  credentials: 'same-origin',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithInterceptor = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    api.endpoint !== 'getMe' &&
    api.endpoint !== 'enterRegistry'
  ) {
    // Session expired or the passphrase changed: re-check who we are, which sends the visitor
    // back to the passphrase screen. getMe itself is excluded so this can't loop.
    api.dispatch(apiSlice.util.invalidateTags(['Me']));
  } else if (result.error && !INLINE_STATUSES.includes(result.error.status)) {
    api.dispatch(
      setErrorStatus({
        status: typeof result.error.status === 'number' ? result.error.status : 500,
        message: result.error.data?.message ?? null,
      })
    );
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ['Me', 'Items', 'Purchases'],
  endpoints: () => ({}),
});

/** Reads the `{ code, message }` body the API returns, with a fallback for network failures. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.data?.message ?? fallback;
