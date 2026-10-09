import { authenticate, requireOwner } from '../../_lib/auth.js';
import { json, noContent, pathId, readJson, withErrors } from '../../_lib/http.js';
import { deleteItem, updateItem } from '../../_lib/registry.js';
import { validateItem } from '../../_lib/validation.js';

/** PUT /api/v1/items/:id — owner replaces an item's details. */
export const PUT = withErrors(async (request) => {
  requireOwner(await authenticate(request));
  const id = pathId(request, 'items');
  const item = validateItem(await readJson(request));
  return json(await updateItem(id, item));
});

/** DELETE /api/v1/items/:id — owner removes an item and its purchases. */
export const DELETE = withErrors(async (request) => {
  requireOwner(await authenticate(request));
  await deleteItem(pathId(request, 'items'));
  return noContent();
});
