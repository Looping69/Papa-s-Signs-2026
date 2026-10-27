import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
import { randomBytes, createHash } from 'node:crypto';
import { defaultConfig } from '../data/defaultConfig';
import { normalizeSiteConfig } from '../shared/siteConfig';
import { validateConfig } from '../server/adminApi';

// Run with node --env-file=.env.cloud.local --import tsx scripts/initialize-cloud.ts.
// Never prints secrets and never replaces an existing password or live config.
if(!process.env.DATABASE_URL_UNPOOLED)throw new Error('Direct database connection is required.');
const connection=new URL(process.env.DATABASE_URL_UNPOOLED);connection.searchParams.set('sslmode','verify-full');
const pool=new Pool({connectionString:connection.toString(),connectionTimeoutMillis:10000});
const client=await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(fs.readFileSync('migrations/001-cloud.sql','utf8'));
  const saved=fs.existsSync('config.json')?JSON.parse(fs.readFileSync('config.json','utf8')):{};
  const config=normalizeSiteConfig(saved,defaultConfig);validateConfig(config);
  await client.query('INSERT INTO papas.config(id,value) VALUES(1,$1) ON CONFLICT(id) DO NOTHING',[config]);
  const credential=(await client.query('SELECT hash,bootstrap_hash FROM papas.admin WHERE id=1')).rows[0];
  if(!credential){
    const key=randomBytes(32).toString('hex');
    await client.query("INSERT INTO papas.admin(id,bootstrap_hash,bootstrap_expires) VALUES(1,$1,now()+interval '72 hours')",[createHash('sha256').update(key).digest('hex')]);
    fs.mkdirSync('.private',{recursive:true});
    const link=`https://papas-signs-2026.vercel.app/#/admin?setup=${key}`;
    fs.writeFileSync(path.join('.private','cloud-admin-setup.html'),`<!doctype html><meta name="referrer" content="no-referrer"><title>Private Papa's Signs admin setup</title><h1>Private one-time admin setup</h1><p>Keep this file private. This code expires in 72 hours and is consumed when you create your own password.</p><p><a href="${link}">Create your Papa's Signs admin password</a></p><p>Manual setup code: <code>${key}</code></p>`,{flag:'wx',mode:0o600});
  }
  await client.query('COMMIT');
  console.log('Cloud schema and initial content ready. Existing settings/passwords were preserved. Private setup file created only on first initialization.');
}catch(error){await client.query('ROLLBACK');throw new Error('Cloud initialization failed; database transaction rolled back.');}
finally{client.release();await pool.end();}
