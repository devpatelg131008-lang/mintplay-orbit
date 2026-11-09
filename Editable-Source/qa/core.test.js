'use strict';
const assert=require('node:assert/strict');
const {Game,weapons,fracture,random}=require('../src/core.js');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name);}
function advance(g,time){for(let t=0;t<time;t+=1/120)g.step(1/120);}
function fresh(id='ash'){const g=new Game(1234);g.start(id);g.rotationEnabled=false;advance(g,.2);return g;}
function untilShot(g){for(let i=0;i<300&&g.shot;i++)g.step(1/120);}
test('Every weapon scores exactly one point for a successful throw',()=>{for(const w of weapons){const g=fresh(w.id);assert(g.shoot());untilShot(g);assert.equal(g.score,1,w.id);assert.equal(g.remaining,6);assert.equal(g.lives,3);assert.equal(g.embedded.length,1);}});
test('A weapon collision consumes one heart, never a point',()=>{const g=fresh();g.shoot();untilShot(g);advance(g,.2);g.shoot();untilShot(g);assert.equal(g.lives,2);assert.equal(g.score,1);assert.equal(g.remaining,6);assert.equal(g.falling.length,1);advance(g,.3);assert.equal(g.lives,2);});
test('Fast projectile collides with shaft before reaching wood',()=>{const g=fresh();g.embedded=[{a:Math.PI/2,id:'greatsword',age:1}];g.shoot();g.shot.v=-40;untilShot(g);assert.equal(g.score,0);assert.equal(g.lives,2);assert(g.falling[0].y>1.5);});
test('Spamming fire cannot stack active shots',()=>{const g=fresh();assert.equal(g.shoot(),true);for(let i=0;i<100;i++)assert.equal(g.shoot(),false);untilShot(g);assert.equal(g.score,1);});
test('Collision at zero hearts ends run, revive only works once',()=>{const g=fresh();g.embedded=[{a:Math.PI/2,id:'ash',age:1}];for(let i=0;i<3;i++){advance(g,.6);g.shoot();untilShot(g);}assert.equal(g.mode,'lost');assert.equal(g.lives,0);assert.equal(g.shoot(),false);assert(g.revive());assert.equal(g.lives,1);assert.equal(g.revive(),false);advance(g,.8);g.shoot();untilShot(g);assert.equal(g.mode,'lost');assert.equal(g.revive(),false);});
test('Seven accurate throws break the log and advance without a popup',()=>{const g=fresh();for(let i=0;i<7;i++){g.angle=-i*Math.PI*2/7;advance(g,.2);assert(g.shoot());untilShot(g);}assert.equal(g.mode,'breaking');assert.equal(g.score,7);assert.equal(g.remaining,0);assert(g.fragments.length>=8);const attached=g.fragments.reduce((n,f)=>n+f.pins.length,0);assert.equal(attached,7);advance(g,2.3);assert.equal(g.level,2);assert.equal(g.mode,'playing');assert.equal(g.score,7);assert.notEqual(g.log,0);});
test('Fractures cover the disc without fixed repeated pieces',()=>{const a=fracture(random(3),9),b=fracture(random(4),9);assert.notDeepEqual(a,b);function area(poly){return Math.abs(poly.reduce((n,p,i)=>{const q=poly[(i+1)%poly.length];return n+p.x*q.y-q.x*p.y;},0)/2);}const actual=a.reduce((n,c)=>n+area(c.poly),0),expected=72/2*1.03**2*Math.sin(2*Math.PI/72);assert(Math.abs(actual-expected)<1e-8);assert(a.every(c=>c.poly.length>=3));});
test('Broken pieces fall beyond playfield through gravity',()=>{const g=fresh();g.breakLog();const pieces=g.fragments.slice();advance(g,2);assert(pieces.every(p=>p.y>4));assert(pieces.some(p=>Math.abs(p.x)>1.5));});
test('Idle play has no countdown or automatic loss',()=>{const g=fresh();advance(g,1000);assert.equal(g.mode,'playing');assert.equal(g.score,0);assert.equal(g.lives,3);assert.equal(g.level,1);});
test('Harder levels remain bounded and rotate smoothly',()=>{const g=fresh();for(let level=1;level<=200;level++){g.level=level;g.setupLevel();assert(g.total<=12);assert(g.embedded.length<=4);let previous=g.speed();for(let i=0;i<1200;i++){g.levelAge+=1/120;const speed=g.speed();assert(Math.abs(speed-previous)<.02);previous=speed;}}});
test('A rendered launch position is honored with no first-frame jump',()=>{const g=fresh();g.launchY=3.4;g.shoot();assert.equal(g.shot.y,3.4);g.step(1/120);assert(g.shot.y<3.4&&g.shot.y>3.3);});
console.log(`${passed} gameplay checks passed`);
