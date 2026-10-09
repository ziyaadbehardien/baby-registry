import { authenticate, requireOwner } from '../../_lib/auth.js';
import { json, readJson, withErrors } from '../../_lib/http.js';
import { createItem, listItems } from '../../_lib/registry.js';
import { validateItem } from '../../_lib/validation.js';

/** GET /api/v1/items — every registry item with remaining quantity. */
export const GET = withErrors(async (request) => {
  await authenticate(request);
  return json(await listItems());
});

/** POST /api/v1/items — owner adds an item. */
export const POST = withErrors(async (request) => {
  requireOwner(await authenticate(request));
  const item = validateItem(await readJson(request));
  return json(await createItem(item), 201);
});
