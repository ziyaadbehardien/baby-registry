/**
 * Input validation for the API boundary. Each validator returns a clean value object
 * or throws a 400 HttpError describing the first problem found.
 */
import { HttpError } from './http.js';

export const PRIORITIES = ['high', 'medium', 'low'];

const LIMITS = {
  NAME: 120,
  DESCRIPTION: 500,
  LINK: 2048,
  CATEGORY: 60,
  NOTE: 200,
  GUEST_NAME: 60,
  PASSPHRASE: 200,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 99,
  PRICE_MAX: 99999999.99,
};

const invalid = (message) => new HttpError(400, 'VALIDATION_ERROR', message);

const isBlank = (value) => value === undefined || value === null || value === '';

const optionalText = (value, field, max) => {
  if (isBlank(value)) return null;
  if (typeof value !== 'string') throw invalid(`${field} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw invalid(`${field} must be ${max} characters or fewer.`);
  return trimmed || null;
};

const requiredText = (value, field, max) => {
  const text = optionalText(value, field, max);
  if (!text) throw invalid(`${field} is required.`);
  return text;
};

const quantity = (value, field) => {
  if (isBlank(value)) return LIMITS.QUANTITY_MIN;
  const number = Number(value);
  if (!Number.isInteger(number) || number < LIMITS.QUANTITY_MIN || number > LIMITS.QUANTITY_MAX) {
    throw invalid(
      `${field} must be a whole number from ${LIMITS.QUANTITY_MIN} to ${LIMITS.QUANTITY_MAX}.`
    );
  }
  return number;
};

const httpsUrl = (value, field) => {
  const text = optionalText(value, field, LIMITS.LINK);
  if (!text) return null;

  let url;
  try {
    url = new URL(text);
  } catch {
    throw invalid(`${field} must be a valid web address.`);
  }
  if (url.protocol !== 'https:') throw invalid(`${field} must start with https://.`);
  return url.toString();
};

const price = (value) => {
  if (isBlank(value)) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > LIMITS.PRICE_MAX) {
    throw invalid('Price must be a positive amount.');
  }
  return Math.round(number * 100) / 100;
};

const priority = (value) => {
  if (isBlank(value)) return 'medium';
  if (!PRIORITIES.includes(value))
    throw invalid(`Priority must be one of: ${PRIORITIES.join(', ')}.`);
  return value;
};

const requireObject = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw invalid('Request body must be an object.');
  }
};

/** Validates a full item (used for both create and replace). */
export const validateItem = (body) => {
  requireObject(body);
  return {
    name: requiredText(body.name, 'Name', LIMITS.NAME),
    description: optionalText(body.description, 'Description', LIMITS.DESCRIPTION),
    link: httpsUrl(body.link, 'Link'),
    imageUrl: httpsUrl(body.imageUrl, 'Photo link'),
    price: price(body.price),
    category: optionalText(body.category, 'Category', LIMITS.CATEGORY),
    priority: priority(body.priority),
    quantityWanted: quantity(body.quantityWanted, 'Quantity wanted'),
  };
};

export const validateLinkPreview = (body) => {
  requireObject(body);
  const url = httpsUrl(body.url, 'Link');
  if (!url) throw invalid('Link is required.');
  return { url };
};

// Letters (any script), spaces, apostrophes, hyphens and full stops: enough for real names,
// and it keeps control characters and markup out of a value shown to the owner.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

export const validateEntry = (body) => {
  requireObject(body);
  const name = requiredText(body.name, 'Your name', LIMITS.GUEST_NAME).replace(/\s+/g, ' ');
  if (!NAME_PATTERN.test(name)) throw invalid('Please use letters only for your name.');
  if (typeof body.passphrase !== 'string' || !body.passphrase.trim()) {
    throw invalid('Please enter the passphrase.');
  }
  if (body.passphrase.length > LIMITS.PASSPHRASE) throw invalid('That passphrase is too long.');
  return { name, passphrase: body.passphrase };
};

export const validatePurchase = (body) => {
  requireObject(body);
  return {
    quantity: quantity(body.quantity, 'Quantity'),
    note: optionalText(body.note, 'Note', LIMITS.NOTE),
  };
};
