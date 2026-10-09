/**
 * Request authentication. Everyone gets in with a passphrase (see session.js); the role in the
 * signed session cookie decides what they can do. Roles are decided on the server only.
 */
import { HttpError } from './http.js';
import { readSession, ROLES } from './session.js';

export { ROLES };

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const splitEnv = (value) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * Cookie-authenticated writes must come from this site. SameSite=Lax already blocks most
 * cross-site requests; checking Origin closes the remaining gaps.
 */
export const assertSameOrigin = (request) => {
  if (SAFE_METHODS.includes(request.method)) return;
  const origin = request.headers.get('origin');
  const allowed = [new URL(request.url).origin, ...splitEnv(process.env.APP_ORIGINS)];
  if (!origin || !allowed.includes(origin)) {
    throw new HttpError(403, 'FORBIDDEN', 'This request must come from the registry site.');
  }
};

/** Returns { userId, role, name } for a valid session cookie; throws 401 otherwise. */
export const authenticate = async (request) => {
  const session = readSession(request);
  if (!session) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Please enter the passphrase.');
  }
  assertSameOrigin(request);
  return { userId: `${session.role}_${session.id}`, role: session.role, name: session.name };
};

export const requireOwner = (auth) => {
  if (auth.role !== ROLES.OWNER) {
    throw new HttpError(403, 'FORBIDDEN', 'Only the registry owner can do that.');
  }
};
