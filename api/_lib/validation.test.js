import { describe, expect, it } from 'vitest';

import { validateItem, validatePurchase } from './validation.js';

const expectValidationError = (fn, message) => {
  expect(fn).toThrowError(
    expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR', message })
  );
};

describe('validateItem', () => {
  it('applies defaults and trims text', () => {
    expect(validateItem({ name: '  Pram  ' })).toEqual({
      name: 'Pram',
      description: null,
      link: null,
      imageUrl: null,
      price: null,
      category: null,
      priority: 'medium',
      quantityWanted: 1,
    });
  });

  it('accepts a complete item and rounds the price to cents', () => {
    const item = validateItem({
      name: 'Nappies',
      description: 'Size 1',
      link: 'https://shop.example.com/nappies',
      price: '249.999',
      category: 'Essentials',
      priority: 'high',
      quantityWanted: 3,
    });
    expect(item.price).toBe(250);
    expect(item.quantityWanted).toBe(3);
    expect(item.link).toBe('https://shop.example.com/nappies');
  });

  it('requires a name', () => {
    expectValidationError(() => validateItem({ name: '   ' }), 'Name is required.');
  });

  it('rejects non-https links', () => {
    expectValidationError(
      () => validateItem({ name: 'Cot', link: 'javascript:alert(1)' }),
      'Link must start with https://.'
    );
    expectValidationError(
      () => validateItem({ name: 'Cot', link: 'http://shop.example.com' }),
      'Link must start with https://.'
    );
  });

  it('rejects out-of-range quantities and prices', () => {
    expect(() => validateItem({ name: 'Cot', quantityWanted: 0 })).toThrow(/whole number/);
    expect(() => validateItem({ name: 'Cot', quantityWanted: 100 })).toThrow(/whole number/);
    expect(() => validateItem({ name: 'Cot', quantityWanted: 1.5 })).toThrow(/whole number/);
    expect(() => validateItem({ name: 'Cot', price: -1 })).toThrow(/positive/);
  });

  it('rejects unknown priorities and overlong text', () => {
    expect(() => validateItem({ name: 'Cot', priority: 'urgent' })).toThrow(/Priority/);
    expect(() => validateItem({ name: 'x'.repeat(121) })).toThrow(/120 characters/);
  });

  it('rejects non-object bodies', () => {
    expect(() => validateItem(null)).toThrow(/object/);
    expect(() => validateItem([])).toThrow(/object/);
  });
});

describe('validatePurchase', () => {
  it('defaults quantity to 1 and drops an empty note', () => {
    expect(validatePurchase({ note: '  ' })).toEqual({ quantity: 1, note: null });
  });

  it('limits note length', () => {
    expect(() => validatePurchase({ note: 'x'.repeat(201) })).toThrow(/200 characters/);
  });
});
