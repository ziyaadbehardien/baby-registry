import { setTimeout as sleep } from 'node:timers/promises';

import {
  clearAttempts,
  MAX_ATTEMPTS,
  recordAttempt,
  WINDOW_MINUTES,
} from '../_lib/gateAttempts.js';
import { HttpError, json, noContent, readJson, withErrors } from '../_lib/http.js';
import {
  attemptKey,
  clearSessionCookieHeader,
  createSessionToken,
  getAccessConfig,
  roleForPassphrase,
  sessionCookieHeader,
} from '../_lib/session.js';
import { validateEntry } from '../_lib/validation.js';

// Small fixed delay on a wrong passphrase to slow scripted guessing further.
const WRONG_PASSPHRASE_DELAY_MS = 400;

/** POST /api/v1/sessions — exchange { name, passphrase } for a session cookie. */
export const POST = withErrors(async (request) => {
  const config = getAccessConfig();
  if (!config) {
    throw new HttpError(
      503,
      'ACCESS_NOT_CONFIGURED',
      "The registry isn't set up for visitors yet."
    );
  }

  const { name, passphrase } = validateEntry(await readJson(request));

  const key = attemptKey(request, config);
  if ((await recordAttempt(key)) > MAX_ATTEMPTS) {
    throw new HttpError(
      429,
      'TOO_MANY_ATTEMPTS',
      `Too many attempts. Please wait ${WINDOW_MINUTES} minutes and try again.`
    );
  }

  const role = roleForPassphrase(passphrase, config);
  if (!role) {
    await sleep(WRONG_PASSPHRASE_DELAY_MS);
    throw new HttpError(
      401,
      'WRONG_PASSPHRASE',
      "That passphrase doesn't match. Please check and try again."
    );
  }

  await clearAttempts(key);
  const token = createSessionToken({ name, role }, config);
  return json({ name, role }, 201, { 'Set-Cookie': sessionCookieHeader(token, role, request) });
});

/** DELETE /api/v1/sessions — leave: clears the session cookie on this device. */
export const DELETE = withErrors(async (request) =>
  noContent({ 'Set-Cookie': clearSessionCookieHeader(request) })
);
