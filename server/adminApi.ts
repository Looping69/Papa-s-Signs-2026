import type { Express } from 'express';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { normalizeSiteConfig } from '../shared/siteConfig';
import { calculateEstimate, validateQuoteSettings } from '../shared/quote';
import { listMediaAssets } from './mediaLibrary';
import type { AdminAuth } from './adminAuth';

import { localManagement } from './localManagement';
export { localManagement } from './localManagement';
function validateConfig(value: any) {
  if (!value || typeof value !== 'object' || !value.hero || typeof value.hero.title !== 'string' || typeof value.hero.backgroundImage !== 'string' || !Array.isArray(value.stats) || !Array.isArray(value.gallery) || !Array.isArray(value.services) || value.gallery.length > 5000 || value.services.length > 100) throw new Error('Invalid site configuration.');
  const imageUrl = (src: any) => typeof src === 'string' && (src === '' || /^\/(images|uploads)\/[A-Za-z0-9_./% -]+$/.test(src) && !src.includes('..') || /^https:\/\//i.test(src));
  if (!imageUrl(value.hero.backgroundImage) || value.gallery.some((row: any) => !imageUrl(row?.src)) || value.services.some((row: any) => !imageUrl(row?.image)) || value.images && (typeof value.images !== 'object' || Array.isArray(value.images) || Object.values(value.images).some(src => !imageUrl(src)))) throw new Error('Use supported public image URLs.');
  validateQuoteSettings(value.quoteAssistant);
}
export function attachAdminApi(app: Express, {
  configFile,
  publicDir,
  defaults,
  auth
}: {
  configFile: string;
  publicDir: string;
  defaults: any;
  auth: AdminAuth;
}) {
  const read = () => normalizeSiteConfig(JSON.parse(fs.readFileSync(configFile, 'utf8')), defaults);
  app.get('/api/config', (_req, res) => {
    try {
      const config=read();
      res.set('Cache-Control', 'no-store').json({
        hero:config.hero,stats:config.stats,gallery:config.gallery,services:config.services,images:config.images,
        quoteAssistant:{enabled:config.quoteAssistant?.enabled===true,services:[],messages:{failure:config.quoteAssistant?.messages?.failure || ''}}
      });
    } catch {
      res.status(500).json({
        error: 'Configuration unavailable.'
      });
    }
  });
  app.get('/api/admin/config',auth.requireSession,(_req,res)=>{
    try{res.set('Cache-Control','no-store').json(read());}catch{res.status(500).json({error:'Configuration unavailable.'});}
  });
  app.post('/api/config', localManagement, auth.requireSession, (req, res) => {
    let next;
    try {
      if (!req.body?.hero || !Array.isArray(req.body.gallery) || !Array.isArray(req.body.services) || !Array.isArray(req.body.stats)) throw new Error('Save the complete site configuration.');
      next = normalizeSiteConfig(req.body, defaults);
      validateConfig(next);
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message
      });
      return;
    }
    const temporary = `${configFile}.${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, JSON.stringify(next, null, 2), {
        flag: 'wx'
      });
      fs.renameSync(temporary, configFile);
      res.json({
        success: true
      });
    } catch {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
      res.status(500).json({
        error: 'Unable to save configuration; previous settings retained.'
      });
    }
  });
  app.get('/api/media', localManagement, auth.requireSession, (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store').json({
        assets: listMediaAssets(publicDir, read().gallery)
      });
    } catch {
      res.status(500).json({
        error: 'Unable to read the media library.'
      });
    }
  });
  app.get('/api/quote/settings', (_req, res) => {
    try {
      const settings = read().quoteAssistant;
      validateQuoteSettings(settings);
      res.set('Cache-Control', 'no-store').json({
        enabled: settings.enabled,
        services: settings.enabled ? settings.services.filter(row => row.enabled && row.rate !== null).map(({
          id,
          title,
          basis,
          packageQuantity,
          requiredDetails
        }) => ({
          id,
          title,
          basis,
          packageQuantity,
          requiredDetails
        })) : []
      });
    } catch {
      res.status(503).json({
        enabled: false,
        services: []
      });
    }
  });
  const windows = new Map<string, {
    count: number;
    expires: number;
  }>();
  app.post('/api/quote/estimate', (req, res) => {
    const now = Date.now();
    for (const [key, value] of windows) if (value.expires <= now) windows.delete(key);
    const key = req.socket.remoteAddress || 'unknown';
    const window = windows.get(key) || {
      count: 0,
      expires: now + 60_000
    };
    if (window.count >= 30 || windows.size >= 1000 && !windows.has(key)) {
      res.set('Retry-After', '60').status(429).json({
        error: 'Too many requests. Please try again shortly.'
      });
      return;
    }
    window.count++;
    windows.set(key, window);
    try {
      const result = calculateEstimate(read().quoteAssistant, req.body);
      res.set('Cache-Control', 'no-store').status(result.status === 'disabled' ? 503 : result.status === 'invalid' ? 400 : 200).json(result);
    } catch {
      res.status(503).json({
        error: 'Estimates are unavailable. Please contact our staff.'
      });
    }
  });
}
