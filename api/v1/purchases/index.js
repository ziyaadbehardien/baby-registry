import { authenticate } from '../../_lib/auth.js';
import { json, withErrors } from '../../_lib/http.js';
import { listPurchases } from '../../_lib/registry.js';

/** GET /api/v1/purchases — all purchases, newest first, with purchaser details per role. */
export const GET = withErrors(async (request) => {
  const auth = await authenticate(request);
  return json(await listPurchases(auth));
});
