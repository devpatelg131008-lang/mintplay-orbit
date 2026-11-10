/* Timber Strike — deterministic, renderer-independent game rules. */
(function (root) {
'use strict';
const TAU = Math.PI * 2;
const weapons = [
 {id:'ash',name:'Ash Arrow',unlock:0,length:.79,width:.10,kind:'arrow',wood:'#ba7837',accent:'#b74d39',metal:'#cfddd5'},
 {id:'reed',name:'Reed Arrow',unlock:5,length:.91,width:.065,kind:'arrow',wood:'#c8a360',accent:'#7e9d69',metal:'#c9dfdd'},
 {id:'broadhead',name:'Broadhead',unlock:12,length:.78,width:.155,kind:'broadhead',wood:'#98622f',accent:'#d79944',metal:'#d7d5bd'},
 {id:'knife',name:'Scout Knife',unlock:20,length:.62,width:.12,kind:'knife',wood:'#79513a',accent:'#b45037',metal:'#ced8d4'},
 {id:'dagger',name:'Oak Dagger',unlock:30,length:.72,width:.14,kind:'dagger',wood:'#8d5230',accent:'#bb914d',metal:'#c6dbd8'},
 {id:'rapier',name:'Willow Rapier',unlock:45,length:.96,width:.062,kind:'rapier',wood:'#665647',accent:'#d8b66d',metal:'#deebe5'},
 {id:'sabre',name:'Cedar Sabre',unlock:60,length:.87,width:.13,kind:'sabre',wood:'#884b35',accent:'#d8a257',metal:'#d5ded1'},
 {id:'cleaver',name:'Iron Cleaver',unlock:80,length:.66,width:.215,kind:'cleaver',wood:'#8f5634',accent:'#b3874f',metal:'#9eada3'},
 {id:'sword',name:'Forest Sword',unlock:100,length:.94,width:.17,kind:'sword',wood:'#796345',accent:'#7b9c73',metal:'#d3dfd5'},
 {id:'greatsword',name:'Timber Blade',unlock:130,length:1.02,width:.21,kind:'greatsword',wood:'#78432b',accent:'#dca95b',metal:'#c3d0c9'}
];
const byId = Object.fromEntries(weapons.map(w=>[w.id,w]));
const logs = ['Golden Oak','Silver Birch','Red Cedar','Walnut','Amber Pine','Mossy Ash','Honey Maple','Cherry','Olive','Driftwood','Mahogany','Golden Elm'];
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
function random(seed) { let n=seed>>>0; return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
function rotate(p,a) {const c=Math.cos(a),s=Math.sin(a);return {x:p.x*c-p.y*s,y:p.x*s+p.y*c};}
function outline(w) {
 const a=w.width/2, l=w.length;
 if(w.kind==='arrow'||w.kind==='broadhead') return [[0,0],[a,.15],[.019,.125],[.019,l*.73],[a*.8,l*.8],[a*.8,l],[0,l*.94],[-a*.8,l],[-a*.8,l*.8],[-.019,l*.73],[-.019,.125],[-a,.15]];
 if(w.kind==='knife') return [[0,0],[a*.9,.13],[a*.6,l*.65],[a*1.25,l*.67],[a*1.25,l*.72],[a*.6,l*.73],[a*.6,l],[-a*.6,l],[-a*.6,l*.73],[-a,l*.72],[-a,l*.67],[-a*.65,l*.65],[-a*.7,.16]];
 if(w.kind==='sabre') return [[a*.8,0],[a*1.4,.12],[a*.7,l*.52],[a*.1,l*.7],[a*1.7,l*.71],[a*1.7,l*.76],[a*.35,l*.77],[a*.1,l],[-a*.8,l],[-a*.6,l*.77],[-a*1.4,l*.75],[-a*1.4,l*.7],[-a*.6,l*.68],[-a*.25,l*.5],[-a*.2,.2]];
 if(w.kind==='cleaver') return [[-a*.5,0],[a,.035],[a,l*.62],[a*.5,l*.7],[a*.4,l],[-a*.4,l],[-a*.4,l*.7],[-a,l*.63],[-a,.05]];
 const guard=w.kind==='rapier'?3.2:1.8;
 return [[0,0],[a,l*.17],[a*.8,l*.65],[a*guard,l*.66],[a*guard,l*.72],[a*.5,l*.74],[a*.5,l*.95],[a*.8,l*.97],[a*.8,l],[ -a*.8,l],[-a*.8,l*.97],[-a*.5,l*.95],[-a*.5,l*.74],[-a*guard,l*.72],[-a*guard,l*.66],[-a*.8,l*.65],[-a,l*.17]];
}
weapons.forEach(w=>w.polygon=outline(w).map(([x,y])=>({x,y})));
function transform(poly,x,y,a=0) {const c=Math.cos(a),s=Math.sin(a);return poly.map(p=>({x:x+p.x*c-p.y*s,y:y+p.x*s+p.y*c}));}
function box(poly) {let l=Infinity,r=-Infinity,t=Infinity,b=-Infinity;for(const p of poly){l=Math.min(l,p.x);r=Math.max(r,p.x);t=Math.min(t,p.y);b=Math.max(b,p.y);}return {l,r,t,b};}
function inside(p,poly) {let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))hit=!hit;}return hit;}
function cross(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
function intersect(a,b,c,d){const p=cross(a,b,c),q=cross(a,b,d),r=cross(c,d,a),s=cross(c,d,b);return ((p>0)!==(q>0))&&((r>0)!==(s>0));}
function polygonsTouch(a,b) {
 const u=box(a),v=box(b);if(u.r<v.l||u.l>v.r||u.b<v.t||u.t>v.b)return false;
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)if(intersect(a[i],a[(i+1)%a.length],b[j],b[(j+1)%b.length]))return true;
 return inside(a[0],b)||inside(b[0],a);
}
function clip(poly,nx,ny,c) {
 const result=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a.x*nx+a.y*ny-c,db=b.x*nx+b.y*ny-c;
 if(da<=1e-8)result.push(a);if((da<0)!==(db<0)){const t=da/(da-db);result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}
 return result;
}
function fracture(rng,count=9) {
 const seeds=[{x:(rng()-.5)*.3,y:(rng()-.5)*.3}];
 for(let i=1;i<count;i++){const a=(i-1)/(count-1)*TAU+(rng()-.5)*.45,r=.45+rng()*.36;seeds.push({x:Math.cos(a)*r,y:Math.sin(a)*r});}
 const rim=Array.from({length:72},(_,i)=>({x:Math.cos(i/72*TAU)*1.03,y:Math.sin(i/72*TAU)*1.03}));
 return seeds.map((seed,i)=>{let poly=rim;for(let j=0;j<seeds.length;j++){if(i===j)continue;const q=seeds[j];poly=clip(poly,q.x-seed.x,q.y-seed.y,(q.x*q.x+q.y*q.y-seed.x*seed.x-seed.y*seed.y)/2);}return {seed,poly};});
}
const WEAPON_SCALE=.8;
const weaponLength=id=>byId[id].length*WEAPON_SCALE;
const embedRadius=id=>1-weaponLength(id)*.25;
const pinRadius=pin=>1-(1-embedRadius(pin.id))*Math.min(1,pin.age/.045);
weapons.forEach(w=>{w.gamePolygon=w.polygon.map(p=>({x:p.x*WEAPON_SCALE,y:p.y*WEAPON_SCALE}));w.exposedPolygon=clip(w.gamePolygon,0,-1,-weaponLength(w.id)*.25);});
class Game {
 constructor(seed=Date.now()) {
  this.rng=random(seed);this.visualRng=random(seed^0x479ac21);this.mode='ready';this.level=1;this.score=0;this.lives=3;this.weapon='ash';this.angle=0;this.elapsed=0;this.remaining=7;this.total=7;this.log=0;this.logDeck=[];this.embedded=[];this.chips=[];this.fragments=[];this.falling=[];this.leaves=[];this.events=[];this.shots=[];this.recoil=0;this.recoilV=0;this.transition=0;this.revived=false;this.launchY=2.7;this.rotationEnabled=true;this.reaction=0;this.mood='smile';this.throwAge=99;this.omega=1;this.shotCount=0;
 }
 emit(type,data={}){this.events.push({type,...data});}
 drain(){const out=this.events;this.events=[];return out;}
 start(weapon='ash'){
  this.mode='playing';this.weapon=byId[weapon]?weapon:'ash';this.level=1;this.score=0;this.lives=3;this.angle=0;this.elapsed=0;this.revived=false;this.fragments=[];this.chips=[];this.falling=[];this.leaves=[];this.shots=[];this.events=[];this.recoil=0;this.recoilV=0;this.reaction=0;this.throwAge=99;this.logDeck=[];this.shotCount=0;this.setupLevel(true);this.emit('start');
 }
 nextLog(){
  if(!this.logDeck.length){this.logDeck=Array.from({length:logs.length},(_,i)=>i);for(let i=this.logDeck.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[this.logDeck[i],this.logDeck[j]]=[this.logDeck[j],this.logDeck[i]];}if(this.logDeck[this.logDeck.length-1]===this.log)[this.logDeck[0],this.logDeck[this.logDeck.length-1]]=[this.logDeck[this.logDeck.length-1],this.logDeck[0]];}
  return this.logDeck.pop();
 }
 setupLevel(first=false){
  this.total=Math.min(12,7+Math.floor((this.level-1)/3));this.remaining=this.total;this.embedded=[];this.shots=[];this.phase=this.rng()*TAU;this.direction=this.rng()>.5?1:-1;this.levelAge=0;this.reaction=0;this.mood='smile';
  if(first){this.log=0;this.logDeck=Array.from({length:logs.length-1},(_,i)=>i+1);for(let i=this.logDeck.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[this.logDeck[i],this.logDeck[j]]=[this.logDeck[j],this.logDeck[i]];}}
  else this.log=this.nextLog();
  this.omega=this.targetSpeed();this.nextTurn=this.turnInterval();
  const blocked=Math.min(4,Math.floor((this.level-1)/4));for(let i=0;i<blocked;i++)this.embedded.push({a:i*TAU/blocked+this.rng()*.4,id:'ash',age:100});
  this.emit('level',{level:this.level});
 }
 turnInterval(){return this.level>=15?1.05+this.rng()*1.3:1.8+this.rng()*1.5;}
 targetSpeed(){const base=.98+Math.min(this.level-1,35)*.048;let m=1+.11*Math.sin(this.levelAge*1.7+this.phase);if(this.level>=5)m+=.19*Math.sin(this.levelAge*.77+this.phase);return base*m*this.direction;}
 speed(){return this.omega;}
 shoot(){
  if(this.mode!=='playing')return false;
  // Every pointer-down gets its own projectile. No cooldown, queue, or single-shot gate.
  const shot={x:0,y:Math.max(1.55,this.launchY),v:-24,id:this.weapon,serial:++this.shotCount,resolved:false};
  this.shots.push(shot);this.throwAge=0;this.emit('throw',{serial:shot.serial});return true;
 }
 hit(s){
  if(!s||s.resolved||this.mode!=='playing')return;s.resolved=true;
  this.embedded.push({a:Math.PI/2-this.angle,id:s.id,age:0});this.score++;this.remaining--;this.recoilV=-.62;this.reaction=.24;this.mood='surprise';this.splinters(0,.99,10,false);this.emit('hit',{score:this.score});
  if(this.remaining===0)this.breakLog();
 }
 drop(s,violent=true){this.falling.push({x:s.x,y:s.y,a:0,vx:(this.visualRng()-.5)*(violent?3.4:1.2),vy:violent?1.8:-.6,spin:(this.visualRng()>.5?1:-1)*(3+this.visualRng()*4),id:s.id,age:0});}
 miss(s){
  if(!s||s.resolved||this.mode!=='playing')return;s.resolved=true;this.drop(s);this.splinters(0,s.y,12,true);this.lives=Math.max(0,this.lives-1);this.reaction=.35;this.mood='wince';this.emit('collision',{lives:this.lives});
  if(!this.lives){this.mode='lost';this.shots.forEach(p=>{if(!p.resolved){p.resolved=true;this.drop(p,false);}});this.emit('lost',{score:this.score});}
 }
 revive(){if(this.mode!=='lost'||this.revived)return false;this.revived=true;this.lives=1;this.shots=[];this.mode='playing';this.reaction=0;this.mood='smile';this.emit('revive');return true;}
 splinters(x,y,n,metal){const rng=this.visualRng;for(let i=0;i<n;i++)this.chips.push({x,y,vx:(rng()-.5)*(metal?4:2.5),vy:.25+rng()*2,a:rng()*TAU,spin:(rng()-.5)*14,size:.014+rng()*.02,age:0,life:.6+rng()*.45,metal});if(this.chips.length>100)this.chips.splice(0,this.chips.length-100);}
 celebrate(){
  const rng=this.visualRng;this.leaves=Array.from({length:28},()=>({x:rng(),y:-.12-rng()*.85,vx:(rng()-.5)*.045,vy:.13+rng()*.09,a:rng()*TAU,spin:(rng()-.5)*2.4,phase:rng()*TAU,size:12+rng()*12,tone:Math.floor(rng()*4),age:0}));this.emit('milestone',{level:this.level});
 }
 breakLog(){
  this.mode='breaking';this.transition=0;const cells=fracture(this.rng,8+Math.floor(this.rng()*4));
  this.fragments=cells.map(c=>{const p=rotate(c.seed,this.angle);return {...c,x:p.x,y:p.y,a:this.angle,sourceAngle:this.angle,vx:p.x*(1.3+this.rng()*.8),vy:p.y*.6-1.4-this.rng()*.8,spin:(this.rng()-.5)*5,age:0,log:this.log,pins:[]};});
  for(const pin of this.embedded){const rr=embedRadius(pin.id);const p={x:Math.cos(pin.a)*rr,y:Math.sin(pin.a)*rr};let nearest=0,d=Infinity;cells.forEach((c,i)=>{const q=(c.seed.x-p.x)**2+(c.seed.y-p.y)**2;if(q<d){nearest=i;d=q;}});this.fragments[nearest].pins.push({...pin,age:10});}
  this.shots.forEach(s=>{if(!s.resolved){s.resolved=true;this.drop(s,false);}});this.embedded=[];for(let i=0;i<25;i++)this.splinters((this.rng()-.5)*1.5,(this.rng()-.5)*1.5,1,false);this.emit('break');if(this.level%10===0)this.celebrate();
 }
 step(dt){
  dt=clamp(dt,0,.04);this.elapsed+=dt;this.throwAge+=dt;this.reaction=Math.max(0,this.reaction-dt);
  this.recoilV+=(-210*this.recoil-22*this.recoilV)*dt;this.recoil+=this.recoilV*dt;
  for(const p of this.chips){p.age+=dt;p.vy+=4.4*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=p.spin*dt;}this.chips=this.chips.filter(p=>p.age<p.life);
  for(const f of this.falling){f.age+=dt;f.vy+=5.3*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.a+=f.spin*dt;}this.falling=this.falling.filter(f=>f.age<2.3);
  for(const f of this.fragments){f.age+=dt;f.vy+=5.8*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.a+=f.spin*dt;}this.fragments=this.fragments.filter(f=>f.age<3.4);
  for(const leaf of this.leaves){leaf.age+=dt;leaf.vy+=.014*dt;leaf.x+=leaf.vx*dt;leaf.y+=leaf.vy*dt;leaf.a+=leaf.spin*dt;}this.leaves=this.leaves.filter(p=>p.y<1.15&&p.age<10);
  if(this.mode==='ready'){this.angle+=dt*.19;return;}if(this.mode==='lost')return;
  if(this.mode==='breaking'){this.transition+=dt;if(this.transition>=1.25){this.level++;this.setupLevel();this.mode='entering';this.transition=0;}return;}
  if(this.mode==='entering'){this.transition+=dt;if(this.transition>=.5)this.mode='playing';return;}
  this.levelAge+=dt;
  if(this.level>=10&&this.levelAge>=this.nextTurn){this.direction*=-1;this.nextTurn=this.levelAge+this.turnInterval();this.emit('turn');}
  this.omega+=(this.targetSpeed()-this.omega)*(1-Math.exp(-28*dt));
  // Substeps prevent a fast shot tunnelling through a thin arrow shaft.
  const maxV=this.shots.reduce((v,s)=>Math.max(v,Math.abs(s.v)),0);
  const steps=Math.max(1,Math.ceil((maxV+55*dt)*dt/.026)),h=dt/steps;
  for(let k=0;k<steps;k++){
   this.angle=(this.angle+(this.rotationEnabled?this.omega:0)*h)%TAU;for(const p of this.embedded)p.age+=h;
   for(const s of this.shots){
    if(s.resolved)continue;s.v-=55*h;s.y+=s.v*h;
    const poly=transform(byId[s.id].gamePolygon,s.x,s.y);let collision=false;
    for(const pin of this.embedded){const a=pin.a+this.angle,rr=pinRadius(pin),px=Math.cos(a)*rr,py=Math.sin(a)*rr+this.recoil;
     if(py<-.1)continue;
     const exposed=pin.age>=.045?byId[pin.id].exposedPolygon:clip(byId[pin.id].gamePolygon,0,-1,-(1-rr));
     if(polygonsTouch(poly,transform(exposed,px,py,a-Math.PI/2))){collision=true;break;}
    }
    if(collision)this.miss(s);else if(s.y<=1+this.recoil)this.hit(s);
    if(this.mode!=='playing')break;
   }
   if(this.mode!=='playing')break;
  }
  this.shots=this.shots.filter(s=>!s.resolved);
 }
}
const api={WEAPON_SCALE,weaponLength,embedRadius,pinRadius,Game,weapons,byId,logs,random,fracture,polygonsTouch,transform,inside,rotate,TAU,clamp};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TimberCore=api;
})(globalThis);
