/**
 * Local-development database: an embedded Postgres (PGlite) stored in .local-db/.
 * Used only when DATABASE_URL is unset and the code is not running on a Vercel deployment.
 * Pending migrations from db/migrations are applied automatically, including ones added while
 * the dev server is running. LOCAL_DB_DIR overrides the storage folder.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';

const DATA_DIR = path.resolve(process.cwd(), process.env.LOCAL_DB_DIR ?? '.local-db');
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'db/migrations');

// Kept on globalThis so Vite's module reloads reuse the one open database instead of opening
// the same data folder twice in one process.
const state = (globalThis.__babyRegistryLocalDb ??= {
  dbPromise: null,
  applied: null,
  migrating: Promise.resolve(),
});

const migrate = async (db) => {
  let { applied } = state;
  if (!applied) {
    await db.exec(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())'
    );
    const { rows } = await db.query('SELECT name FROM schema_migrations');
    applied = state.applied = new Set(rows.map((row) => row.name));
  }

  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    await db.transaction(async (tx) => {
      await tx.exec(sql);
      await tx.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    });
    applied.add(file);
  }
};

const getDb = async () => {
  state.dbPromise ??= Promise.resolve(new PGlite(DATA_DIR));
  const db = await state.dbPromise;
  // Serialise migration checks so concurrent requests don't apply the same file twice;
  // a failed check doesn't poison later ones.
  state.migrating = state.migrating.catch(() => {}).then(() => migrate(db));
  await state.migrating;
  return db;
};

/** Same calling convention as the Neon client: sql`...` resolves to the result rows. */
export const localSql = async (strings, ...values) => {
  const db = await getDb();
  const { rows } = await db.sql(strings, ...values);
  return rows;
};
