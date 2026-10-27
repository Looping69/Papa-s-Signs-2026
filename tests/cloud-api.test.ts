import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { put as clientPut } from '@vercel/blob/client';
import { del } from '@vercel/blob';
import { createCloudStore } from '../server/cloud/store';
import { createCloudApp } from '../server/cloud/app';
import { digest } from '../server/cloud/auth';
import { defaultConfig } from '../data/defaultConfig';

test('cloud API persists across instances, guards setup and writes, rejects stale saves and enforces quote safety', {skip:process.env.PAPAS_CLOUD_TEST!=='1'}, async()=>{
  const schema='papas_cloud_test';
  const store=createCloudStore(process.env.DATABASE_URL!,schema);
  await store.query(fs.readFileSync('migrations/001-cloud.sql','utf8').replaceAll('papas',schema));
  await store.query(`TRUNCATE __SCHEMA__.config, __SCHEMA__.admin, __SCHEMA__.sessions, __SCHEMA__.limits`);
  const setupKey='a'.repeat(64), password='Isolated cloud test password 2026';
  await store.query('INSERT INTO __SCHEMA__.config(id,value) VALUES(1,$1)',[defaultConfig]);
  await store.query("INSERT INTO __SCHEMA__.admin(id,bootstrap_hash,bootstrap_expires) VALUES(1,$1,now()+interval '1 hour')",[digest(setupKey)]);
  const app=createCloudApp(store,['test.example']);
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  const base=`http://127.0.0.1:${(server.address() as any).port}`;
  const headers={'host':'test.example','origin':'https://test.example','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.10'};
  const request=(path:string,body?:any,cookie?:string,extra={},target=base):Promise<Response>=>new Promise((resolve,reject)=>{
    const req=http.request(target+path,{method:body===undefined?'GET':'POST',headers:{...headers,...(cookie?{cookie}:{}),...extra}},res=>{
      const chunks:Buffer[]=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>{
        const responseHeaders=new Headers();for(const [key,value] of Object.entries(res.headers))if(value)responseHeaders.set(key,Array.isArray(value)?value.join(','):value);
        resolve(new Response(Buffer.concat(chunks),{status:res.statusCode,headers:responseHeaders}));
      });
    });req.on('error',reject);if(body!==undefined)req.write(JSON.stringify(body));req.end();
  });
  try {
    const sessionResponse=await request('/api/admin/session');
    const sessionBody=await sessionResponse.json();
    assert.equal(sessionBody.setupKeyRequired,true,JSON.stringify({status:sessionResponse.status,body:sessionBody}));
    for(const p of ['/api/admin/config','/api/media','/api/media/upload-mode'])assert.equal((await request(p)).status,401);
    assert.equal((await request('/api/upload',{type:'blob.generate-client-token'})).status,401);
    assert.equal((await request('/api/admin/setup',{password,confirmPassword:password,setupKey:'b'.repeat(64)})).status,403);
    const attempts=await Promise.all([request('/api/admin/setup',{password,confirmPassword:password,setupKey}),request('/api/admin/setup',{password,confirmPassword:password,setupKey})]);
    assert.deepEqual(attempts.map(r=>r.status).sort(),[201,409]);
    const cookie=attempts.find(r=>r.status===201)!.headers.get('set-cookie')!;
    assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Strict/);
    const cookieHeader=cookie.split(';')[0];
    assert.equal((await request('/api/admin/session',undefined,cookieHeader).then(r=>r.json())).authenticated,true);
    const second=createCloudApp(store,['test.example']).listen(0,'127.0.0.1');await new Promise<void>(r=>second.once('listening',r));
    try {assert.equal((await request('/api/admin/session',undefined,cookieHeader,{},`http://127.0.0.1:${(second.address() as any).port}`).then(r=>r.json())).authenticated,true);}finally{await new Promise<void>(r=>second.close(()=>r()));}
    const config=await request('/api/admin/config',undefined,cookieHeader).then(r=>r.json());
    assert.equal((await request('/api/media/upload-mode',undefined,cookieHeader).then(r=>r.json())).provider,'blob');
    const pathname=`uploads/qa-cloud-${Date.now()}.png`;
    const tokenResponse=await request('/api/upload',{type:'blob.generate-client-token',payload:{pathname,multipart:false,clientPayload:null}},cookieHeader);
    assert.equal(tokenResponse.status,200);
    const uploadToken=(await tokenResponse.json()).clientToken;
    const blob=await clientPut(pathname,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64'),{access:'public',contentType:'image/png',token:uploadToken});
    try {
      const media=await request('/api/media',undefined,cookieHeader).then(r=>r.json());
      assert.equal(media.assets.filter((r:any)=>r.source==='portfolio').length,102);
      assert.equal(media.assets.some((r:any)=>r.src===blob.url&&r.source==='upload'),true);
    }finally{await del(blob.url);}
    config.hero.title='Persisted cloud title';
    assert.equal((await request('/api/config',config,cookieHeader,{'origin':'https://evil.example'})).status,403);
    assert.equal((await request('/api/config',config,cookieHeader)).status,200);
    assert.equal((await request('/api/config',config,cookieHeader)).status,409);
    assert.equal((await request('/api/config').then(r=>r.json())).hero.title,'Persisted cloud title');
    assert.equal((await request('/api/quote/estimate',{serviceId:'unknown',quantity:1})).status,503);
    const next=await request('/api/admin/config',undefined,cookieHeader).then(r=>r.json());
    next.quoteAssistant={enabled:true,services:[{id:'signs',title:'Signs',enabled:true,basis:'item',rate:10,minimumCharge:0,packageQuantity:1,requiredDetails:[],allowedMaterials:['vinyl']}],messages:{}};
    assert.equal((await request('/api/config',next,cookieHeader)).status,200);
    const estimate=await request('/api/quote/estimate',{serviceId:'signs',quantity:3,rate:1,approved:true}).then(r=>r.json());
    assert.equal(estimate.amount,30);assert.equal(estimate.requiresStaffApproval,true);
    const handoff=await request('/api/quote/estimate',{serviceId:'signs',quantity:3,material:'unknown'}).then(r=>r.json());assert.equal(handoff.status,'handoff');assert.equal(handoff.amount,undefined);
    const publicConfig=await request('/api/config').then(r=>r.json());assert.deepEqual(publicConfig.quoteAssistant.services,[]);assert.equal(publicConfig._revision,undefined);
    for(let i=0;i<5;i++)assert.equal((await request('/api/admin/login',{password:'incorrect'},undefined,{'x-vercel-forwarded-for':'192.0.2.11'})).status,401);
    assert.equal((await request('/api/admin/login',{password},undefined,{'x-vercel-forwarded-for':'192.0.2.11'})).status,429);
    assert.equal((await request('/api/admin/logout',{},cookieHeader)).status,200);
    assert.equal((await request('/api/admin/config',undefined,cookieHeader)).status,401);
    assert.equal((await store.credential()).bootstrap_hash,null);
  }finally{
    await new Promise<void>(r=>server.close(()=>r()));
    await store.query(`TRUNCATE __SCHEMA__.config, __SCHEMA__.admin, __SCHEMA__.sessions, __SCHEMA__.limits`);
    await store.pool.end();
  }
});
