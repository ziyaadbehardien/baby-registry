import { beforeEach, describe, expect, it, vi } from 'vitest';

const sqlMock = vi.fn();
vi.mock('./db.js', () => ({ getSql: () => sqlMock }));

const { createPurchase, deletePurchase, toPurchase, updateItem } = await import('./registry.js');

const OWNER = { userId: 'user_owner', role: 'owner' };
const GUEST = { userId: 'user_guest', role: 'guest' };
const OTHER_GUEST = { userId: 'user_other', role: 'guest' };

const purchaseRow = {
  id: '7',
  item_id: '3',
  item_name: 'Pram',
  quantity: 1,
  purchaser_id: GUEST.userId,
  purchaser_name: 'Test Guest',
  note: 'Grey one',
  created_at: '2026-10-07T10:00:00Z',
};

beforeEach(() => {
  sqlMock.mockReset();
});

describe('toPurchase visibility', () => {
  it('shows purchaser and note to the purchaser', () => {
    expect(toPurchase(purchaseRow, GUEST)).toMatchObject({
      isMine: true,
      purchaserName: 'Test Guest',
      note: 'Grey one',
    });
  });

  it('shows purchaser and note to the owner', () => {
    expect(toPurchase(purchaseRow, OWNER)).toMatchObject({
      isMine: false,
      purchaserName: 'Test Guest',
      note: 'Grey one',
    });
  });

  it('hides purchaser and note from other guests', () => {
    expect(toPurchase(purchaseRow, OTHER_GUEST)).toMatchObject({
      isMine: false,
      purchaserName: null,
      note: null,
    });
  });
});

describe('createPurchase', () => {
  it('returns the purchase when the atomic update succeeds', async () => {
    sqlMock.mockResolvedValueOnce([purchaseRow]);
    const purchase = await createPurchase('3', { quantity: 1, note: null }, GUEST, 'Test Guest');
    expect(purchase.id).toBe('7');
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when the item is already fully bought', async () => {
    sqlMock.mockResolvedValueOnce([]).mockResolvedValueOnce([{ needed: 0 }]);
    await expect(
      createPurchase('3', { quantity: 1, note: null }, GUEST, 'Test Guest')
    ).rejects.toMatchObject({
      status: 409,
      code: 'EXCEEDS_QUANTITY_NEEDED',
    });
  });

  it('returns 404 when the item does not exist', async () => {
    sqlMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    await expect(
      createPurchase('3', { quantity: 1, note: null }, GUEST, 'Test Guest')
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('updateItem', () => {
  it('returns 409 when lowering quantity below what was bought', async () => {
    sqlMock.mockResolvedValueOnce([]).mockResolvedValueOnce([{ quantity_purchased: 2 }]);
    await expect(updateItem('3', { quantityWanted: 1 })).rejects.toMatchObject({
      status: 409,
      code: 'QUANTITY_BELOW_PURCHASED',
    });
  });
});

describe('deletePurchase', () => {
  it("forbids a guest from undoing someone else's purchase", async () => {
    sqlMock.mockResolvedValueOnce([{ purchaser_id: GUEST.userId }]);
    await expect(deletePurchase('7', OTHER_GUEST)).rejects.toMatchObject({ status: 403 });
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it('lets the purchaser and the owner undo', async () => {
    sqlMock.mockResolvedValue([{ purchaser_id: GUEST.userId }]);
    await expect(deletePurchase('7', GUEST)).resolves.toBeUndefined();
    await expect(deletePurchase('7', OWNER)).resolves.toBeUndefined();
  });

  it('returns 404 for a missing purchase', async () => {
    sqlMock.mockResolvedValueOnce([]);
    await expect(deletePurchase('7', OWNER)).rejects.toMatchObject({ status: 404 });
  });
});
