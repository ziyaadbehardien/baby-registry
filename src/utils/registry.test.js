import { describe, expect, it } from 'vitest';

import dayjs from 'dayjs';

import { describeCountdown, filterItems, getCategories, getProgress } from './registry';

const items = [
  { id: '1', category: 'Nursery', quantityWanted: 1, quantityPurchased: 1, quantityNeeded: 0 },
  { id: '2', category: 'Feeding', quantityWanted: 3, quantityPurchased: 1, quantityNeeded: 2 },
  { id: '3', category: null, quantityWanted: 2, quantityPurchased: 0, quantityNeeded: 2 },
];

describe('filterItems', () => {
  it('filters by status', () => {
    expect(filterItems(items, { status: 'needed', category: null }).map((i) => i.id)).toEqual([
      '2',
      '3',
    ]);
    expect(filterItems(items, { status: 'purchased', category: null }).map((i) => i.id)).toEqual([
      '1',
    ]);
    expect(filterItems(items, { status: 'all', category: null })).toHaveLength(3);
  });

  it('filters by category', () => {
    expect(filterItems(items, { status: 'all', category: 'Feeding' }).map((i) => i.id)).toEqual([
      '2',
    ]);
  });
});

describe('getCategories', () => {
  it('returns distinct sorted categories', () => {
    expect(getCategories(items)).toEqual(['Feeding', 'Nursery']);
  });
});

describe('getProgress', () => {
  it('totals items and units', () => {
    expect(getProgress(items)).toEqual({
      itemsTotal: 3,
      itemsComplete: 1,
      unitsWanted: 6,
      unitsPurchased: 2,
    });
  });
});

describe('describeCountdown', () => {
  const today = dayjs('2026-10-08T15:30:00');

  it('counts whole days to the due date', () => {
    expect(describeCountdown('2026-11-19', today)).toBe('42 days to go');
    expect(describeCountdown('2026-10-09', today)).toBe('1 day to go');
    expect(describeCountdown('2026-10-08', today)).toBe('Due today');
    expect(describeCountdown('2025-10-14', today)).toBe('Our little one is here');
  });
});
