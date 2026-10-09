-- Rate limiting for the guest passphrase form. key is an HMAC of the client IP (never the raw IP).
CREATE TABLE gate_attempts (
  key          VARCHAR(64) PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts     INTEGER     NOT NULL DEFAULT 1
);
