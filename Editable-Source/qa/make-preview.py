"""Development-only visual scenarios. Never included in the deployable HTML."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / 'dist/index.html').read_text()
hook = """
window.TIMBER_QA={
 scenario(kind){
  start();game.rotationEnabled=true;
  if(kind==='turn'){game.level=15;game.setupLevel();}
  if(kind==='leaves'){game.level=10;game.setupLevel();game.remaining=1;game.embedded=[];game.rotationEnabled=false;game.shoot();for(let i=0;i<300;i++)game.step(1/120);events();paused=true;}
  if(kind==='embed'){game.rotationEnabled=false;game.shoot();for(let i=0;i<40;i++)game.step(1/120);events();paused=true;}
  if(kind==='newlog'){game.log=10;}
  dirtyHud=true;
 },
 status(){return {mode:game.mode,level:game.level,score:game.score,leaves:game.leaves.length,speed:game.speed().toFixed(2),sound:sound.enabled,audio:sound.ctx?.state||'not started'};},
 async audioCheck(muted){
  if(!sound.enabled)sound.toggle();sound.unlock();await sound.ctx?.resume();
  const analyser=sound.ctx.createAnalyser();analyser.fftSize=256;sound.master.connect(analyser);
  if(muted)sound.toggle();sound.play('break');let peak=0;
  for(let i=0;i<22;i++){const data=new Float32Array(256);analyser.getFloatTimeDomainData(data);peak=Math.max(peak,...data.map(Math.abs));await new Promise(r=>setTimeout(r,15));}
  sound.master.disconnect(analyser);updateSoundButton();return `${muted?'Muted':'Active'} peak: ${peak.toFixed(5)}, sources after decay: ${sound.nodes.size}`;
 }
};
"""
html=html.replace("showState();hud();frame=requestAnimationFrame(tick);",hook+"showState();hud();frame=requestAnimationFrame(tick);")
html=html.replace('mint-play-timber-sound','timber-qa-sound').replace('timber-strike-v1','timber-qa-v1')
(root/'dist/qa-scenarios.html').write_text(html)
(root/'dist/phone-check.html').write_text((root/'qa/phone-check.html').read_text())
(root/'dist/qa-effects.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><title>Timber effects check</title>
<style>body{margin:0;background:#d5c9b7;font:14px system-ui;color:#30251d;display:flex;justify-content:center;gap:24px;padding:24px}aside{width:230px}button,a{display:block;margin:12px 0;padding:10px}iframe{border:0;width:390px;height:844px;box-shadow:0 12px 30px #0003}output{white-space:pre-wrap;line-height:1.8}</style>
<aside><h2>Development checks</h2><a href="phone-check.html">Phone sizes</a><button data-scenario="turn">Level 15 reversals</button><button data-scenario="leaves">Clear level 10</button><button data-scenario="embed">Embedded arrow</button><button data-scenario="newlog">Mahogany log</button><button id="sound">Check active audio</button><button id="mute">Check muted audio</button><output id="audio"></output><hr><output id="status"></output></aside>
<iframe id="phone" title="Game effects" src="qa-scenarios.html"></iframe><script>
const frame=document.getElementById('phone');document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>frame.contentWindow.TIMBER_QA.scenario(b.dataset.scenario));
document.getElementById('sound').onclick=async()=>{document.getElementById('audio').textContent=await frame.contentWindow.TIMBER_QA.audioCheck(false);};
document.getElementById('mute').onclick=async()=>{document.getElementById('audio').textContent=await frame.contentWindow.TIMBER_QA.audioCheck(true);};
setInterval(()=>{const qa=frame.contentWindow.TIMBER_QA;if(qa)document.getElementById('status').textContent=JSON.stringify(qa.status(),null,2);},150);
</script></html>''')
print('Created development-only effect preview')
