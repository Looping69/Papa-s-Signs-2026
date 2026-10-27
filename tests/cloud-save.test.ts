import test from 'node:test';
import assert from 'node:assert/strict';
import { saveConfig, type SiteConfig } from '../services/configService';
test('cloud save returns the new revision without mutating the submitted React snapshot',async()=>{
  const originalFetch=globalThis.fetch;
  const originalWindow=globalThis.window;
  Object.assign(globalThis,{window:new EventTarget()});
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,revision:2}),{headers:{'content-type':'application/json'}});
  const config={_revision:1,hero:{title:'Original',subtitle:'',description:'',backgroundImage:''},stats:[],gallery:[],services:[]} as SiteConfig;
  try {assert.equal(await saveConfig(config),2);assert.equal(config._revision,1);}
  finally{globalThis.fetch=originalFetch;Object.assign(globalThis,{window:originalWindow});}
});
