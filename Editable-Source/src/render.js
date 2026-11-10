(function(root){
'use strict';
const {byId,clamp}=TimberCore;
function path(ctx,points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
function weapon(ctx,id,scale=TimberCore.WEAPON_SCALE){
 const w=byId[id]||byId.ash,l=w.length,a=w.width/2;
 ctx.save();ctx.scale(scale,scale);ctx.lineJoin='round';path(ctx,w.polygon);ctx.fillStyle=w.metal;ctx.strokeStyle='#3c3125';ctx.lineWidth=.012;ctx.fill();ctx.stroke();ctx.save();path(ctx,w.polygon);ctx.clip();
 const grad=ctx.createLinearGradient(-a,0,a,0);grad.addColorStop(0,'#63766d');grad.addColorStop(.46,w.metal);grad.addColorStop(.5,'#f3f5d9');grad.addColorStop(.66,w.metal);grad.addColorStop(1,'#8d9e94');ctx.fillStyle=grad;ctx.fillRect(-a*2,-.01,a*4,l);
 if(w.kind==='arrow'||w.kind==='broadhead'){
  ctx.fillStyle=w.wood;ctx.fillRect(-.019,.125,.038,l);ctx.fillStyle='#edc98e';ctx.fillRect(-.012,.15,.007,l*.64);
  ctx.fillStyle=w.accent;ctx.fillRect(-a,l*.76,a*2,l*.25);ctx.strokeStyle='#e3d5ae';ctx.lineWidth=.007;for(let i=0;i<4;i++){let y=l*(.8+i*.045);ctx.beginPath();ctx.moveTo(-a,y);ctx.lineTo(0,y+.035);ctx.lineTo(a,y);ctx.stroke();}ctx.fillStyle=w.wood;ctx.fillRect(-.01,l*.73,.02,l*.28);
 }else{
  ctx.fillStyle=w.wood;ctx.fillRect(-a*.65,l*.73,a*1.3,l*.29);ctx.strokeStyle='#d0a16b';ctx.lineWidth=.009;for(let i=0;i<4;i++){let y=l*(.77+i*.045);ctx.beginPath();ctx.moveTo(-a*.7,y);ctx.lineTo(a*.7,y+.016);ctx.stroke();}
  ctx.fillStyle=w.accent;ctx.fillRect(-a*3.5,l*.65,a*7,l*.085);ctx.fillRect(-a,l*.96,a*2,l*.04);
  if(w.kind==='cleaver'){ctx.fillStyle='#606c60';ctx.beginPath();ctx.arc(a*.45,l*.15,.018,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#f8f6df';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(.005,.055);ctx.lineTo(.005,l*.61);ctx.stroke();
 }
 ctx.restore();ctx.restore();
}
function weaponIcon(id){const c=document.createElement('canvas');c.width=168;c.height=220;const x=c.getContext('2d');const w=byId[id];x.translate(84,18);weapon(x,id,182/Math.max(1,w.length));return c.toDataURL();}
function decode(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
async function loadLogs(src){
 const image=await decode(src),out=[];const cellW=image.width/3,cellH=image.height/2;
 for(let i=0;i<6;i++){
  const cell=document.createElement('canvas');cell.width=cellW;cell.height=cellH;const cx=cell.getContext('2d',{willReadFrequently:true});cx.drawImage(image,(i%3)*cellW,Math.floor(i/3)*cellH,cellW,cellH,0,0,cellW,cellH);
  const a=cx.getImageData(0,0,cellW,cellH).data;let left=cellW,right=0,top=cellH,bottom=0;for(let y=0;y<cellH;y++)for(let x=0;x<cellW;x++){if(a[(y*cellW+x)*4+3]>45){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
  const size=Math.max(right-left+1,bottom-top+1),c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.drawImage(cell,left-(size-(right-left+1))/2,top-(size-(bottom-top+1))/2,size,size,0,0,512,512);out.push(c);
 }
 return out;
}
function face(ctx,mood='smile',age=0,variant=0,tilt=0){
 ctx.save();ctx.rotate(tilt);ctx.translate(0,.035);const reaction=mood!=='smile';const squish=reaction?Math.sin(Math.min(1,age/.24)*Math.PI)*.045:0;ctx.scale(1+squish,1-squish);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#482c21';ctx.fillStyle='#482c21';ctx.lineWidth=.038;
 // Tiny highlights and dark ink-like features sit inside the wooden rings.
 const blink=!reaction&&Math.sin(age*1.05+variant*.71)>.996;
 for(const side of [-1,1]){const x=side*.19;
  if(mood==='wince'){ctx.beginPath();ctx.moveTo(x-.045,-.15);ctx.lineTo(x+.045,-.06);ctx.moveTo(x+.045,-.15);ctx.lineTo(x-.045,-.06);ctx.stroke();}
  else if(blink){ctx.beginPath();ctx.moveTo(x-.042,-.085);ctx.quadraticCurveTo(x,-.06,x+.042,-.085);ctx.stroke();}
  else{ctx.beginPath();ctx.ellipse(x,-.105,.038,mood==='surprise'?.078:.056,side*-.08,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f8e0af';ctx.beginPath();ctx.arc(x-.009,-.126,.011,0,Math.PI*2);ctx.fill();ctx.fillStyle='#482c21';}
  ctx.lineWidth=.022;ctx.beginPath();const by=mood==='surprise'?-.25:-.218;ctx.moveTo(x-.06,by+.018);ctx.quadraticCurveTo(x,by-.02,x+.06,by+.01);ctx.stroke();ctx.lineWidth=.038;
 }
 if(mood==='surprise'){ctx.beginPath();ctx.ellipse(0,.115,.065,.088,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bc6d46';ctx.beginPath();ctx.ellipse(0,.15,.035,.017,0,0,Math.PI*2);ctx.fill();}
 else if(mood==='wince'){ctx.beginPath();ctx.moveTo(-.105,.15);ctx.quadraticCurveTo(0,.055,.105,.15);ctx.stroke();}
 else{ctx.beginPath();ctx.moveTo(-.11,.085);ctx.bezierCurveTo(-.085,.2,.085,.2,.11,.085);ctx.stroke();}
 ctx.restore();
}
function leaf(ctx,p,time){
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.scale(Math.cos(time*2.2+p.phase)*.32+.68,1);const r=p.size;ctx.fillStyle=['#a9b56c','#d5a552','#b8673c','#6f8853'][p.tone];ctx.strokeStyle='#493d2277';ctx.lineWidth=.7;
 ctx.beginPath();ctx.moveTo(0,-r*.7);ctx.bezierCurveTo(r*.65,-r*.3,r*.5,r*.44,0,r*.65);ctx.bezierCurveTo(-r*.6,r*.3,-r*.48,-r*.28,0,-r*.7);ctx.fill();ctx.stroke();ctx.strokeStyle='#f3db9f77';ctx.beginPath();ctx.moveTo(0,-r*.52);ctx.lineTo(0,r*.76);ctx.moveTo(0,0);ctx.lineTo(r*.25,-r*.16);ctx.moveTo(0,r*.22);ctx.lineTo(-r*.25,0);ctx.stroke();ctx.restore();
}
class Renderer{
 constructor(canvas,sprites){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.sprites=sprites;this.width=0;this.height=0;this.r=100;this.cx=0;this.cy=0;this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;this.dust=Array.from({length:18},(_,i)=>({x:(i*.6180339887)%1,y:(i*.38196601+.13)%1,p:i*1.6,s:.6+(i%3)*.3}));this.resize();}
 resize(){const b=this.canvas.getBoundingClientRect();this.width=b.width;this.height=b.height;const d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(b.width*d);this.canvas.height=Math.round(b.height*d);this.ctx.setTransform(d,0,0,d,0,0);this.r=Math.min(b.width*.29,b.height*.205,182);this.cx=b.width/2;this.cy=b.height*.445;this.launch=Math.max(1.55,(b.height-this.cy-(b.height<650?48:65))/this.r-.816);}
 draw(game,screen,now){const ctx=this.ctx,{width:w,height:h,r,cx,cy}=this;ctx.clearRect(0,0,w,h);const time=game.elapsed;
  if(!this.reduce){ctx.save();for(const d of this.dust){const x=d.x*w+Math.sin(time*.17+d.p)*9,y=d.y*h+Math.cos(time*.13+d.p)*7;ctx.globalAlpha=.13+.06*Math.sin(time*.5+d.p);ctx.fillStyle='#ffe7aa';ctx.beginPath();ctx.ellipse(x,y,d.s,d.s*.75,0,0,7);ctx.fill();}ctx.restore();}
  if(screen==='workshop')return;
  game.leaves.forEach((p,i)=>{if(this.reduce&&i>5)return;leaf(ctx,{...p,x:p.x*w+Math.sin(p.age*1.6+p.phase)*(this.reduce?3:20),y:p.y*h,a:this.reduce?p.phase:p.a},p.age);});
  ctx.save();ctx.translate(cx,cy);ctx.scale(r,r);
  let entryY=0;if(game.mode==='entering'){const t=clamp(game.transition/.5,0,1);entryY=-5.2*Math.pow(1-t,3);}
  if(game.mode!=='breaking'){
   ctx.save();ctx.translate(0,entryY+(this.reduce?0:game.recoil));
   ctx.save();ctx.translate(0,.065);const shade=ctx.createRadialGradient(0,0,.2,0,0,1.15);shade.addColorStop(0,'#2a120e77');shade.addColorStop(1,'#2a120e00');ctx.fillStyle=shade;ctx.beginPath();ctx.arc(0,0,1.15,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.save();ctx.rotate(game.angle);for(const p of game.embedded)this.pin(ctx,p);ctx.drawImage(this.sprites[game.log],-1,-1,2,2);ctx.restore();
   face(ctx,game.mode==='lost'?'wince':game.reaction>0?game.mood:'smile',game.reaction>0?game.reaction:time,game.log,this.reduce?0:Math.sin(time*.7)*.018);ctx.restore();
  }
  for(const f of game.fragments){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.translate(-f.seed.x,-f.seed.y);ctx.save();ctx.translate(.022,.035);path(ctx,f.poly);ctx.fillStyle='#59351f';ctx.fill();ctx.restore();for(const p of f.pins)this.pin(ctx,p);ctx.save();path(ctx,f.poly);ctx.clip();ctx.drawImage(this.sprites[f.log],-1,-1,2,2);ctx.rotate(-f.sourceAngle);face(ctx,'surprise',.15,f.log);ctx.restore();ctx.restore();}
  for(const p of game.chips){ctx.save();ctx.globalAlpha=Math.min(1,(p.life-p.age)*5);ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle=p.metal?'#e9e8cd':(p.size>.03?'#e0a457':'#80502d');ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*.65);ctx.restore();}
  for(const f of game.falling){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);weapon(ctx,f.id);ctx.restore();}
  for(const s of game.shots){ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=.10;ctx.translate(0,.14);weapon(ctx,s.id);ctx.restore();ctx.save();ctx.translate(s.x,s.y);weapon(ctx,s.id);ctx.restore();}
  if(game.mode==='playing'||game.mode==='ready'||game.mode==='entering'){
   const y=this.launch+(this.reduce?0:Math.sin(time*1.7)*.009);ctx.save();ctx.translate(0,y);if(game.throwAge<.09){ctx.globalAlpha=.42+.58*Math.min(1,game.throwAge/.09);ctx.translate(0,.06*(1-game.throwAge/.09));}weapon(ctx,game.weapon);ctx.restore();
   if(game.mode==='ready'){ctx.strokeStyle='#f2d19544';ctx.lineWidth=.01;ctx.setLineDash([.018,.08]);ctx.beginPath();ctx.moveTo(0,1.17);ctx.lineTo(0,y-.15);ctx.stroke();ctx.setLineDash([]);}
  }
  ctx.restore();
 }
 pin(ctx,p){ctx.save();ctx.rotate(p.a-Math.PI/2);ctx.translate(0,TimberCore.pinRadius(p));weapon(ctx,p.id);ctx.restore();}
}
root.TimberRender={Renderer,loadLogs,weaponIcon,weapon,face};
})(globalThis);
