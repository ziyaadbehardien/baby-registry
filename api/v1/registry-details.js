import { authenticate } from '../_lib/auth.js';
import { json, withErrors } from '../_lib/http.js';
import { registryDetails } from '../_lib/registryDetails.js';

/** GET /api/v1/registry-details — landing-page content, for signed-in guests only. */
export const GET = withErrors(async (request) => {
  await authenticate(request);
  return json(registryDetails);
});
