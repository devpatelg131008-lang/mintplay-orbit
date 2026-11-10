(async function(){
'use strict';
const $=id=>document.getElementById(id),{Game,weapons}=TimberCore;
const seed=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(seed);else seed[0]=Date.now();
const game=new Game(seed[0]);const sound=new TimberSound();let runStartBest=0;const progress=new TimberProgress();let screen='ready',previousScreen='ready',paused=false,frame=0,acc=0,last=performance.now(),noticeTimer=0,lossTimer=0,dirtyHud=true;
let renderer;const assets=Promise.all([TimberRender.loadLogs(TIMBER_ART.logs),TimberRender.loadLogs(TIMBER_ART.moreLogs)]).then(sheets=>sheets.flat());await progress.open();game.weapon=progress.value.equipped;
try{renderer=new TimberRender.Renderer($('field'),await assets);}catch{$('loading').innerHTML='<p>Couldn’t load the artwork.</p><button class="wood-button" onclick="location.reload()">Try again</button>';return;}
const icons=Object.fromEntries(weapons.map(w=>[w.id,TimberRender.weaponIcon(w.id)]));
$('loading').hidden=true;
function note(text){clearTimeout(noticeTimer);$('notice').textContent=text;$('notice').classList.add('show');noticeTimer=setTimeout(()=>$('notice').classList.remove('show'),2200);}
function announce(text){$('announcer').textContent=text;}
function showState(){
 document.querySelector('.topbar').hidden=screen==='workshop';
 $('title').hidden=screen!=='ready';$('startControls').hidden=screen!=='ready';$('footer').hidden=screen!=='ready';$('hud').hidden=screen==='ready'||screen==='workshop';$('pause').hidden=screen!=='playing';$('pauseOverlay').hidden=screen!=='paused';$('gameOver').hidden=screen!=='lost';$('workshop').hidden=screen!=='workshop';
 $('field').setAttribute('aria-label',screen==='playing'?'Spinning log. Tap here or press Space to throw.':'Timber Strike playfield');
 if(screen!=='playing')$('hint').hidden=true;
 if(screen==='lost'){ $('endScore').textContent=game.score; $('revive').hidden=game.revived;$('endLevel').textContent=game.level;$('endBest').textContent=progress.value.best;$('recordFlag').hidden=game.score<=runStartBest; }
 const modal=screen==='paused'?$('pauseOverlay'):screen==='lost'?$('gameOver'):null;if(modal){const d=modal.firstElementChild;d.classList.remove('dialog-enter');void d.offsetWidth;d.classList.add('dialog-enter');}
}
function hud(){if(!dirtyHud)return;dirtyHud=false;$('score').textContent=game.score;$('level').textContent=`Level ${game.level}`;const queue=$('remaining');queue.replaceChildren();for(let i=0;i<game.total;i++){const s=document.createElement('span');s.className=i<game.total-game.remaining?'used':'';queue.append(s);}queue.setAttribute('aria-label',`${game.remaining} throws remaining`);
 $('hearts').innerHTML=Array.from({length:3},(_,i)=>`<svg class="${i>=game.lives?'empty':''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3.6 12.5C-2 6.5 5.7-.5 12 5.6 18.3-.5 26 6.5 20.4 12.5z"/></svg>`).join('');$('hearts').setAttribute('aria-label',`${game.lives} ${game.lives===1?'heart':'hearts'}`);}
function start(){sound.unlock();runStartBest=progress.value.best;clearTimeout(lossTimer);game.start(progress.value.equipped);game.launchY=renderer.launch;screen='playing';paused=false;dirtyHud=true;acc=0;last=performance.now();showState();$('hint').hidden=false;announce('Level 1. Three hearts.');document.activeElement?.blur();}
function pause(){if(screen!=='playing')return;if(game.mode==='lost'){clearTimeout(lossTimer);screen='lost';showState();return;}screen='paused';paused=true;sound.stop();showState();$('resume').focus({preventScroll:true});}
function resume(){if(screen!=='paused')return;sound.unlock();paused=false;screen='playing';acc=0;last=performance.now();showState();$('pause').focus({preventScroll:true});}
function home(){clearTimeout(lossTimer);game.mode='ready';game.level=1;game.score=0;game.lives=3;game.log=0;game.angle=0;game.remaining=7;game.total=7;game.embedded=[];game.fragments=[];game.falling=[];game.chips=[];game.shots=[];game.leaves=[];game.reaction=0;game.weapon=progress.value.equipped;game.recoil=0;game.recoilV=0;game.drain();screen='ready';paused=false;showState();$('play').focus({preventScroll:true});}
function throwWeapon(){if(screen!=='playing'||paused)return;sound.unlock();if(game.shoot()){sound.play('throw');$('hint').hidden=true;}}
function pulse(id,cls){const el=$(id);el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
function events(){for(const e of game.drain()){
 if(e.type!=='throw')sound.play(e.type);
 if(e.type==='hit'){dirtyHud=true;pulse('score','hit');if(game.score>progress.value.best)progress.save({best:game.score});}
 if(e.type==='collision'){dirtyHud=true;pulse('hearts','hurt');announce(game.lives?`${game.lives} ${game.lives===1?'heart':'hearts'} left`:'No hearts left');}
 if(e.type==='lost'){clearTimeout(lossTimer);lossTimer=setTimeout(()=>{if(game.mode==='lost'&&screen==='playing'){screen='lost';showState();$('again').focus({preventScroll:true});announce(`Score ${game.score}`);}},650);}
 if(e.type==='level'){dirtyHud=true;if(game.level>1)announce(`Level ${game.level}`);}
 }}
function workshop(){sound.stop();previousScreen=screen;paused=true;screen='workshop';showState();renderWorkshop();$('workshopClose').focus({preventScroll:true});}
function closeWorkshop(){screen=previousScreen;paused=screen==='paused';game.weapon=progress.value.equipped;last=performance.now();acc=0;showState();if(screen==='ready')$('workshopOpen').focus({preventScroll:true});else if(screen==='paused')$('pauseWorkshop').focus({preventScroll:true});else if(screen==='lost')$('endWorkshop').focus({preventScroll:true});}
function renderWorkshop(){
 $('workshopSub').textContent=`Best score ${progress.value.best}`;$('weaponGrid').replaceChildren();
 for(const w of weapons){const unlocked=progress.unlocked(w.id),selected=game.weapon===w.id;const b=document.createElement('button');b.type='button';b.className='weapon-card'+(unlocked?'':' locked');b.setAttribute('aria-pressed',selected);b.setAttribute('aria-label',`${w.name}. ${selected?'Equipped':unlocked?'Equip':`Unlocks at score ${w.unlock}`}`);
 b.innerHTML=`${selected?'<span class="selected-mark"><svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7"/></svg></span>':''}<img src="${icons[w.id]}" alt="" draggable="false"><span class="weapon-name">${w.name}</span><span class="weapon-status">${selected?'Equipped':unlocked?'Equip':`<svg viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>Score ${w.unlock}`}</span>`;
 b.addEventListener('click',()=>{if(!progress.unlocked(w.id)){note(`Reach score ${w.unlock} to unlock`);return;}sound.unlock();sound.play('select');game.weapon=w.id;progress.save({equipped:w.id});renderWorkshop();const cards=[...$('weaponGrid').children];cards[weapons.indexOf(w)]?.focus({preventScroll:true});});$('weaponGrid').append(b);
 }
}
progress.onchange=()=>{if(screen==='workshop')$('workshopSub').textContent=`Best score ${progress.value.best}`;};
$('play').onclick=start;$('again').onclick=start;$('pause').onclick=pause;$('resume').onclick=resume;$('quit').onclick=home;$('home').onclick=home;
$('workshopOpen').onclick=workshop;$('pauseWorkshop').onclick=workshop;$('endWorkshop').onclick=workshop;$('workshopClose').onclick=closeWorkshop;
$('revive').onclick=()=>{sound.unlock();if(game.revive()){screen='playing';paused=false;dirtyHud=true;last=performance.now();acc=0;showState();announce('One more chance');document.activeElement?.blur();}};
$('field').addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button===0){e.preventDefault();throwWeapon();}});
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();if(screen==='workshop')closeWorkshop();else if(screen==='paused')resume();else pause();}
 if(e.code==='Space'&&!e.repeat&&screen==='playing'){e.preventDefault();throwWeapon();}
 if(e.key==='Tab'&&(screen==='paused'||screen==='lost'||screen==='workshop')){const section=screen==='paused'?$('pauseOverlay'):screen==='lost'?$('gameOver'):$('workshop');const buttons=[...section.querySelectorAll('button')].filter(b=>!b.hidden&&b.offsetParent!==null),first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
$('fullscreen').hidden=!document.documentElement.requestFullscreen;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{note('Full screen is unavailable in this browser');}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();sound.stop();}last=performance.now();acc=0;});window.addEventListener('blur',pause);
new ResizeObserver(()=>{renderer.resize();game.launchY=renderer.launch;}).observe($('game'));
function tick(now){frame=requestAnimationFrame(tick);const delta=Math.min((now-last)/1000,.05);last=now;
 if(!paused&&screen!=='workshop'&&!document.hidden){acc+=delta;let loops=0;while(acc>=1/120&&loops<7){game.step(1/120);acc-=1/120;loops++;}events();}
 renderer.draw(game,screen,now);hud();
}
function updateSoundButton(){const b=$('soundToggle');b.setAttribute('aria-pressed',String(!sound.enabled));b.setAttribute('aria-label',sound.enabled?'Mute sound':'Enable sound');b.classList.toggle('muted',!sound.enabled);}
$('soundToggle').onclick=()=>{sound.toggle();updateSoundButton();if(sound.enabled)sound.play('select');};updateSoundButton();
showState();hud();frame=requestAnimationFrame(tick);
if(!progress.persistent)note('Progress is saved for this visit only');
})();
