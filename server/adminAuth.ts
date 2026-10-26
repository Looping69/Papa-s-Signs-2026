import type { Express, Request, Response, RequestHandler } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { localManagement } from './localManagement';
const COOKIE = 'papas_admin';
const SESSION_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
interface Credential {
  version: 1;
  salt: string;
  hash: string;
}
export interface AdminAuth {
  requireSession: RequestHandler;
  mount: (app: Express) => void;
}
export function isPrivateRequest(url: string): boolean {
  let value = url.split('?')[0];
  try {
    for (let i = 0; i < 4; i++) {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    }
  } catch {
    return true;
  }
  return value.replace(/\\/g, '/').split(/[/?]/).some(segment => {
    const name = segment.split(':')[0].replace(/[. ]+$/g, '').toLowerCase();
    return name === '.private' || name === '.git' || name === '.env' || name.startsWith('.env.') || name.endsWith('.local') || name === 'config.json' || name.startsWith('config.json.') || name.startsWith('.qa-config') || name.includes('\0');
  });
}
export function createAdminAuth({
  credentialFile,
  now = Date.now
}: {
  credentialFile: string;
  now?: () => number;
}): AdminAuth {
  const sessions = new Map<string, {
    expires: number;
    credential: string;
  }>();
  const attempts = new Map<string, {
    count: number;
    expires: number;
  }>();
  let settingUp = false,
    derivations = 0;
  const digest = (value: string) => createHash('sha256').update(value).digest('hex');
  function read(): Credential | null {
    let stat: fs.Stats;
    try {
      stat = fs.lstatSync(credentialFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) throw new Error('Invalid credential storage');
    const value = JSON.parse(fs.readFileSync(credentialFile, 'utf8'));
    if (value?.version !== 1 || !/^[a-f0-9]{32}$/.test(value.salt) || !/^[a-f0-9]{128}$/.test(value.hash)) throw new Error('Invalid credential storage');
    return value;
  }
  const fingerprint = (credential: Credential) => digest(JSON.stringify(credential));
  const token = (req: Request) => {
    const matches = (req.headers.cookie || '').split(';').map(value => value.trim()).filter(value => value.startsWith(COOKIE + '='));
    const value = matches.length === 1 ? matches[0].slice(COOKIE.length + 1) : '';
    return /^[a-f0-9]{64}$/.test(value) ? value : '';
  };
  function prune() {
    const time = now();
    for (const [key, value] of sessions) if (value.expires <= time) sessions.delete(key);
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
  }
  function authenticated(req: Request, credential: Credential | null) {
    prune();
    const value = token(req);
    const session = value ? sessions.get(digest(value)) : undefined;
    return !!credential && !!session && session.expires > now() && session.credential === fingerprint(credential);
  }
  function issue(req: Request, res: Response, credential: Credential) {
    prune();
    if (sessions.size >= 128) throw new Error('Too many sessions');
    const old = token(req);
    if (old) sessions.delete(digest(old));
    const value = randomBytes(32).toString('hex');
    sessions.set(digest(value), {
      expires: now() + SESSION_MS,
      credential: fingerprint(credential)
    });
    res.cookie(COOKIE, value, {
      httpOnly: true,
      sameSite: 'strict',
      secure: req.secure,
      path: '/api',
      maxAge: SESSION_MS
    });
  }
  function throttle(req: Request, res: Response): boolean {
    prune();
    const key = req.socket.remoteAddress || 'unknown';
    const value = attempts.get(key) || {
      count: 0,
      expires: now() + LOGIN_WINDOW_MS
    };
    if (value.count >= 5 || derivations >= 2 || attempts.size >= 1000 && !attempts.has(key)) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((value.expires - now()) / 1000)))).status(429).json({
        error: 'Too many sign-in attempts. Please wait up to 15 minutes before trying again.'
      });
      return false;
    }
    value.count++;
    attempts.set(key, value);
    return true;
  }
  async function derive(password: string, salt: string): Promise<Buffer> {
    derivations++;
    try {
      return await new Promise((resolve, reject) => scrypt(password, salt, 64, {
        N: 32768,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024
      }, (error, result) => error ? reject(error) : resolve(result)));
    } finally {
      derivations--;
    }
  }
  const requireSession: RequestHandler = (req, res, next) => localManagement(req, res, () => {
    res.set('Cache-Control', 'no-store');
    try {
      if (!authenticated(req, read())) {
        res.status(401).json({
          code: 'ADMIN_AUTH_REQUIRED',
          error: 'Please sign in to continue. Your unsaved changes have not been published.'
        });
        return;
      }
      next();
    } catch {
      res.status(503).json({
        error: 'Admin authentication is unavailable. Check local credential storage.'
      });
    }
  });
  function mount(app: Express) {
    app.use('/api/admin', localManagement, (_req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    });
    app.get('/api/admin/session', (req, res) => {
      try {
        const credential = read();
        res.json({
          authenticated: authenticated(req, credential),
          setupRequired: credential === null
        });
      } catch {
        res.status(503).json({
          error: 'Admin authentication is unavailable. Local recovery is required.'
        });
      }
    });
    app.post('/api/admin/setup', async (req, res) => {
      if (settingUp) {
        res.status(409).json({
          error: 'Admin setup is already in progress.'
        });
        return;
      }
      try {
        if (read()) {
          res.status(409).json({
            error: 'The admin password is already configured. Please sign in.'
          });
          return;
        }
      } catch {
        res.status(503).json({
          error: 'Existing credential storage requires local recovery.'
        });
        return;
      }
      if (!throttle(req, res)) return;
      const {
        password,
        confirmPassword
      } = req.body || {};
      if (typeof password !== 'string' || password.length < 14 || Buffer.byteLength(password, 'utf8') > 256 || !password.trim() || password !== confirmPassword) {
        res.status(400).json({
          error: 'Use 14 or more characters (maximum 256 UTF-8 bytes) and matching confirmation.'
        });
        return;
      }
      settingUp = true;
      try {
        const salt = randomBytes(16).toString('hex');
        const hash = (await derive(password, salt)).toString('hex');
        const credential: Credential = {
          version: 1,
          salt,
          hash
        };
        fs.mkdirSync(path.dirname(credentialFile), {
          recursive: true,
          mode: 0o700
        });
        fs.writeFileSync(credentialFile, JSON.stringify(credential), {
          flag: 'wx',
          mode: 0o600
        });
        issue(req, res, credential);
        attempts.delete(req.socket.remoteAddress || 'unknown');
        res.status(201).json({
          authenticated: true
        });
      } catch (error) {
        res.status((error as NodeJS.ErrnoException).code === 'EEXIST' ? 409 : 503).json({
          error: 'Unable to complete setup. Check local credential storage and sign-in status.'
        });
      } finally {
        settingUp = false;
      }
    });
    app.post('/api/admin/login', async (req, res) => {
      if (!throttle(req, res)) return;
      const password = req.body?.password;
      if (typeof password !== 'string' || password.length < 1 || Buffer.byteLength(password, 'utf8') > 256) {
        res.status(401).json({
          error: 'Invalid password.'
        });
        return;
      }
      try {
        const credential = read();
        if (!credential) {
          res.status(401).json({
            error: 'Admin setup is required locally.'
          });
          return;
        }
        const actual = await derive(password, credential.salt);
        if (!timingSafeEqual(actual, Buffer.from(credential.hash, 'hex'))) {
          res.status(401).json({
            error: 'Invalid password.'
          });
          return;
        }
        // Credentials could have been changed by the operator while scrypt was running.
        const current = read();
        if (!current || fingerprint(current) !== fingerprint(credential)) throw new Error('Credential changed');
        issue(req, res, credential);
        attempts.delete(req.socket.remoteAddress || 'unknown');
        res.json({
          authenticated: true
        });
      } catch {
        res.status(503).json({
          error: 'Admin authentication is unavailable. Please check local storage.'
        });
      }
    });
    app.post('/api/admin/logout', (req, res) => {
      const value = token(req);
      if (value) sessions.delete(digest(value));
      res.clearCookie(COOKIE, {
        httpOnly: true,
        sameSite: 'strict',
        secure: req.secure,
        path: '/api'
      });
      res.json({
        authenticated: false
      });
    });
  }
  return {
    requireSession,
    mount
  };
}
