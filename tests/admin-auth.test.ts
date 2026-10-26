import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const module = (await import('../server/adminAuth.ts').catch(() => ({}))) as any;
// Only test fixtures: these are not the user's password or credentials.
const password = 'test-only-fixture-password-2026';
async function fixture(run: (ctx: any) => Promise<void>, options: any = {}) {
  assert.equal(typeof module.createAdminAuth, 'function', 'server password protection must exist');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'papas-auth-'));
  const file = path.join(dir, '.private', 'admin-auth.local');
  let clock = 1000;
  const app = express();
  app.use(express.json());
  const auth = module.createAdminAuth({
    credentialFile: file,
    now: () => clock,
    ...options
  });
  auth.mount(app);
  app.get('/protected', auth.requireSession, (_req, res) => res.json({
    secret: 'admin-only'
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const post = (route: string, body: any, cookie = '', headers = {}) => fetch(base + route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? {
        Cookie: cookie
      } : {}),
      ...headers
    },
    body: JSON.stringify(body)
  });
  try {
    await run({
      file,
      auth,
      base,
      post,
      advance: (ms: number) => {
        clock += ms;
      }
    });
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  }
}
test('setup creates only a salted hash; correct password logs in, logout revokes the session', async () => fixture(async ({
  file,
  base,
  post
}) => {
  assert.equal((await fetch(base + '/protected')).status, 401);
  assert.deepEqual(await (await fetch(base + '/api/admin/session')).json(), {
    authenticated: false,
    setupRequired: true
  });
  assert.equal((await post('/api/admin/setup', {
    password: 'short',
    confirmPassword: 'short'
  })).status, 400);
  assert.equal((await post('/api/admin/setup', {
    password,
    confirmPassword: 'different'
  })).status, 400);
  const setup = await post('/api/admin/setup', {
    password,
    confirmPassword: password
  });
  assert.equal(setup.status, 201);
  const stored = fs.readFileSync(file, 'utf8');
  assert.ok(!stored.includes(password));
  assert.ok(JSON.parse(stored).salt);
  const cookie = setup.headers.get('set-cookie')!;
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  assert.match(cookie, /Max-Age=28800/i);
  assert.equal((await fetch(base + '/protected', {
    headers: {
      Cookie: cookie.split(';')[0]
    }
  })).status, 200);
  assert.equal((await post('/api/admin/setup', {
    password,
    confirmPassword: password
  })).status, 409);
  const before = fs.readFileSync(file, 'utf8');
  assert.equal(before, stored);
  assert.equal((await post('/api/admin/login', {
    password: 'wrong-password-value'
  })).status, 401);
  const login = await post('/api/admin/login', {
    password
  }, cookie.split(';')[0]);
  assert.equal(login.status, 200);
  const session = login.headers.get('set-cookie')!.split(';')[0];
  assert.notEqual(session, cookie.split(';')[0]);
  assert.equal((await fetch(base + '/protected', {
    headers: {
      Cookie: cookie.split(';')[0]
    }
  })).status, 401);
  assert.equal((await post('/api/admin/logout', {}, session)).status, 200);
  assert.equal((await fetch(base + '/protected', {
    headers: {
      Cookie: session
    }
  })).status, 401);
}));
test('session expires and a fresh server cannot accept a previous session token', async () => fixture(async ({
  auth,
  base,
  post,
  file,
  advance
}) => {
  const setup = await post('/api/admin/setup', {
    password,
    confirmPassword: password
  });
  const cookie = setup.headers.get('set-cookie')!.split(';')[0];
  advance(8 * 60 * 60 * 1000 + 1);
  assert.equal((await fetch(base + '/protected', {
    headers: {
      Cookie: cookie
    }
  })).status, 401);
  const login = await post('/api/admin/login', {
    password
  });
  const activeCookie = login.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await fetch(base + '/protected', {
    headers: {
      Cookie: activeCookie
    }
  })).status, 200);
  const fresh = module.createAdminAuth({
    credentialFile: file
  });
  const app = express();
  app.get('/protected', fresh.requireSession, (_req, res) => res.json({
    ok: true
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    assert.equal((await fetch(`http://127.0.0.1:${(server.address() as any).port}/protected`, {
      headers: {
        Cookie: activeCookie
      }
    })).status, 401);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}));
test('failed attempts throttle, cross-origin setup fails, and corrupt storage never reopens setup', async () => fixture(async ({
  base,
  post,
  file,
  advance
}) => {
  assert.equal((await post('/api/admin/setup', {
    password,
    confirmPassword: password
  }, '', {
    Origin: 'https://untrusted.example'
  })).status, 403);
  assert.equal((await post('/api/admin/setup', {
    password,
    confirmPassword: password
  })).status, 201);
  advance(16 * 60 * 1000);
  for (let i = 0; i < 5; i++) assert.equal((await post('/api/admin/login', {
    password: 'incorrect-fixture'
  })).status, 401);
  assert.equal((await post('/api/admin/login', {
    password
  })).status, 429);
  advance(16 * 60 * 1000);
  assert.equal((await post('/api/admin/login', {
    password
  })).status, 200);
  fs.writeFileSync(file, 'corrupt');
  assert.equal((await fetch(base + '/api/admin/session')).status, 503);
  assert.equal((await post('/api/admin/setup', {
    password,
    confirmPassword: password
  })).status, 503);
}));
test('concurrent setup has one winner and cannot overwrite it', async () => fixture(async ({
  post,
  file
}) => {
  const results = await Promise.all([post('/api/admin/setup', {
    password,
    confirmPassword: password
  }), post('/api/admin/setup', {
    password: password + '2',
    confirmPassword: password + '2'
  })]);
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).version, 1);
}));
test('private URL detection covers encoded and Vite filesystem paths', () => {
  assert.equal(typeof module.isPrivateRequest, 'function');
  for (const url of ['/.private/admin-auth.local', '/@fs/C:/repo/.private/admin-auth.local?raw', '/%2eprivate/admin-auth.local', '/%252eprivate/admin-auth.local', '/config.json?import', '/@fs/C:/repo/config.json', '/.PRIVATE./admin-auth.local']) assert.equal(module.isPrivateRequest(url), true, url);
  assert.equal(module.isPrivateRequest('/images/papas26/project-0124.jpg'), false);
});
