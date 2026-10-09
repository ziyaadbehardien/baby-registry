/**
 * Registry data access. Every write that touches quantities is a single SQL statement,
 * so concurrent purchases can't oversubscribe an item: the UPDATE's row lock serialises them
 * and its WHERE clause re-checks the remaining quantity.
 */
import { getSql } from './db.js';
import { HttpError } from './http.js';
import { ROLES } from './auth.js';

const notFound = () => new HttpError(404, 'NOT_FOUND', 'That item no longer exists.');

const toItem = (row) => ({
  id: String(row.id),
  name: row.name,
  description: row.description,
  link: row.link,
  imageUrl: row.image_url,
  price: row.price === null ? null : Number(row.price),
  category: row.category,
  priority: row.priority,
  quantityWanted: row.quantity_wanted,
  quantityPurchased: row.quantity_purchased,
  quantityNeeded: row.quantity_wanted - row.quantity_purchased,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Guests only see who bought something (and their note) on their own purchases;
 * owners see every purchaser so they can say thank you.
 */
export const toPurchase = (row, auth) => {
  const isMine = row.purchaser_id === auth.userId;
  const canSeeDetails = isMine || auth.role === ROLES.OWNER;

  return {
    id: String(row.id),
    itemId: String(row.item_id),
    itemName: row.item_name,
    quantity: row.quantity,
    createdAt: row.created_at,
    isMine,
    purchaserName: canSeeDetails ? row.purchaser_name : null,
    note: canSeeDetails ? row.note : null,
  };
};

export const listItems = async () => {
  const rows = await getSql()`
    SELECT * FROM items
    ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, lower(name)`;
  return rows.map(toItem);
};

export const createItem = async (item) => {
  const [row] = await getSql()`
    INSERT INTO items (name, description, link, image_url, price, category, priority, quantity_wanted)
    VALUES (${item.name}, ${item.description}, ${item.link}, ${item.imageUrl}, ${item.price},
            ${item.category}, ${item.priority}, ${item.quantityWanted})
    RETURNING *`;
  return toItem(row);
};

export const updateItem = async (id, item) => {
  const sql = getSql();
  const [row] = await sql`
    UPDATE items SET
      name = ${item.name},
      description = ${item.description},
      link = ${item.link},
      image_url = ${item.imageUrl},
      price = ${item.price},
      category = ${item.category},
      priority = ${item.priority},
      quantity_wanted = ${item.quantityWanted},
      updated_at = now()
    WHERE id = ${id} AND quantity_purchased <= ${item.quantityWanted}
    RETURNING *`;

  if (row) return toItem(row);

  const [existing] = await sql`SELECT quantity_purchased FROM items WHERE id = ${id}`;
  if (!existing) throw notFound();
  throw new HttpError(
    409,
    'QUANTITY_BELOW_PURCHASED',
    `${existing.quantity_purchased} already bought — quantity wanted can't be lower than that.`
  );
};

export const deleteItem = async (id) => {
  const [row] = await getSql()`DELETE FROM items WHERE id = ${id} RETURNING id`;
  if (!row) throw notFound();
};

export const listPurchases = async (auth) => {
  const rows = await getSql()`
    SELECT p.*, i.name AS item_name
    FROM purchases p
    JOIN items i ON i.id = p.item_id
    ORDER BY p.created_at DESC`;
  return rows.map((row) => toPurchase(row, auth));
};

export const createPurchase = async (itemId, purchase, auth, purchaserName) => {
  const sql = getSql();
  const [row] = await sql`
    WITH updated AS (
      UPDATE items
      SET quantity_purchased = quantity_purchased + ${purchase.quantity}, updated_at = now()
      WHERE id = ${itemId} AND quantity_purchased + ${purchase.quantity} <= quantity_wanted
      RETURNING id, name
    )
    INSERT INTO purchases (item_id, quantity, purchaser_id, purchaser_name, note)
    SELECT id, ${purchase.quantity}, ${auth.userId}, ${purchaserName}, ${purchase.note} FROM updated
    RETURNING *, (SELECT name FROM updated) AS item_name`;

  if (row) return toPurchase(row, auth);

  const [existing] = await sql`
    SELECT quantity_wanted - quantity_purchased AS needed FROM items WHERE id = ${itemId}`;
  if (!existing) throw notFound();
  throw new HttpError(
    409,
    'EXCEEDS_QUANTITY_NEEDED',
    existing.needed === 0
      ? 'Someone has already bought this item.'
      : `Only ${existing.needed} still needed — someone may have just bought one.`
  );
};

export const deletePurchase = async (id, auth) => {
  const sql = getSql();
  const [existing] = await sql`SELECT purchaser_id FROM purchases WHERE id = ${id}`;

  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'That purchase no longer exists.');
  }
  const isOwner = auth.role === ROLES.OWNER;
  if (!isOwner && existing.purchaser_id !== auth.userId) {
    throw new HttpError(403, 'FORBIDDEN', 'You can only undo your own purchases.');
  }

  await sql`
    WITH removed AS (
      DELETE FROM purchases
      WHERE id = ${id} AND (${isOwner} OR purchaser_id = ${auth.userId})
      RETURNING item_id, quantity
    )
    UPDATE items
    SET quantity_purchased = items.quantity_purchased - removed.quantity, updated_at = now()
    FROM removed
    WHERE items.id = removed.item_id`;
};
