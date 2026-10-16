import { authenticate, requireCanPurchase } from '../../_lib/auth.js';
import { noContent, pathId, withErrors } from '../../_lib/http.js';
import { deletePurchase } from '../../_lib/registry.js';

/** DELETE /api/v1/purchases/:id — undo own purchase (owners may undo any). */
export const DELETE = withErrors(async (request) => {
  const auth = await authenticate(request);
  requireCanPurchase(auth);
  await deletePurchase(pathId(request, 'purchases'), auth);
  return noContent();
});
