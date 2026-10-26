import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAdminAuth } from '../server/adminAuth';
const api = (await import('../server/adminApi.ts').catch(() => ({}))) as any;
test('real HTTP API blocks disabled estimates, persists overrides, rejects invalid saves and cross-origin writes', async () => {
  assert.equal(typeof api.attachAdminApi, 'function', 'API registration must exist');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'papas-api-'));
  const file = path.join(directory, 'config.json');
  fs.mkdirSync(path.join(directory, 'public', 'uploads'), {
    recursive: true
  });
  const defaults = {
    hero: {
      title: 'Printing',
      subtitle: 'Signs',
      description: 'Local signs',
      backgroundImage: '/images/old.jpg'
    },
    stats: [],
    gallery: [],
    services: []
  };
  fs.writeFileSync(file, JSON.stringify(defaults));
  const app = express();
  app.use(express.json());
  const auth = createAdminAuth({
    credentialFile: path.join(directory, '.private', 'admin-auth.local')
  });
  auth.mount(app);
  api.attachAdminApi(app, {
    configFile: file,
    publicDir: path.join(directory, 'public'),
    defaults,
    auth
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as any).port}`;
  try {
    assert.equal((await fetch(url + '/api/media')).status, 401);
    assert.equal((await fetch(url + '/api/admin/config')).status, 401);
    assert.equal((await fetch(url + '/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    })).status, 401);
    const password = 'isolated-integration-test-password';
    const setup = await fetch(url + '/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password,
        confirmPassword: password
      })
    });
    assert.equal(setup.status, 201);
    const cookie = setup.headers.get('set-cookie')!.split(';')[0];
    const privateConfig = () => fetch(url + '/api/admin/config', {
      headers: {
        Cookie: cookie
      }
    });
    assert.equal((await fetch(url + '/api/quote/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceId: 'x',
        quantity: 1
      })
    })).status, 503);
    const saved = await (await privateConfig()).json();
    saved.hero.backgroundImage = '/uploads/custom.jpg';
    const post = (body: any, extra = {}) => fetch(url + '/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        ...extra
      },
      body: JSON.stringify(body)
    });
    assert.equal((await post(saved, {
      Origin: 'https://evil.example'
    })).status, 403);
    assert.equal((await post(saved)).status, 200);
    assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).hero.backgroundImage, '/uploads/custom.jpg');
    assert.equal((await post({
      ...saved,
      quoteAssistant: {
        enabled: true,
        services: [{
          id: 'bad'
        }],
        messages: {}
      }
    })).status, 400);
    assert.equal((await (await fetch(url + '/api/config')).json()).hero.backgroundImage, '/uploads/custom.jpg');
    assert.equal((await (await fetch(url + '/api/media', {
      headers: {
        Cookie: cookie
      }
    })).json()).assets.length, 0);
    saved.quoteAssistant = {
      enabled: true,
      messages: {},
      services: [{
        id: 'cards',
        title: 'Cards',
        enabled: true,
        basis: 'package',
        rate: 450,
        minimumCharge: 0,
        packageQuantity: 500,
        requiredDetails: []
      }]
    };
    assert.equal((await post(saved)).status, 200);
    const publicConfig = await (await fetch(url + '/api/config')).json();
    assert.deepEqual(publicConfig.quoteAssistant.services, []);
    const estimate = await (await fetch(url + '/api/quote/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceId: 'cards',
        quantity: 1000,
        rate: 0,
        approved: true
      })
    })).json();
    assert.equal(estimate.amount, 900);
    assert.equal(estimate.requiresStaffApproval, true);
    const publicSettings = await (await fetch(url + '/api/quote/settings')).json();
    assert.equal(publicSettings.services[0].rate, undefined);
    for (let i = 0; i < 30; i++) await fetch(url + '/api/quote/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    assert.equal((await fetch(url + '/api/quote/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    })).status, 429);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    fs.rmSync(directory, {
      recursive: true,
      force: true
    });
  }
});
