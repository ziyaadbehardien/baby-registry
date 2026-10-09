import { authenticate, requireOwner } from '../_lib/auth.js';
import { json, readJson, withErrors } from '../_lib/http.js';
import { getLinkPreview } from '../_lib/linkPreview.js';
import { validateLinkPreview } from '../_lib/validation.js';

/** POST /api/v1/link-previews — owner fetches the photo and title from a shop link. */
export const POST = withErrors(async (request) => {
  requireOwner(await authenticate(request));
  const { url } = validateLinkPreview(await readJson(request));
  return json(await getLinkPreview(url));
});
