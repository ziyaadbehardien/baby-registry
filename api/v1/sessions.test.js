import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const attempts = { count: 0 };
vi.mock('../_lib/gateAttempts.js', () => ({
  MAX_ATTEMPTS: 10,
  WINDOW_MINUTES: 15,
  recordAttempt: vi.fn(async () => {
    attempts.count += 1;
    return attempts.count;
  }),
  clearAttempts: vi.fn(async () => {
    attempts.count = 0;
  }),
}));
vi.mock('node:timers/promises', () => ({ setTimeout: async () => {} }));

const { DELETE, POST } = await import('./sessions.js');

// Fictional test values only.
const ENV = {
  GUEST_PASSPHRASE: 'test guest phrase',
  OWNER_PASSPHRASE: 'test owner phrase',
  SESSION_SECRET: 'test-secret-0123456789-abcdefghij-klmnop',
};

const enter = (body) =>
  POST(
    new Request('https://registry.example.com/api/v1/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );

beforeEach(() => {
  attempts.count = 0;
  for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/v1/sessions', () => {
  it('sets a secure HttpOnly cookie for the guest passphrase', async () => {
    const response = await enter({ name: 'Test Aunt', passphrase: 'Test Guest Phrase' });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ name: 'Test Aunt', role: 'guest' });
    const cookie = response.headers.get('set-cookie');
    expect(cookie).toMatch(/^registry_session=[^;]+; Path=\/; HttpOnly; SameSite=Lax; Max-Age=7776000; Secure$/);
  });

  it('grants the owner role for the owner passphrase', async () => {
    const response = await enter({ name: 'Test Owner', passphrase: 'test owner phrase' });
    expect(await response.json()).toMatchObject({ role: 'owner' });
  });

  it('rejects a wrong passphrase without setting a cookie', async () => {
    const response = await enter({ name: 'Test Aunt', passphrase: 'nope' });
    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect((await response.json()).code).toBe('WRONG_PASSPHRASE');
  });

  it('blocks after 10 attempts in the window', async () => {
    for (let index = 0; index < 10; index += 1) await enter({ name: 'Test', passphrase: 'nope' });
    const response = await enter({ name: 'Test', passphrase: 'test guest phrase' });
    expect(response.status).toBe(429);
  });

  it('validates the name', async () => {
    const response = await enter({ name: '<script>', passphrase: 'test guest phrase' });
    expect(response.status).toBe(400);
  });

  it('fails closed when not configured', async () => {
    vi.stubEnv('GUEST_PASSPHRASE', '');
    const response = await enter({ name: 'Test Aunt', passphrase: 'anything' });
    expect(response.status).toBe(503);
  });
});

describe('DELETE /api/v1/sessions', () => {
  it('clears the cookie', async () => {
    const response = await DELETE(new Request('https://registry.example.com/api/v1/sessions', { method: 'DELETE' }));
    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toMatch(/^registry_session=; .*Max-Age=0/);
  });
});
