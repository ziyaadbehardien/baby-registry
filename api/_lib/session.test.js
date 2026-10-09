import { describe, expect, it } from 'vitest';

import {
  createSessionToken,
  getAccessConfig,
  normalizePassphrase,
  readSession,
  roleForPassphrase,
  SESSION_COOKIE,
  verifySessionToken,
} from './session.js';

// Fictional test values only.
const ENV = {
  GUEST_PASSPHRASE: 'Test Guest Phrase',
  OWNER_PASSPHRASE: 'test-owner-phrase',
  SESSION_SECRET: 'test-secret-0123456789-abcdefghij-klmnop',
};
const config = getAccessConfig(ENV);
const NOW = Date.parse('2026-10-09T10:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('getAccessConfig', () => {
  it('fails closed without a guest passphrase or a long enough secret', () => {
    expect(getAccessConfig({ ...ENV, GUEST_PASSPHRASE: '' })).toBeNull();
    expect(getAccessConfig({ ...ENV, SESSION_SECRET: 'short' })).toBeNull();
  });

  it('disables the owner passphrase when it is missing or equals the guest one', () => {
    expect(getAccessConfig({ ...ENV, OWNER_PASSPHRASE: '' }).passphrases.owner).toBeNull();
    expect(getAccessConfig({ ...ENV, OWNER_PASSPHRASE: ' test GUEST phrase ' }).passphrases.owner).toBeNull();
  });
});

describe('roleForPassphrase', () => {
  it('matches each role, ignoring case and extra spaces', () => {
    expect(roleForPassphrase('  test   guest PHRASE ', config)).toBe('guest');
    expect(roleForPassphrase('TEST-OWNER-PHRASE', config)).toBe('owner');
    expect(roleForPassphrase('wrong', config)).toBeNull();
    expect(normalizePassphrase('  A  B ')).toBe('a b');
  });
});

describe('session tokens', () => {
  it('round-trips name and role', () => {
    const token = createSessionToken({ name: 'Test Aunt', role: 'guest' }, config, NOW);
    expect(verifySessionToken(token, config, NOW)).toMatchObject({ name: 'Test Aunt', role: 'guest' });
  });

  it('rejects tampered tokens, including a guest trying to become owner', () => {
    const token = createSessionToken({ name: 'Test Aunt', role: 'guest' }, config, NOW);
    const [body, signature] = token.split('.');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    const forged = Buffer.from(JSON.stringify({ ...payload, role: 'owner' })).toString('base64url');
    expect(verifySessionToken(`${forged}.${signature}`, config, NOW)).toBeNull();
    expect(verifySessionToken(`${body}.${signature}x`, config, NOW)).toBeNull();
    expect(verifySessionToken('not-a-token', config, NOW)).toBeNull();
  });

  it('expires guests after 90 days and owners after 30', () => {
    const guest = createSessionToken({ name: 'G', role: 'guest' }, config, NOW);
    const owner = createSessionToken({ name: 'O', role: 'owner' }, config, NOW);
    expect(verifySessionToken(guest, config, NOW + 89 * DAY)).not.toBeNull();
    expect(verifySessionToken(guest, config, NOW + 91 * DAY)).toBeNull();
    expect(verifySessionToken(owner, config, NOW + 29 * DAY)).not.toBeNull();
    expect(verifySessionToken(owner, config, NOW + 31 * DAY)).toBeNull();
  });

  it('signs everyone out of a role when that passphrase changes', () => {
    const guest = createSessionToken({ name: 'G', role: 'guest' }, config, NOW);
    const owner = createSessionToken({ name: 'O', role: 'owner' }, config, NOW);
    const rotated = getAccessConfig({ ...ENV, GUEST_PASSPHRASE: 'new test guest phrase' });
    expect(verifySessionToken(guest, rotated, NOW)).toBeNull();
    expect(verifySessionToken(owner, rotated, NOW)).not.toBeNull();
  });

  it('reads the session from the request cookie', () => {
    const token = createSessionToken({ name: 'Test Aunt', role: 'guest' }, config, Date.now());
    const request = new Request('https://registry.example.com/api/v1/me', {
      headers: { cookie: `other=1; ${SESSION_COOKIE}=${token}` },
    });
    expect(readSession(request, config)).toMatchObject({ name: 'Test Aunt' });
  });
});
