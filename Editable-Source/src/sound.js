/* Short original synthesized effects: no downloaded audio or autoplay. */
(function(root){
'use strict';
const KEY='mint-play-timber-sound';
class Sound {
 constructor(){this.ctx=null;this.master=null;this.noise=null;this.available=true;this.enabled=true;this.nodes=new Set();try{this.enabled=localStorage.getItem(KEY)!=='off';}catch{}}
 unlock(){
  if(!this.available||!this.enabled)return;
  try{
   if(!this.ctx){const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio){this.available=false;return;}this.ctx=new Audio({latencyHint:'interactive'});this.master=this.ctx.createGain();this.master.gain.value=.55;const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=16;limiter.ratio.value=8;this.master.connect(limiter);limiter.connect(this.ctx.destination);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const data=this.noise.getChannelData(0);let previous=0;for(let i=0;i<data.length;i++){previous=.58*previous+.42*(Math.random()*2-1);data[i]=previous;}}
   if(this.ctx.state==='suspended'||this.ctx.state==='interrupted')this.ctx.resume().catch(()=>{});
  }catch{this.available=false;}
 }
 toggle(){this.enabled=!this.enabled;try{localStorage.setItem(KEY,this.enabled?'on':'off');}catch{}if(this.enabled)this.unlock();if(this.master)this.master.gain.setTargetAtTime(this.enabled?.55:0,this.ctx.currentTime,.015);if(!this.enabled)this.stop();return this.enabled;}
 stop(){for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();}
 tone(freq,end,duration,volume,type='sine',delay=0){
  if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
  const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);this.nodes.add(o);o.onended=()=>{o.disconnect();g.disconnect();this.nodes.delete(o);};o.start(t);o.stop(t+duration+.02);
 }
 rustle(duration,volume,freq,end,delay=0){
  if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
  const t=this.ctx.currentTime+delay,n=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),g=this.ctx.createGain();n.buffer=this.noise;filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(freq,t);filter.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+duration);n.connect(filter);filter.connect(g);g.connect(this.master);this.nodes.add(n);n.onended=()=>{n.disconnect();filter.disconnect();g.disconnect();this.nodes.delete(n);};n.start(t);n.stop(t+duration);
 }
 play(name){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
  if(name==='throw'){this.rustle(.065,.14,2200,650);}
  else if(name==='hit'){this.tone(220,85,.095,.25,'triangle');this.tone(650,330,.05,.055);this.rustle(.045,.1,900,400);}
  else if(name==='collision'){this.tone(930,420,.14,.12,'triangle');this.tone(1510,780,.10,.05);this.rustle(.07,.09,3000,1700);}
  else if(name==='break'){this.rustle(.30,.22,1200,180);[0,.06,.13].forEach((t,i)=>this.tone(180+i*60,55,.18,.15,'triangle',t));}
  else if(name==='milestone'){[392,494,587,784].forEach((f,i)=>this.tone(f,f,.22,.09,'sine',i*.075));this.rustle(.65,.07,2000,700,.2);}
  else if(name==='lost'){this.tone(196,110,.26,.09,'triangle');this.tone(147,82,.3,.07,'triangle',.15);}
  else if(name==='start'||name==='revive'){[330,440,660].forEach((f,i)=>this.tone(f,f,.12,.055,'sine',i*.045));}
  else if(name==='select'){this.tone(640,800,.06,.06,'sine');}
 }
}
root.TimberSound=Sound;
})(globalThis);
