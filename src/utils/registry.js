import dayjs from 'dayjs';

import { STATUS_FILTERS } from '../features/registry/registryFiltersSlice';

const currencyFormatter = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

/**
 * Formats a number as South African rand.
 * @param {number|null} value - Amount in ZAR
 * @returns {string|null} e.g. "R 1 299,00", or null when there is no price
 */
export const formatCurrency = (value) => (value === null ? null : currencyFormatter.format(value));

export const formatDate = (date) => dayjs(date).format('D MMM YYYY');

/** e.g. "Oct 14, 2025" — the style used on the landing page. */
export const formatShortDate = (date) => dayjs(date).format('MMM D, YYYY');

/** e.g. "October 2025". */
export const formatMonthYear = (date) => dayjs(date).format('MMMM YYYY');

/** e.g. "Saturday, 20 September 2025". */
export const formatLongDate = (date) => dayjs(date).format('dddd, D MMMM YYYY');

/**
 * Friendly countdown to the due date.
 * @param {string} dueDate - ISO date (YYYY-MM-DD)
 * @param {dayjs.Dayjs} [today] - injectable for tests
 */
export const describeCountdown = (dueDate, today = dayjs()) => {
  const days = dayjs(dueDate).startOf('day').diff(today.startOf('day'), 'day');
  if (days > 1) return `${days} days to go`;
  if (days === 1) return '1 day to go';
  if (days === 0) return 'Due today';
  return 'Our little one is here';
};

/** Applies the status and category filters to the item list. */
export const filterItems = (items, { status, category }) =>
  items.filter((item) => {
    if (status === STATUS_FILTERS.NEEDED && item.quantityNeeded === 0) return false;
    if (status === STATUS_FILTERS.PURCHASED && item.quantityNeeded > 0) return false;
    if (category && item.category !== category) return false;
    return true;
  });

/** Distinct, sorted category names. */
export const getCategories = (items) =>
  [...new Set(items.map((item) => item.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

/** Progress counts for the summary blocks. */
export const getProgress = (items) =>
  items.reduce(
    (totals, item) => ({
      itemsTotal: totals.itemsTotal + 1,
      itemsComplete: totals.itemsComplete + (item.quantityNeeded === 0 ? 1 : 0),
      unitsWanted: totals.unitsWanted + item.quantityWanted,
      unitsPurchased: totals.unitsPurchased + item.quantityPurchased,
    }),
    { itemsTotal: 0, itemsComplete: 0, unitsWanted: 0, unitsPurchased: 0 }
  );
