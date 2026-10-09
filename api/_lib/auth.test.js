import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authenticate } from './auth.js';
import { createSessionToken, getAccessConfig, SESSION_COOKIE } from './session.js';

// Fictional test values only.
const ENV = {
  GUEST_PASSPHRASE: 'test guest phrase',
  OWNER_PASSPHRASE: 'test owner phrase',
  SESSION_SECRET: 'test-secret-0123456789-abcdefghij-klmnop',
};

const SITE = 'https://registry.example.com';

const requestWith = (token, init = {}) =>
  new Request(`${SITE}/api/v1/items`, {
    ...init,
    headers: { ...(token ? { cookie: `${SESSION_COOKIE}=${token}` } : {}), ...init.headers },
  });

beforeEach(() => {
  for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const tokenFor = (role, name = 'Test Person') => createSessionToken({ name, role }, getAccessConfig());

describe('authenticate', () => {
  it('returns 401 without a session', async () => {
    await expect(authenticate(requestWith(null))).rejects.toMatchObject({ status: 401 });
  });

  it('identifies guests and owners from their session cookie', async () => {
    await expect(authenticate(requestWith(tokenFor('guest', 'Test Aunt')))).resolves.toMatchObject({
      role: 'guest',
      name: 'Test Aunt',
    });
    await expect(authenticate(requestWith(tokenFor('owner')))).resolves.toMatchObject({ role: 'owner' });
  });

  it('allows same-origin writes and refuses cross-site or origin-less writes', async () => {
    const token = tokenFor('guest');
    await expect(
      authenticate(requestWith(token, { method: 'POST', headers: { origin: SITE } }))
    ).resolves.toMatchObject({ role: 'guest' });
    await expect(
      authenticate(requestWith(token, { method: 'POST', headers: { origin: 'https://evil.example.com' } }))
    ).rejects.toMatchObject({ status: 403 });
    await expect(authenticate(requestWith(token, { method: 'DELETE' }))).rejects.toMatchObject({
      status: 403,
    });
  });

  it('fails closed when access is not configured', async () => {
    const token = tokenFor('owner');
    vi.stubEnv('SESSION_SECRET', '');
    await expect(authenticate(requestWith(token))).rejects.toMatchObject({ status: 401 });
  });
});
