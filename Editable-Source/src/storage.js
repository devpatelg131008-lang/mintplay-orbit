(function(root){
'use strict';
const KEY='mint-play-timber-strike-v1';const oldMap={lime:'ash',peach:'reed',sherbet:'greatsword',blossom:'dagger',ion:'rapier',siege:'cleaver'};
const valid=id=>!!TimberCore.byId[id];
function clean(p){return {best:Math.max(0,Math.floor(Number(p?.best)||0)),equipped:valid(p?.equipped)?p.equipped:'ash',legacy:Array.isArray(p?.legacy)?p.legacy.filter(valid):[]};}
function initial(){try{const now=localStorage.getItem(KEY);if(now)return clean(JSON.parse(now));const old=JSON.parse(localStorage.getItem('mint-play-orbit-space-v2')||'null');return clean({legacy:(old?.owned||[]).map(id=>oldMap[id]).filter(valid),equipped:oldMap[old?.equipped]});}catch{return clean({});}}
class Progress{
 constructor(){this.value=initial();this.db=null;this.queue=Promise.resolve();this.onchange=()=>{};this.persistent=true;this.channel=null;try{this.channel=new BroadcastChannel(KEY);this.channel.onmessage=()=>this.refresh();}catch{}window.addEventListener('storage',e=>{if(e.key===KEY)this.refresh();});}
 async open(){try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open(KEY,1);r.onupgradeneeded=()=>r.result.createObjectStore('progress');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('blocked'));});const saved=await this.read();if(saved)this.value=clean(saved);else await this.save({best:this.value.best,equipped:this.value.equipped,legacy:this.value.legacy});}catch{try{localStorage.setItem(KEY,JSON.stringify(this.value));}catch{this.persistent=false;}}return this.value;}
 read(){return new Promise((resolve,reject)=>{const t=this.db.transaction('progress','readonly');const r=t.objectStore('progress').get('player');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 unlocked(id){const w=TimberCore.byId[id];return !!w&&(this.value.best>=w.unlock||this.value.legacy.includes(id));}
 merge(current,patch){const p=clean(current);if(patch.best!==undefined)p.best=Math.max(p.best,patch.best);if(patch.legacy)p.legacy=[...new Set([...p.legacy,...patch.legacy])];if(valid(patch.equipped)&&(TimberCore.byId[patch.equipped].unlock<=p.best||p.legacy.includes(patch.equipped)))p.equipped=patch.equipped;return p;}
 save(patch){this.value=this.merge(this.value,patch);this.onchange(this.value);this.queue=this.queue.catch(()=>{}).then(async()=>{let latest=this.value;
  if(this.db){try{latest=await new Promise((resolve,reject)=>{const t=this.db.transaction('progress','readwrite'),s=t.objectStore('progress'),r=s.get('player');r.onsuccess=()=>{latest=this.merge(r.result||this.value,patch);s.put(latest,'player');};t.oncomplete=()=>resolve(latest);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}catch{this.db=null;}}
  if(!this.db){try{latest=this.merge(JSON.parse(localStorage.getItem(KEY)||'null')||this.value,patch);}catch{}}
  // Keep in-memory progress monotonic when several hit saves are queued.
  this.value={...latest,best:Math.max(latest.best,this.value.best)};
  try{localStorage.setItem(KEY,JSON.stringify(this.value));}catch{if(!this.db)this.persistent=false;}
  this.channel?.postMessage('saved');return this.value;
 });return this.queue;}
 async refresh(){try{const p=this.db?await this.read():JSON.parse(localStorage.getItem(KEY)||'null');if(p){this.value=this.merge(p,{best:this.value.best});this.onchange(this.value);}}catch{}}
}
root.TimberProgress=Progress;
})(globalThis);
