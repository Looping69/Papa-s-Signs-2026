import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { normalizeSiteConfig } from '../../shared/siteConfig.js';
import { defaultConfig } from '../../data/defaultConfig.js';

export function createCloudStore(connectionString: string, schema = 'papas') {
  if (!/^[a-z_]+$/.test(schema)) throw new Error('Invalid database namespace');
  const connection = new URL(connectionString);
  connection.searchParams.set('sslmode','verify-full');
  const pool = new Pool({connectionString:connection.toString(), max: 3, connectionTimeoutMillis: 8000, idleTimeoutMillis: 10000, statement_timeout: 8000});
  if (process.env.VERCEL) attachDatabasePool(pool);
  const query = (sql: string, args: any[] = []) => pool.query(sql.replaceAll('__SCHEMA__', schema), args);
  return {
    pool, query,
    async readConfig() {
      const result = await query('SELECT value, revision FROM __SCHEMA__.config WHERE id=1');
      if (!result.rows[0]) throw new Error('Site configuration is not initialized');
      return {...normalizeSiteConfig(result.rows[0].value, defaultConfig), _revision: result.rows[0].revision};
    },
    async saveConfig(value: any, revision: number) {
      const result = await query('UPDATE __SCHEMA__.config SET value=$1, revision=revision+1 WHERE id=1 AND revision=$2 RETURNING revision', [value, revision]);
      return result.rows[0]?.revision as number | undefined;
    },
    async allow(key: string, limit: number, seconds: number) {
      await query('DELETE FROM __SCHEMA__.limits WHERE expires<now()');
      const result = await query(`INSERT INTO __SCHEMA__.limits (key,count,expires) VALUES ($1,1,now()+$2*interval '1 second')
        ON CONFLICT (key) DO UPDATE SET count=CASE WHEN __SCHEMA__.limits.expires<=now() THEN 1 ELSE __SCHEMA__.limits.count+1 END,
        expires=CASE WHEN __SCHEMA__.limits.expires<=now() THEN now()+$2*interval '1 second' ELSE __SCHEMA__.limits.expires END RETURNING count`, [key, seconds]);
      return result.rows[0].count <= limit;
    },
    async credential() {return (await query('SELECT * FROM __SCHEMA__.admin WHERE id=1')).rows[0];},
  };
}
export type CloudStore = ReturnType<typeof createCloudStore>;
