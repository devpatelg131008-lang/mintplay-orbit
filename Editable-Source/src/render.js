(function(root){
'use strict';
const {byId,clamp}=TimberCore;
function path(ctx,points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
function weapon(ctx,id,scale=1){
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
class Renderer{
 constructor(canvas,sprites){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.sprites=sprites;this.width=0;this.height=0;this.r=100;this.cx=0;this.cy=0;this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;this.dust=Array.from({length:18},(_,i)=>({x:(i*.6180339887)%1,y:(i*.38196601+.13)%1,p:i*1.6,s:.6+(i%3)*.3}));this.resize();}
 resize(){const b=this.canvas.getBoundingClientRect();this.width=b.width;this.height=b.height;const d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(b.width*d);this.canvas.height=Math.round(b.height*d);this.ctx.setTransform(d,0,0,d,0,0);this.r=Math.min(b.width*.235,b.height*.18,148);this.cx=b.width/2;this.cy=b.height*.43;this.launch=Math.max(1.85,(b.height-this.cy-65)/this.r-1.02);}
 draw(game,screen,now){const ctx=this.ctx,{width:w,height:h,r,cx,cy}=this;ctx.clearRect(0,0,w,h);const time=now/1000;
  if(!this.reduce){ctx.save();for(const d of this.dust){const x=d.x*w+Math.sin(time*.17+d.p)*9,y=d.y*h+Math.cos(time*.13+d.p)*7;ctx.globalAlpha=.13+.06*Math.sin(time*.5+d.p);ctx.fillStyle='#ffe7aa';ctx.beginPath();ctx.ellipse(x,y,d.s,d.s*.75,0,0,7);ctx.fill();}ctx.restore();}
  if(screen==='workshop')return;
  ctx.save();ctx.translate(cx,cy);ctx.scale(r,r);
  let entryY=0;if(game.mode==='entering'){const t=clamp(game.transition/.65,0,1);entryY=-5.2*Math.pow(1-t,3);}
  if(game.mode!=='breaking'){
   ctx.save();ctx.translate(0,entryY+(this.reduce?0:game.recoil));
   ctx.save();ctx.translate(0,.065);const shade=ctx.createRadialGradient(0,0,.2,0,0,1.15);shade.addColorStop(0,'#2a120e77');shade.addColorStop(1,'#2a120e00');ctx.fillStyle=shade;ctx.beginPath();ctx.arc(0,0,1.15,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.save();ctx.rotate(game.angle);for(const p of game.embedded)this.pin(ctx,p);ctx.drawImage(this.sprites[game.log],-1,-1,2,2);ctx.restore();ctx.restore();
  }
  for(const f of game.fragments){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.translate(-f.seed.x,-f.seed.y);ctx.save();ctx.translate(.022,.035);path(ctx,f.poly);ctx.fillStyle='#59351f';ctx.fill();ctx.restore();for(const p of f.pins)this.pin(ctx,p);ctx.save();path(ctx,f.poly);ctx.clip();ctx.drawImage(this.sprites[f.log],-1,-1,2,2);ctx.restore();ctx.restore();}
  for(const p of game.chips){ctx.save();ctx.globalAlpha=Math.min(1,(p.life-p.age)*5);ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle=p.metal?'#e9e8cd':(p.size>.03?'#e0a457':'#80502d');ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*.65);ctx.restore();}
  for(const f of game.falling){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);weapon(ctx,f.id);ctx.restore();}
  if(game.shot){const s=game.shot;ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=.12;weapon(ctx,s.id);ctx.translate(0,.08);ctx.globalAlpha=.06;weapon(ctx,s.id);ctx.restore();ctx.save();ctx.translate(s.x,s.y);weapon(ctx,s.id);ctx.restore();}
  else if(game.mode==='playing'||game.mode==='ready'||game.mode==='entering'){
   const y=this.launch+(this.reduce?0:Math.sin(time*1.7)*.013);ctx.save();ctx.translate(0,y);if(game.cooldown>0)ctx.globalAlpha=.6;weapon(ctx,game.weapon);ctx.restore();
   if(game.mode==='ready'){ctx.strokeStyle='#f2d19544';ctx.lineWidth=.01;ctx.setLineDash([.018,.08]);ctx.beginPath();ctx.moveTo(0,1.2);ctx.lineTo(0,y-.15);ctx.stroke();ctx.setLineDash([]);}
  }
  ctx.restore();
 }
 pin(ctx,p){ctx.save();ctx.rotate(p.a-Math.PI/2);ctx.translate(0,.95);weapon(ctx,p.id);ctx.restore();}
}
root.TimberRender={Renderer,loadLogs,weaponIcon,weapon};
})(globalThis);
