import test from 'node:test';
import assert from 'node:assert/strict';

test('cloud management only accepts the configured HTTPS origin', async () => {
  const api: any = await import('../server/cloud/policy.ts').catch(() => ({}));
  assert.equal(typeof api.isTrustedManagement, 'function');
  assert.equal(api.isTrustedManagement('papas-signs-2026.vercel.app', 'https://papas-signs-2026.vercel.app', 'same-origin', ['papas-signs-2026.vercel.app']), true);
  for (const [host, origin, site] of [
    ['evil.example', 'https://evil.example', 'same-origin'],
    ['papas-signs-2026.vercel.app', 'https://evil.example', 'cross-site'],
    ['papas-signs-2026.vercel.app', 'http://papas-signs-2026.vercel.app', 'same-origin'],
  ]) assert.equal(api.isTrustedManagement(host, origin, site, ['papas-signs-2026.vercel.app']), false);
});
