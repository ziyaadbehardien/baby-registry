import { authenticate } from '../../../_lib/auth.js';
import { json, pathId, readJson, withErrors } from '../../../_lib/http.js';
import { createPurchase } from '../../../_lib/registry.js';
import { validatePurchase } from '../../../_lib/validation.js';

/** POST /api/v1/items/:id/purchases — mark (part of) an item as purchased. */
export const POST = withErrors(async (request) => {
  const auth = await authenticate(request);
  const itemId = pathId(request, 'items');
  const purchase = validatePurchase(await readJson(request));
  return json(await createPurchase(itemId, purchase, auth, auth.name), 201);
});
