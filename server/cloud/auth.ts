import type { Express, Request, Response, RequestHandler } from 'express';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { CloudStore } from './store';
import { isTrustedManagement } from './policy.js';

export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const COOKIE = 'papas_cloud_admin';
const SESSION_MS = 8 * 60 * 60 * 1000;
export const derive = (password: string, salt: string): Promise<Buffer> => new Promise((resolve,reject) => scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024},(error,result)=>error?reject(error):resolve(result)));
export function clientKey(req: Request) {
  // This API runs only behind Vercel's edge, which supplies this header.
  return digest(String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim());
}
export function createCloudAuth(store: CloudStore, hosts: string[]) {
  const token = (req: Request) => {
    const values=(req.headers.cookie||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
    return values.length===1 && /^[a-f0-9]{64}$/.test(values[0].slice(COOKIE.length+1)) ? values[0].slice(COOKIE.length+1) : '';
  };
  const boundary: RequestHandler = (req,res,next) => {
    res.set('Cache-Control','no-store');
    if (!isTrustedManagement(req.headers.host||'', req.headers.origin, req.headers['sec-fetch-site'] as string|undefined, hosts)) {
      res.status(403).json({error:'Use the secure admin on this website.'});return;
    }
    if (!['GET','HEAD'].includes(req.method) && req.headers.origin !== `https://${req.headers.host}`) {
      res.status(403).json({error:'A same-origin request is required.'});return;
    }
    next();
  };
  async function authenticated(req: Request) {
    const value=token(req); if(!value)return false;
    const result=await store.query(`SELECT 1 FROM __SCHEMA__.sessions s JOIN __SCHEMA__.admin a ON a.id=1 WHERE s.token_hash=$1 AND s.expires>now() AND s.credential=a.hash`,[digest(value)]);
    return result.rowCount===1;
  }
  const requireSession: RequestHandler = async (req,res,next) => {
    try {if(!await authenticated(req)){res.status(401).json({code:'ADMIN_AUTH_REQUIRED',error:'Please sign in to continue. Your unsaved changes have not been published.'});return;}next();}
    catch {res.status(503).json({error:'Admin authentication is temporarily unavailable.'});}
  };
  async function issue(req: Request,res: Response, hash: string) {
    await store.query('DELETE FROM __SCHEMA__.sessions WHERE expires<now()');
    const value=randomBytes(32).toString('hex');
    await store.query('INSERT INTO __SCHEMA__.sessions(token_hash,credential,expires) VALUES ($1,$2,now()+interval \'8 hours\')',[digest(value),hash]);
    const old=token(req);if(old)await store.query('DELETE FROM __SCHEMA__.sessions WHERE token_hash=$1',[digest(old)]);
    res.cookie(COOKIE,value,{httpOnly:true,secure:true,sameSite:'strict',path:'/api',maxAge:SESSION_MS});
  }
  async function throttle(req: Request,res: Response) {
    if (!await store.allow('login:'+clientKey(req),5,900) || !await store.allow('login:global',100,900)) {
      res.set('Retry-After','900').status(429).json({error:'Too many sign-in attempts. Please wait 15 minutes.'});return false;
    }return true;
  }
  const validPassword=(value:unknown):value is string=>typeof value==='string' && value.length>=14 && Buffer.byteLength(value)<=256 && !!value.trim();
  function mount(app: Express) {
    app.use('/api/admin',boundary);
    app.get('/api/admin/session',async(req,res)=>{
      const credential=await store.credential();if(!credential)throw new Error('Admin not initialized');
      res.json({authenticated:await authenticated(req),setupRequired:!credential.hash,setupKeyRequired:!credential.hash,mode:'cloud'});
    });
    app.post('/api/admin/setup',async(req,res)=>{
      if(!await throttle(req,res))return;
      const credential=await store.credential();
      if(credential?.hash){res.status(409).json({error:'Admin is already configured. Please sign in.'});return;}
      const {password,confirmPassword,setupKey}=req.body||{};
      if(typeof setupKey!=='string'||setupKey.length!==64||!credential?.bootstrap_hash||digest(setupKey)!==credential.bootstrap_hash||new Date(credential.bootstrap_expires).getTime()<=Date.now()) {
        res.status(403).json({error:'A valid private setup code is required.'});return;
      }
      if(!validPassword(password)||password!==confirmPassword){res.status(400).json({error:'Use matching passwords of at least 14 characters (maximum 256 UTF-8 bytes).'});return;}
      const salt=randomBytes(16).toString('hex');const hash=(await derive(password,salt)).toString('hex');
      const result=await store.query(`UPDATE __SCHEMA__.admin SET salt=$1,hash=$2,bootstrap_hash=NULL,bootstrap_expires=NULL WHERE id=1 AND hash IS NULL AND bootstrap_hash=$3 AND bootstrap_expires>now() RETURNING id`,[salt,hash,credential.bootstrap_hash]);
      if(!result.rowCount){res.status(409).json({error:'Setup was already completed or the code expired.'});return;}
      await issue(req,res,hash);await store.query('DELETE FROM __SCHEMA__.limits WHERE key=$1',['login:'+clientKey(req)]);
      res.status(201).json({authenticated:true});
    });
    app.post('/api/admin/login',async(req,res)=>{
      if(!await throttle(req,res))return;
      const password=req.body?.password;
      if(typeof password!=='string'||Buffer.byteLength(password)>256){res.status(401).json({error:'Invalid password.'});return;}
      const credential=await store.credential();
      if(!credential?.hash||!/^[a-f0-9]{128}$/.test(credential.hash)||!/^[a-f0-9]{32}$/.test(credential.salt)){res.status(401).json({error:'Admin setup is required.'});return;}
      if(!timingSafeEqual(await derive(password,credential.salt),Buffer.from(credential.hash,'hex'))){res.status(401).json({error:'Invalid password.'});return;}
      if((await store.credential())?.hash!==credential.hash){res.status(409).json({error:'Credentials changed. Please sign in again.'});return;}
      await issue(req,res,credential.hash);await store.query('DELETE FROM __SCHEMA__.limits WHERE key=$1',['login:'+clientKey(req)]);
      res.json({authenticated:true});
    });
    app.post('/api/admin/logout',async(req,res)=>{
      const value=token(req);if(value)await store.query('DELETE FROM __SCHEMA__.sessions WHERE token_hash=$1',[digest(value)]);
      res.clearCookie(COOKIE,{httpOnly:true,secure:true,sameSite:'strict',path:'/api'});res.json({authenticated:false});
    });
  }
  return {mount,boundary,requireSession,authenticated};
}
