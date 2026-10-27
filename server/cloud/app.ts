import express from 'express';
import { list } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { randomUUID } from 'node:crypto';
import { createCloudStore, type CloudStore } from './store';
import { createCloudAuth, clientKey } from './auth';
import { validateConfig } from '../adminApi';
import { normalizeSiteConfig } from '../../shared/siteConfig';
import { defaultConfig } from '../../data/defaultConfig';
import { calculateEstimate, validateQuoteSettings } from '../../shared/quote';
import type { MediaAsset } from '../../shared/media';

export function createCloudApp(store: CloudStore, hosts: string[]) {
  const app=express();
  app.disable('x-powered-by');
  app.use(express.json({limit:'2mb'}));
  app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');next();});
  const auth=createCloudAuth(store,hosts);auth.mount(app);
  app.get('/api/config',async(_req,res)=>{
    const c=await store.readConfig();
    res.json({hero:c.hero,stats:c.stats,gallery:c.gallery,services:c.services,images:c.images,quoteAssistant:{enabled:c.quoteAssistant.enabled,services:[],messages:{failure:c.quoteAssistant.messages.failure||''}}});
  });
  app.get('/api/admin/config',auth.requireSession,async(_req,res)=>{res.json(await store.readConfig());});
  app.post('/api/config',auth.boundary,auth.requireSession,async(req,res)=>{
    let next;
    try {validateConfig(req.body);next=normalizeSiteConfig(req.body,defaultConfig);if(!Number.isInteger(req.body?._revision))throw new Error('Reload settings before saving.');}
    catch(error){res.status(400).json({error:(error as Error).message});return;}
    delete next._revision;
    const revision=await store.saveConfig(next,req.body._revision);
    if(!revision){res.status(409).json({error:'Settings changed in another tab. Reload before publishing to avoid overwriting them.'});return;}
    res.json({success:true,revision});
  });
  app.get('/api/media/upload-mode',auth.boundary,auth.requireSession,(_req,res)=>res.json({provider:'blob'}));
  app.get('/api/media',auth.boundary,auth.requireSession,async(_req,res)=>{
    const config=await store.readConfig();
    const assets: MediaAsset[]=Array.from({length:103},(_,i)=>i+29).filter(i=>i!==107).map(i=>{
      const src=`/images/papas26/project-${String(i).padStart(4,'0')}.jpg`;const row=config.gallery.find((r:any)=>r.src===src);
      return {src,title:row?.title||`Project ${i}`,category:row?.category||'Portfolio',source:'portfolio',mediaType:'image'};
    });
    let cursor: string|undefined;
    do {
      const result=await list({prefix:'uploads/',limit:1000,cursor});
      for(const blob of result.blobs){
        const row=config.gallery.find((r:any)=>r.src===blob.url);
        assets.unshift({src:blob.url,title:row?.title||blob.pathname.split('/').pop()||'Upload',category:row?.category||'Uploads',source:'upload',mediaType:/\.(mp4|webm|ogg|mov|m4v)$/i.test(blob.pathname)?'video':'image'});
      }
      cursor=result.hasMore?result.cursor:undefined;
      if(assets.length>5000)throw new Error('Media library exceeds supported limit');
    }while(cursor);
    res.json({assets});
  });
  app.post('/api/upload',(req,res,next)=>{
    if(req.body?.type==='blob.upload-completed'){next();return;}
    auth.boundary(req,res,()=>auth.requireSession(req,res,next));
  },async(req,res)=>{
    const result=await handleUpload({request:req,body:req.body,
      onBeforeGenerateToken:async(pathname)=>{
        if(!hosts.includes(req.headers.host||'')||req.headers.origin!==`https://${req.headers.host}`||req.headers['sec-fetch-site']==='cross-site'||!await auth.authenticated(req))throw new Error('Please sign in on this website before uploading.');
        if(!await store.allow('upload:'+clientKey(req),100,3600))throw new Error('Upload limit reached.');
        if(!/^uploads\/[a-zA-Z0-9_-]{1,180}\.(jpg|jpeg|png|webp|gif|avif|mp4|webm|ogg|mov|m4v)$/i.test(pathname))throw new Error('Unsupported media filename.');
        return {allowedContentTypes:['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm','video/ogg','video/quicktime','video/x-m4v'],maximumSizeInBytes:20*1024*1024,validUntil:Date.now()+5*60*1000,addRandomSuffix:true,allowOverwrite:false,tokenPayload:randomUUID()};
      }
    });res.json(result);
  });
  app.get('/api/quote/settings',async(_req,res)=>{
    const settings=(await store.readConfig()).quoteAssistant;validateQuoteSettings(settings);
    res.json({enabled:settings.enabled,services:settings.enabled?settings.services.filter(row=>row.enabled&&row.rate!==null).map(({id,title,basis,packageQuantity,requiredDetails})=>({id,title,basis,packageQuantity,requiredDetails})):[]});
  });
  app.post('/api/quote/estimate',async(req,res)=>{
    if(!await store.allow('quote:'+clientKey(req),30,60)){res.set('Retry-After','60').status(429).json({error:'Too many requests. Please try again shortly.'});return;}
    const result=calculateEstimate((await store.readConfig()).quoteAssistant,req.body);
    res.status(result.status==='disabled'?503:result.status==='invalid'?400:200).json(result);
  });
  app.use('/api',(_req,res)=>{res.status(404).json({error:'API route not found.'});});
  app.use((error:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
    // Never expose database errors, connection strings or provider responses.
    res.status(error.status===413?413:503).json({error:error.status===413?'Request is too large.':'Service temporarily unavailable. Please try again or contact staff.'});
  });
  return app;
}
let app: ReturnType<typeof createCloudApp>|undefined;
export default function handler(req:any,res:any) {
  try {
    if(!process.env.DATABASE_URL)throw new Error('Database not configured');
    app??=createCloudApp(createCloudStore(process.env.DATABASE_URL),['papas-signs-2026.vercel.app',process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean) as string[]);
    return app(req,res);
  }catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Service configuration is unavailable.'}));}
}
