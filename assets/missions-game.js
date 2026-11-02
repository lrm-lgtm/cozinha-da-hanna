/* Modo Missões — motor 2D independente, dados declarativos, sem servidor. */
(function(){
"use strict";
const D=window.HannaMissions,A=window.HannaMissionArt,V=window.HannaVoice;
const $=id=>document.getElementById(id);
const screen=$("screen"),modal=$("modal");
const saveKey="hanna_missions_v1";
let progress={};try{progress=JSON.parse(localStorage.getItem(saveKey)||"{}")||{};}catch(e){progress={};}
const state={mode:"map",chapter:0,mission:null,orderIndex:0,phase:"prep",placed:[],prep:0,cooking:false,results:[],startAt:0,guestIndex:0,greeting:"",drag:null,sound:true};
const steps={toast:["Toste o pão","Esfregue o pão sobre a bancada"],stir:["Misture a receita","Faça movimentos na tigela"],chop:["Prepare os ingredientes","Mexa a bancada para cortar"],spread:["Espalhe o molho","Faça movimentos circulares na massa"],grill:["Prepare a chapa","Faça movimentos sobre a chapa"],scoop:["Sirva o sorvete","Faça movimentos com a colher"]};
const tips={toast:"Prepare o pão antes de colocar os ingredientes.",stir:"Mexa a tigela até o ingrediente ficar pronto.",chop:"Prepare os ingredientes fresquinhos.",spread:"Espalhe o molho por toda a massa da pizza.",grill:"Esquente a chapa para receber os ingredientes.",scoop:"Dê forma às bolas de sorvete."};
const tokens=[[32,32],[68,34],[50,54],[32,68],[68,68],[49,21],[77,54],[23,54]];
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function save(){try{localStorage.setItem(saveKey,JSON.stringify(progress));$("saveStatus").textContent="Progresso salvo neste aparelho";}catch(e){$("saveStatus").textContent="Sem salvamento disponível";}}
function icon(id,type){return A.food(id,type)||'<span class="fallback-food">🍽️</span>';}
function recipe(){return D.recipes[state.mission.orders[state.orderIndex]];}
function guest(){return A.people[state.guestIndex%A.people.length];}
function profile(){return V.profile(guest()[0],state.guestIndex);}
function speak(text){if(state.sound)V.speak(text,profile(),{enabled:true});}
function starTotal(){return Object.values(progress).reduce((a,x)=>a+(x.stars||0),0);}
function top(){const v=starTotal();$("totalStars").textContent="★ "+v; }
function mapChapter(i){state.chapter=Math.max(0,Math.min(D.chapters.length-1,i));renderMap();}
function renderMap(){
 V.cancel();state.mode="map";state.mission=null;modal.hidden=true;
 top();$("statusbar").innerHTML="<span>MAPA DE MISSÕES</span><span>6 CAPÍTULOS · 24 RECEITAS E DESAFIOS</span>";
 const complete=D.missions.filter(m=>progress[m.id]?.completed).length;
 const ch=D.chapters[state.chapter];
 const tabs=D.chapters.map((c,i)=>'<button type="button" data-chapter="'+i+'" class="chapter-tab '+(i===state.chapter?'active':'')+'"><b>'+esc(c.icon)+" "+esc(c.title)+'</b><small>'+c.missions.filter(m=>progress[m.id]?.completed).length+'/4 missões</small></button>').join("");
 const items=ch.missions.map((m,i)=>{
  const unlocked=D.unlocked(m.id,progress),p=progress[m.id],r=D.recipes[m.recipe];
  const image=unlocked?icon(r.art,"dish"):'<span class="lock">🔒</span>';
  return '<button type="button" class="mission-card '+(p?.completed?"completed":unlocked?"available":"locked")+'" '+(unlocked?'data-mission="'+m.id+'"':'disabled')+'><span class="number">MISSÃO '+String(i+1).padStart(2,"0")+'</span><span class="card-food">'+image+'</span><b>'+esc(m.title)+'</b><small>'+esc(m.hint)+'</small><span class="award">'+(p?.completed?"★".repeat(p.stars||0)+"☆".repeat(3-(p.stars||0)):unlocked?"TOQUE PARA JOGAR":"BLOQUEADA")+'</span></button>';
 }).join("");
 screen.innerHTML='<div class="screen-map"><div class="map-hero"><div><h2>Uma nova cozinha para explorar</h2><p>Prepare, misture, asse, sirva e desbloqueie novas receitas. Cada capítulo ensina um desafio diferente.</p></div><div class="hero-stat">'+complete+'<span>DE 24 CONCLUÍDAS</span></div></div><nav class="chapter-tabs" aria-label="Selecionar capítulo">'+tabs+'</nav><section class="panel chapter-card" style="--chapter-tone:'+ch.tone+'"><div class="chapter-title"><div><h3>'+esc(ch.icon)+" "+esc(ch.title)+'</h3><p>'+esc(ch.description)+'</p></div><span class="pill">4 MISSÕES</span></div><div class="mission-grid">'+items+'</div></section></div>';
}
function start(id){
 const m=D.get(id);if(!m||!D.unlocked(m.id,progress))return;
 state.mode="play";state.mission=m;state.orderIndex=0;state.results=[];state.chapter=m.chapterIndex;
 initOrder(); 
}
function initOrder(){
 state.phase="prep";state.prep=0;state.placed=[];state.cooking=false;state.startAt=performance.now();
 state.guestIndex=(D.missions.indexOf(state.mission)+state.orderIndex)%A.people.length;
 const r=recipe();state.greeting=V.request("Quero "+r.label.toLowerCase()+", por favor!",state.mission.chapter==="doce"?"dessert":"main",guest()[0]);
 renderPlay();
}
function pantryItems(){
 const r=recipe(),others=Object.keys(D.ingredients).filter(id=>!r.needs.includes(id));
 // Entre os 8 cartões, mantenha os ingredientes da comanda e distrações.
 let seed=D.missions.indexOf(state.mission)*11+state.orderIndex*19;
 let mixed=others.slice().sort((a,b)=>((a.length*17+seed)%23)-((b.length*17+seed)%23));
 let arr=r.needs.concat(mixed.slice(0,Math.max(2,8-r.needs.length)));
 return arr.sort((a,b)=>(a.length*19+seed)%29-(b.length*19+seed)%29);
}
function ticket(){
 const r=recipe(),correct=state.placed.filter(id=>r.needs.includes(id)).length,wrong=state.placed.length-correct;
 return '<div class="ticket"><strong>COMANDA · '+esc(r.label)+'</strong><div class="wanted">'+r.needs.map(id=>'<span class="'+(state.placed.includes(id)?"ok":"")+'">'+icon(id)+esc(D.ingredients[id])+(state.placed.includes(id)?" ✓":"")+'</span>').join("")+'</div><small>'+correct+'/'+r.needs.length+' ingredientes corretos'+(wrong?" · "+wrong+" extra(s)":"")+'</small></div>';
}
function pieceSvg(id){return icon(id);}
function plateArt(){
 const r=recipe(),base=state.placed.includes(r.base);
 const layers=state.placed.filter(i=>i!==r.base).map((id,i)=>{
  const t=tokens[i%tokens.length];
  return '<span class="topping" style="left:'+t[0]+'%;top:'+t[1]+'%">'+pieceSvg(id)+'</span>';
 }).join("");
 const center='<div class="plate-food '+(base?"visible":"")+'">'+icon(r.base)+'</div>';
 const sauce=r.action==="spread"?'<div class="sauce" style="--sauce-opacity:'+((state.prep/100)*.9)+'"></div>':"";
 return '<div id="workdisc" class="workdisc" aria-label="Prato de montagem. Arraste ingredientes para cá.">'+sauce+center+layers+'</div>';
}
function prepArt(){
 const r=recipe(),symbol={spread:"🥣",stir:"🥄",chop:"🔪",grill:"🍳",toast:"🍞",scoop:"🍦"}[r.action]||"🍴";
 return '<div id="workdisc" class="workdisc premix" role="button" tabindex="0" aria-label="Mover para preparar"><span class="gesture">'+symbol+'</span><span class="prep-ring" id="prepPercent">'+state.prep+'%</span></div><div class="progressbar"><span id="prepBar" style="width:'+state.prep+'%"></span></div>';
}
function cookArt(){
 const r=recipe();return '<div class="station-image '+(state.cooking?"cooking":"")+'">'+(A.stations[r.station]||A.stations.bancada)+'</div><div class="work-desc">'+(state.cooking?"Preparando...":"Ligue "+(r.station==="forno"?"o forno":r.station==="chapa"?"a chapa":"a estação")+" para finalizar!")+'</div><div class="progressbar"><span style="width:'+(state.cooking?"72":"0")+'%"></span></div>';
}
function kitchen(){
 const r=recipe();let title,sub,inner,actions,hint;
 if(state.phase==="prep"){title=steps[r.action][0];sub=tips[r.action];inner=prepArt();hint="Desenhe movimentos com o dedo ou mouse.";actions='<button class="action" data-progress>Continuar preparando</button>';}
 else if(state.phase==="add"){title="Monte "+r.label;sub="Arraste cada ingrediente para o prato.";inner=plateArt();hint="Ingredientes extras também entram: o cliente avalia o resultado.";actions='<button class="action" data-next-step '+(!state.placed.length?"disabled":"")+'>'+(r.cook?"Ir para "+(r.station==="forno"?"o forno":"a chapa"):"Pronto para servir")+' →</button>';}
 else if(state.phase==="cook"){title=r.station==="forno"?"Hora do forno":"Na chapa!";sub="A comida precisa ficar no ponto.";inner=cookArt();hint="Clique para cozinhar.";actions='<button class="action" data-cook '+(state.cooking?"disabled":"")+'> '+(state.cooking?"Preparando...":"Ligar "+(r.station==="forno"?"forno":"chapa"))+'</button>';}
 else{title="Pedido pronto!";sub="Leve o prato à mesa do cliente.";inner=plateArt();hint="O cliente vai avaliar a receita.";actions='<button class="action" data-serve>Entregar prato 🍽️</button>';}
 return '<section class="panel kitchen"><div class="tiles"></div><div class="shelf"></div><div class="counter"></div><div class="kitchen-title"><span class="mini">ETAPA · '+esc(state.phase.toUpperCase())+'</span><h2>'+esc(title)+'</h2><p>'+esc(sub)+'</p></div><div class="workarea"><span class="work-label">'+esc(r.label)+'</span>'+inner+'</div><div class="kitchen-actions"><span class="hint">'+esc(hint)+'</span>'+actions+'</div></section>';
}
function renderPlay(){
 if(state.mode!=="play")return;
 const m=state.mission,r=recipe();
 const phaseNum={prep:1,add:2,cook:3,serve:4}[state.phase];
 $("statusbar").innerHTML='<span>'+esc(m.title.toUpperCase())+' · PEDIDO '+(state.orderIndex+1)+'/'+m.orders.length+'</span><span>ETAPA '+phaseNum+'/4</span>';
 top();
 const customer='<aside class="panel guest-panel"><div class="guest-head"><small>CLIENTE NO BALCÃO</small><h3>'+esc(guest()[0])+'</h3><p>'+esc(m.hint)+'</p></div><div class="guest-portrait">'+A.person(state.guestIndex)+'</div><div class="guest-request"><strong>PEDIDO DA VEZ</strong><p>'+esc(state.greeting)+'</p></div><button type="button" class="guest-voice" data-speak>🔊 Ouvir cliente</button><div class="guest-step">★ '+esc(m.title)+' · '+(state.orderIndex+1)+' de '+m.orders.length+'</div></aside>';
 const items=pantryItems().map(id=>'<button type="button" data-ingredient="'+id+'" class="ingredient '+(state.placed.includes(id)?"done":"")+'" '+(state.phase!=="add"||state.placed.includes(id)?"disabled":"")+'><span>'+icon(id)+'</span><b>'+esc(D.ingredients[id])+'</b></button>').join("");
 const right='<aside class="panel pantry"><div class="pantry-head"><h3>Ingredientes</h3><p>'+(state.phase==="add"?"Arraste para o prato ou toque para selecionar.":"Confira o pedido e acompanhe o preparo.")+'</p></div><div class="pantry-scroll"><div class="pantry-grid">'+items+'</div>'+ticket()+'</div></aside>';
 screen.innerHTML='<div class="play-layout">'+customer+kitchen()+right+'</div>';
}
function advance(){
 const r=recipe();
 if(state.phase==="prep"){state.phase="add";renderPlay();}
 else if(state.phase==="add"){if(!state.placed.length)return;state.phase=r.cook?"cook":"serve";renderPlay();}
 else if(state.phase==="cook"){state.phase="serve";renderPlay();}
}
function progressPrep(amount){
 if(state.mode!=="play"||state.phase!=="prep")return;
 state.prep=Math.min(100,state.prep+amount);
 const bar=$("prepBar"),pct=$("prepPercent");
 if(bar)bar.style.width=state.prep+"%";if(pct)pct.textContent=state.prep+"%";
 if(state.prep>=100)advance();
}
function addIngredient(id){
 if(state.mode!=="play"||state.phase!=="add"||state.placed.includes(id)||!D.ingredients[id])return;
 state.placed.push(id);
 renderPlay();
}
function cook(){
 if(state.phase!=="cook"||state.cooking)return;
 state.cooking=true;renderPlay();
 setTimeout(()=>{if(state.mode==="play"&&state.phase==="cook"){state.cooking=false;advance();}},1050);
}
function calc(){
 const r=recipe(),correct=state.placed.filter(id=>r.needs.includes(id)).length,wrong=state.placed.length-correct,missing=r.needs.length-correct;
 const seconds=Math.max(1,Math.round((performance.now()-state.startAt)/1000));
 let satisfaction=Math.min(100,Math.max(0,Math.round(100*correct/r.needs.length-22*wrong-12*missing+(seconds<50&&wrong===0&&missing===0?5:0))));
 return {correct,wrong,missing,satisfaction,seconds,stars:satisfaction>=85?3:satisfaction>=60?2:satisfaction>=30?1:0};
}
function finishOrder(){
 if(state.phase!=="serve")return;
 const result=calc();
 state.results.push(result);
 const line=V.feedback({level:result.satisfaction>=85?"excellent":result.satisfaction>=60?"good":result.satisfaction>=30?"okay":"low",elapsed:result.seconds});
 const done=state.orderIndex===state.mission.orders.length-1;
 if(done){
  const total=state.results.reduce((a,v)=>a+v.stars,0);
  const stars=Math.min(3,Math.round(total/state.results.length));
  const old=progress[state.mission.id]||{};
  progress[state.mission.id]={completed:true,stars:Math.max(old.stars||0,stars),lastPlayed:new Date().toISOString()};
  save();top();
 }
 const portrait=A.person(state.guestIndex,result.satisfaction<40?"sad":result.satisfaction<70?"surprised":"happy");
 modal.innerHTML='<div class="result-card"><div>'+portrait+'</div><h2>'+ (done?"Missão concluída!":"Pedido servido!")+'</h2><div class="stars">'+("★".repeat(result.stars)||"☆")+'</div><p>“'+esc(line)+'”</p><div class="rating">'+result.satisfaction+'% de satisfação · '+result.correct+' acertos · '+result.wrong+' extras · '+result.missing+' faltando · '+result.seconds+' segundos</div><div class="result-actions"><button class="action secondary" data-replay-voice>🔊 Ouvir avaliação</button><button class="action" data-result-next>'+ (done?"Ver próximas missões":"Próximo pedido →")+'</button></div></div>';
 modal.hidden=false;state.lastResponse=line;state.resultDone=done;
 speak(line);
}
function nextOrder(){
 V.cancel();modal.hidden=true;
 if(state.resultDone){const next=D.next(state.mission.id);if(next&&D.unlocked(next.id,progress))state.chapter=next.chapterIndex;renderMap();}
 else{state.orderIndex++;initOrder();}
}
function clear(){state.placed=[];renderPlay();}
function disposeDrag(){
 const drag=state.drag;state.drag=null;
 if(drag?.proxy)drag.proxy.remove();
 const disc=$("workdisc");if(disc)disc.classList.remove("drop");
}
screen.addEventListener("click",e=>{
 const ch=e.target.closest("[data-chapter]");if(ch)return mapChapter(Number(ch.dataset.chapter));
 const m=e.target.closest("[data-mission]");if(m)return start(m.dataset.mission);
 if(e.target.closest("[data-speak]")){speak(state.greeting);return;}
 if(e.target.closest("[data-progress]")){progressPrep(25);return;}
 if(e.target.closest("[data-next-step]")){advance();return;}
 if(e.target.closest("[data-cook]")){cook();return;}
 if(e.target.closest("[data-serve]")){finishOrder();return;}
 const ing=e.target.closest("[data-ingredient]");
 if(ing&&state.phase==="add"&&!ing.disabled&&!state.drag){addIngredient(ing.dataset.ingredient);}
});
screen.addEventListener("keydown",e=>{
 const pad=e.target.closest("#workdisc.premix");
 if(pad&&(e.key==="Enter"||e.key===" ")){e.preventDefault();progressPrep(25);}
});
screen.addEventListener("pointerdown",e=>{
 const disc=e.target.closest("#workdisc.premix");
 if(disc&&state.phase==="prep"){
   state.drag={kind:"prep",pointer:e.pointerId,x:e.clientX,y:e.clientY,steps:0};
   try{disc.setPointerCapture(e.pointerId);}catch(err){}
   return;
 }
 const b=e.target.closest("[data-ingredient]");
 if(b&&!b.disabled&&state.phase==="add"){
   state.drag={kind:"ingredient",pointer:e.pointerId,id:b.dataset.ingredient,x:e.clientX,y:e.clientY,moving:false};
   try{b.setPointerCapture(e.pointerId);}catch(err){}
 }
});
document.addEventListener("pointermove",e=>{
 const d=state.drag;if(!d||d.pointer!==e.pointerId)return;
 if(d.kind==="prep"){
  const delta=Math.hypot(e.clientX-d.x,e.clientY-d.y);
  if(delta>13){progressPrep(Math.min(30,Math.max(6,Math.round(delta*.32))));d.x=e.clientX;d.y=e.clientY;d.steps++;}
  return;
 }
 const dist=Math.hypot(e.clientX-d.x,e.clientY-d.y);
 if(!d.moving&&dist>8){
  d.moving=true;const node=document.createElement("div");node.className="drag-float";node.innerHTML=icon(d.id);document.body.appendChild(node);d.proxy=node;
 }
 if(d.moving&&d.proxy){
  e.preventDefault();d.proxy.style.left=e.clientX+"px";d.proxy.style.top=e.clientY+"px";
  const plate=$("workdisc");if(plate){const r=plate.getBoundingClientRect();plate.classList.toggle("drop",e.clientX>=r.left-15&&e.clientX<=r.right+15&&e.clientY>=r.top-15&&e.clientY<=r.bottom+15);}
 }
},{passive:false});
document.addEventListener("pointerup",e=>{
 const d=state.drag;if(!d||d.pointer!==e.pointerId)return;
 if(d.kind==="prep"){disposeDrag();if(!d.steps)progressPrep(25);return;}
 const plate=$("workdisc"),r=plate?.getBoundingClientRect();
 const good=d.moving&&r&&e.clientX>=r.left-15&&e.clientX<=r.right+15&&e.clientY>=r.top-15&&e.clientY<=r.bottom+15;
 // Um toque simples usa o click nativo como alternativa, arrastar exige soltar no prato.
 disposeDrag();if(good)addIngredient(d.id);
});
document.addEventListener("pointercancel",disposeDrag);
modal.addEventListener("click",e=>{if(e.target.closest("[data-replay-voice]"))speak(state.lastResponse);if(e.target.closest("[data-result-next]"))nextOrder();});
$("showMap").addEventListener("click",()=>renderMap());
$("toggleVoice").addEventListener("click",()=>{
 state.sound=!state.sound;$("toggleVoice").textContent=state.sound?"🔊":"🔇";
 if(!state.sound)V.cancel();
});
const deep=new URLSearchParams(location.search).get("mission");
if(deep&&D.get(deep)&&D.unlocked(deep,progress))start(deep);
else{const next=D.missions.find(m=>D.unlocked(m.id,progress)&&!progress[m.id]?.completed);if(next)state.chapter=next.chapterIndex;renderMap();}
window.HannaMissionDebug={catalog:D.missions.length,chapters:D.chapters.length,progress:()=>progress,current:()=>({mode:state.mode,phase:state.phase,mission:state.mission?.id,orderIndex:state.orderIndex,placed:state.placed.slice()})};
})();
