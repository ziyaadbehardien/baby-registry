import { neon } from '@neondatabase/serverless';

import { HttpError } from './http.js';

let sql;

const isLocal = () => !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development';

/**
 * Local fallback when DATABASE_URL isn't set: an embedded Postgres (see localDb.js).
 * Loaded lazily so deployed functions never import it.
 */
const localSqlProxy = async (strings, ...values) => {
  const { localSql } = await import('./localDb.js');
  return localSql(strings, ...values);
};

/** Lazily created database client; each tagged-template call is one atomic statement. */
export const getSql = () => {
  if (sql) return sql;

  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
  } else if (isLocal()) {
    sql = localSqlProxy;
  } else {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  }
  return sql;
};
