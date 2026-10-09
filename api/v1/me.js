import { authenticate } from '../_lib/auth.js';
import { json, withErrors } from '../_lib/http.js';

/** GET /api/v1/me — who the caller is (role and name from their session). */
export const GET = withErrors(async (request) => {
  const auth = await authenticate(request);
  return json({ userId: auth.userId, role: auth.role, name: auth.name });
});
