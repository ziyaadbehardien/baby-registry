import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The database must never be reached for a view-only visitor.
const createPurchase = vi.fn(async () => ({ id: '1' }));
const deletePurchase = vi.fn(async () => {});
vi.mock('../../../_lib/registry.js', () => ({ createPurchase, deletePurchase }));

const { POST } = await import('./purchases.js');
const { DELETE: undoPurchase } = await import('../../purchases/[id].js');
const { createSessionToken, getAccessConfig, SESSION_COOKIE } = await import('../../../_lib/session.js');

// Fictional test values only.
const ENV = {
  GUEST_PASSPHRASE: 'test guest phrase',
  VIEWER_PASSPHRASE: 'test viewer phrase',
  SESSION_SECRET: 'test-secret-0123456789-abcdefghij-klmnop',
};
const SITE = 'https://registry.example.com';

const requestAs = (role, path, method) =>
  new Request(`${SITE}${path}`, {
    method,
    headers: {
      origin: SITE,
      'content-type': 'application/json',
      cookie: `${SESSION_COOKIE}=${createSessionToken({ name: 'Test Person', role }, getAccessConfig())}`,
    },
    body: method === 'POST' ? JSON.stringify({ quantity: 1 }) : undefined,
  });

beforeEach(() => {
  for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
  createPurchase.mockClear();
  deletePurchase.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('view-only visitors', () => {
  it("can't mark an item as bought", async () => {
    const response = await POST(requestAs('viewer', '/api/v1/items/1/purchases', 'POST'));
    expect(response.status).toBe(403);
    expect(createPurchase).not.toHaveBeenCalled();
  });

  it("can't undo a purchase", async () => {
    const response = await undoPurchase(requestAs('viewer', '/api/v1/purchases/1', 'DELETE'));
    expect(response.status).toBe(403);
    expect(deletePurchase).not.toHaveBeenCalled();
  });

  it('guests still can mark an item as bought', async () => {
    const response = await POST(requestAs('guest', '/api/v1/items/1/purchases', 'POST'));
    expect(response.status).toBe(201);
    expect(createPurchase).toHaveBeenCalledOnce();
  });
});
