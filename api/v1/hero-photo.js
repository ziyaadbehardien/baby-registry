import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { authenticate } from '../_lib/auth.js';
import { HttpError, json, withErrors } from '../_lib/http.js';

const PHOTO_DIR = path.join(process.cwd(), 'private');
const MAX_BYTES = 4 * 1024 * 1024;
const CANDIDATES = [
  ['hero.jpg', 'image/jpeg'],
  ['hero.jpeg', 'image/jpeg'],
  ['hero.png', 'image/png'],
  ['hero.webp', 'image/webp'],
];

/**
 * GET /api/v1/hero-photo — the family photo as a data URL, for signed-in guests only.
 * Kept out of public/ because static files are served without sign-in.
 */
export const GET = withErrors(async (request) => {
  await authenticate(request);

  for (const [file, type] of CANDIDATES) {
    let bytes;
    try {
      bytes = await readFile(path.join(PHOTO_DIR, file));
    } catch {
      continue;
    }
    if (bytes.length > MAX_BYTES) break;
    return json({ dataUrl: `data:${type};base64,${bytes.toString('base64')}` });
  }

  throw new HttpError(404, 'NOT_FOUND', 'No family photo has been added yet.');
});
