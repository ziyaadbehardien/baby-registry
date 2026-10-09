/**
 * Fixed-window rate limit for the passphrase form: MAX_ATTEMPTS per WINDOW per client.
 * Stored in Postgres so it holds across serverless instances.
 */
import { getSql } from './db.js';

export const MAX_ATTEMPTS = 10;
export const WINDOW_MINUTES = 15;

/** Records an attempt and returns how many have been made in the current window (atomic). */
export const recordAttempt = async (key) => {
  const [row] = await getSql()`
    INSERT INTO gate_attempts (key, window_start, attempts)
    VALUES (${key}, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE
        WHEN gate_attempts.window_start < now() - interval '15 minutes' THEN 1
        ELSE gate_attempts.attempts + 1
      END,
      window_start = CASE
        WHEN gate_attempts.window_start < now() - interval '15 minutes' THEN now()
        ELSE gate_attempts.window_start
      END
    RETURNING attempts`;
  return row.attempts;
};

export const clearAttempts = async (key) => {
  await getSql()`DELETE FROM gate_attempts WHERE key = ${key}`;
};
