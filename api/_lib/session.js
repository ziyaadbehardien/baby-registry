/**
 * Passphrase-based access (no accounts, no third-party sign-in).
 *
 * A visitor enters their name plus a passphrase:
 * - OWNER_PASSPHRASE → role "owner" (manage items, see every purchaser), 30-day session
 * - GUEST_PASSPHRASE → role "guest" (browse, mark items bought), 90-day session
 *
 * On success the API sets an HttpOnly cookie holding a signed token
 * { id, name, role, expiry, passphrase version }:
 * - signed with HMAC-SHA256 using SESSION_SECRET, so it can't be forged or edited;
 * - the passphrase version is derived from that role's passphrase, so changing a passphrase
 *   signs out everyone who used it;
 * - JavaScript can't read the cookie (HttpOnly); SameSite=Lax plus an Origin check on writes
 *   (auth.js) guard against cross-site requests.
 *
 * All three settings are server-only secrets and must never be prefixed with VITE_.
 */
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'registry_session';
export const ROLES = { OWNER: 'owner', GUEST: 'guest' };
export const SESSION_DAYS = { [ROLES.OWNER]: 30, [ROLES.GUEST]: 90 };
const MIN_SECRET_LENGTH = 32;
const DAY_SECONDS = 24 * 60 * 60;

/** Case- and spacing-insensitive, so "Blue Bird" and "blue  bird" both work for family. */
export const normalizePassphrase = (value) =>
  String(value).trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Returns the access settings, or null when they're missing (access then fails closed).
 * The owner passphrase is optional, and is ignored if it's the same as the guest one.
 */
export const getAccessConfig = (env = process.env) => {
  const guest = env.GUEST_PASSPHRASE ? normalizePassphrase(env.GUEST_PASSPHRASE) : '';
  const owner = env.OWNER_PASSPHRASE ? normalizePassphrase(env.OWNER_PASSPHRASE) : '';
  const secret = env.SESSION_SECRET ?? '';
  if (!guest || secret.length < MIN_SECRET_LENGTH) return null;
  return {
    secret,
    passphrases: { [ROLES.GUEST]: guest, [ROLES.OWNER]: owner && owner !== guest ? owner : null },
  };
};

const hmac = (secret, data) => createHmac('sha256', secret).update(data).digest();
const sha256 = (data) => createHash('sha256').update(data).digest();

const matches = (input, expected) =>
  Boolean(expected) && timingSafeEqual(sha256(normalizePassphrase(input)), sha256(expected));

/** Which role (if any) a passphrase unlocks. Both comparisons always run, in constant time. */
export const roleForPassphrase = (input, config) => {
  const isOwner = matches(input, config.passphrases[ROLES.OWNER]);
  const isGuest = matches(input, config.passphrases[ROLES.GUEST]);
  if (isOwner) return ROLES.OWNER;
  if (isGuest) return ROLES.GUEST;
  return null;
};

const passphraseVersion = (role, config) =>
  hmac(config.secret, `passphrase:${role}:${config.passphrases[role]}`)
    .toString('base64url')
    .slice(0, 16);

export const createSessionToken = ({ name, role }, config, nowMs = Date.now()) => {
  const payload = {
    id: randomUUID(),
    name,
    role,
    exp: Math.floor(nowMs / 1000) + SESSION_DAYS[role] * DAY_SECONDS,
    pv: passphraseVersion(role, config),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = hmac(config.secret, body).toString('base64url');
  return `${body}.${signature}`;
};

/** Returns { id, name, role } for a valid, unexpired token signed for the current passphrase. */
export const verifySessionToken = (token, config, nowMs = Date.now()) => {
  if (typeof token !== 'string') return null;
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra !== undefined) return null;

  const expected = hmac(config.secret, body);
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!Object.values(ROLES).includes(payload.role) || !config.passphrases[payload.role])
    return null;
  if (payload.pv !== passphraseVersion(payload.role, config)) return null;
  if (typeof payload.exp !== 'number' || payload.exp * 1000 <= nowMs) return null;
  if (typeof payload.id !== 'string' || typeof payload.name !== 'string') return null;

  return { id: payload.id, name: payload.name, role: payload.role };
};

export const readCookie = (request, name) => {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
};

const cookieAttributes = (request, maxAgeSeconds) => {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
};

export const sessionCookieHeader = (token, role, request) =>
  `${SESSION_COOKIE}=${token}; ${cookieAttributes(request, SESSION_DAYS[role] * DAY_SECONDS)}`;

export const clearSessionCookieHeader = (request) =>
  `${SESSION_COOKIE}=; ${cookieAttributes(request, 0)}`;

/** The session on this request, if any. */
export const readSession = (request, config = getAccessConfig()) => {
  if (!config) return null;
  return verifySessionToken(readCookie(request, SESSION_COOKIE), config);
};

/**
 * Rate-limit key for the passphrase form: the client IP, HMAC'd so raw IPs are never stored.
 * Vercel sets x-forwarded-for; locally there may be none.
 */
export const attemptKey = (request, config) => {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  return hmac(config.secret, `ip:${ip}`).toString('hex').slice(0, 32);
};
