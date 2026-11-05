/* Cozinha da Hanna — protótipo de hambúrguer.
   Arte 2.5D original em Canvas, jogabilidade isolada do restaurante.
   Sem APIs externas, sem imagens remotas e sem coleta de dados. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("scene"),ctx=canvas.getContext("2d",{alpha:true});
const W=720,H=520,TAU=Math.PI*2;
const stageDefs=[
 {title:"Mãos na carne!",label:"ETAPA 01 · MODELAR",desc:"Pressione ou deslize sobre a carne para transformá-la num hambúrguer.",hint:"TOQUE OU DESLIZE SOBRE A CARNE",tool:"Carne fresca",info:"Carne crua e tábua de preparo",button:"Ir para o corte"},
 {title:"Corte o tomate",label:"ETAPA 02 · CORTAR",desc:"Faça quatro cortes no tomate. As fatias serão usadas na montagem.",hint:"TOQUE NO TOMATE PARA FAZER OS CORTES",tool:"Corte",info:"Tomate fresco, faca e tábua",button:"Levar para a chapa"},
 {title:"Na chapa!",label:"ETAPA 03 · GRELHAR",desc:"Grelhe a carne dos dois lados e vire na hora certa.",hint:"LIGUE A CHAPA E VIRE NO PONTO",tool:"Chapa quente",info:"Observe a carne mudar de cor",button:"Montar o lanche"},
 {title:"Monte o hambúrguer",label:"ETAPA 04 · MONTAR",desc:"Escolha os ingredientes para formar um lanche de verdade.",hint:"ARRASTE PARA O PÃO OU TOQUE NO INGREDIENTE",tool:"Montagem",info:"Cada ingrediente entra numa camada",button:"Fechar e servir"},
 {title:"Hora de servir!",label:"ETAPA 05 · SERVIR",desc:"Seu hambúrguer está pronto. O cliente vai avaliar a receita.",hint:"PRONTO PARA ENTREGAR",tool:"Prato final",info:"Acompanhe a reação do cliente",button:"Entregar ao Theo"}
];
const palette=[
 {id:"carne",name:"Carne grelhada",description:"Preparada na chapa",good:true},
 {id:"queijo",name:"Queijo",description:"Derrete sobre a carne",good:true},
 {id:"tomate",name:"Tomate",description:"Fatias frescas",good:true},
 {id:"alface",name:"Alface",description:"Folhas crocantes",good:true},
 {id:"pepino",name:"Pepino",description:"Extra não pedido",good:false},
 {id:"cebola",name:"Cebola",description:"Extra não pedido",good:false}
];
const expected=["carne","queijo","tomate","alface"];
const KNIFE_DURATION=860;
const PHASE_DELAY=700;
function initialState(sound=true){
 return {phase:0,effort:0,cuts:0,cutting:false,cutStartedAt:0,lastCutAt:0,cutTimer:null,autoTimer:null,autoPhase:-1,enteredAt:performance.now(),heating:false,grill:0,flipped:false,waitingFlip:false,flippingAt:0,ingredients:[],foodAddedAt:0,lastFood:null,drag:null,sound,activeSound:null,startedAt:performance.now(),finished:false,rating:null,lastLine:"",chefVoice:"Theo"};
}
let st=initialState();
let logical={s:1,x:0,y:0};
let prev=performance.now(),frame=0,shake=0,particles=[];
const voice=window.HannaVoice;
const orderText="Oi, Chef Hanna! Quero um hambúrguer com carne grelhada, queijo, tomate e alface, por favor!";
const safe=(n,min,max)=>Math.min(max,Math.max(min,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-safe(t,0,1),3);
const mix=(a,b,t)=>Math.round(lerp(a,b,t));
const rgb=(a,b,t)=>"rgb("+mix(a[0],b[0],t)+","+mix(a[1],b[1],t)+","+mix(a[2],b[2],t)+")";
const rnd=(seed)=>{let x=Math.sin(seed*91.23+17.3)*43758.5453;return x-Math.floor(x);};
function roundRect(x,y,w,h,r,color,stroke){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(color){ctx.fillStyle=color;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function ellipse(x,y,rx,ry,color,rotation=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);
 if(color){ctx.fillStyle=color;ctx.fill();}ctx.restore();
}
function line(points,color,width=2){
 ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
}
function radial(x,y,r,light,dark){
 const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.04,x,y,r);
 g.addColorStop(0,light);g.addColorStop(1,dark);return g;
}
function linear(x1,y1,x2,y2,a,b,c){
 const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(.55,b);g.addColorStop(1,c||b);return g;
}
function shadow(color="#38261940",blur=18,y=8){ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.shadowOffsetY=y;}
function withShadow(fn,color,blur,y){
 ctx.save();shadow(color,blur,y);fn();ctx.restore();
}
function drawEnvironment(t){
 // The CSS owns the wall and worktop. Canvas adds shadows and diffuse light.
 ctx.save();
 ellipse(360,410,235,46,"#5e46332b");
 ellipse(357,414,200,27,"#47342617");
 // light falling on the work surface
 const glow=ctx.createRadialGradient(320,180,1,345,260,390);
 glow.addColorStop(0,"#ffffff33");glow.addColorStop(1,"#ffffff00");
 ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 ctx.restore();
}
function drawBoard(){
 ctx.save();
 withShadow(()=>roundRect(112,100,496,312,31,linear(110,130,585,400,"#c69c71","#ae7953","#936345")),"#392a204d",22,14);
 roundRect(131,119,457,273,22,linear(135,145,590,400,"#edc69d","#c8966d","#b87d54"));
 ctx.save();ctx.beginPath();ctx.roundRect(131,119,457,273,22);ctx.clip();
 for(let i=0;i<26;i++){
  const xx=141+i*19;line([[xx,121],[xx+13,392]],i%3===0?"#fff5d31a":"#794e3510",i%5===0?6:2);
 }
 for(let i=0;i<23;i++){
  const yy=122+i*12;
  ctx.beginPath();ctx.moveTo(165,yy);ctx.bezierCurveTo(310,yy+3*Math.sin(i),460,yy-6*Math.sin(i),560,yy);
  ctx.strokeStyle=i%3===0?"#70493113":"#fff9e30c";ctx.lineWidth=i%4===0?3:1;ctx.stroke();
 }
 ctx.restore();
 roundRect(149,138,421,236,15,null,"#fff0d05b");
 ellipse(555,358,13,13,"#a2764d");
 ellipse(555,358,8,8,"#e5c49c");
 ctx.restore();
}
function drawMeat(x,y,grilled,flat,rotation=0){
 const t=safe(grilled,0,1);
 const raw=["#c86a68","#8c343a","#f7aaa4"],cooked=["#986046","#4d302b","#ce9872"];
 const outer=rgb([159,67,69],[94,51,38],t),inner=rgb([211,119,107],[153,94,63],t);
 const rw=lerp(87,150,flat),rh=lerp(67,43,flat);
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
 withShadow(()=>ellipse(0,12,rw+4,rh*.75,"#4a2b2437"),"#39231929",10,5);
 ctx.beginPath();
 for(let i=0;i<38;i++){
  const a=i*TAU/38,j=(rnd(i*24+1)-.5)*.065;
  const rad=1+j,xx=Math.cos(a)*rw*rad,yy=Math.sin(a)*rh*rad;
  if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
 }ctx.closePath();
 ctx.fillStyle=radial(-16,-20,rw*1.5,inner,outer);ctx.fill();
 ctx.strokeStyle=rgb([125,51,56],[70,43,31],t);ctx.lineWidth=4;ctx.stroke();
 ctx.save();ctx.clip();
 for(let i=0;i<140;i++){
  let a=rnd(i*21+4)*TAU,r=Math.sqrt(rnd(i*19+9));
  let xx=Math.cos(a)*rw*.92*r,yy=Math.sin(a)*rh*.92*r;
  ellipse(xx,yy,1+rnd(i)*3,1+rnd(i+3)*1.7,t>.65?"#c9906b91":"#f2a9a688",rnd(i)*TAU);
 }
 for(let i=0;i<7;i++){
  const yy=-29+i*10;
  ctx.beginPath();ctx.moveTo(-rw*.72,yy);ctx.bezierCurveTo(-rw*.22,yy-10,rw*.35,yy+7,rw*.71,yy-7);
  ctx.strokeStyle=t>.2?"#5c392a"+(t>.7?"ba":"66"):"#922f4244";
  ctx.lineWidth=lerp(1,7,t);ctx.stroke();
 }
 ctx.restore();
 // golden fat or charred edge
 if(t>.5){
  for(let i=0;i<12;i++){
    const a=i*TAU/12;
    ellipse(Math.cos(a)*rw*.91,Math.sin(a)*rh*.91,4,1.7,"#deae7249",a);
  }
 }
 ctx.restore();
}
function drawTomato(x,y,sliced=0,scale=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const whole=safe(1-sliced/4,0,1);
 if(whole>.02){
  ellipse(0,9,97*whole,52,"#703e2e25");
  ellipse(0,0,97*whole,58,radial(-28,-19,120,"#fa8f72","#aa302f"));
  ellipse(-20,-10,65*whole,31,"#f5746a55");
  for(let i=0;i<6;i++){
    const a=i*TAU/6;line([[0,-6],[Math.cos(a)*18,Math.sin(a)*8-6]],"#477b4866",3);
  }
  ellipse(0,-12,9,7,"#5b8a53");
 }
 const slices=Math.round(sliced);
 for(let i=0;i<slices;i++){
  let xx=-124+i*81,yy=70+((i%2)*8);
  drawTomatoSlice(xx,yy,34);
 }
 ctx.restore();
}
function drawTomatoSlice(x,y,r=43){
 ctx.save();
 withShadow(()=>ellipse(x,y+8,r+2,r*.55,"#612d2d48"),"#3c231d2b",8,4);
 ellipse(x,y,r,r*.65,radial(x-r*.2,y-r*.3,r*1.2,"#ee7766","#ab312c"));
 ellipse(x,y,r*.88,r*.57,"#f19d7c");
 ellipse(x,y,r*.74,r*.47,"#d7443a");
 for(let i=0;i<6;i++){
  const a=(i+.3)*TAU/6;
  ellipse(x+Math.cos(a)*r*.43,y+Math.sin(a)*r*.26,5,3,"#f6cdaa");
  ellipse(x+Math.cos(a)*r*.38,y+Math.sin(a)*r*.25,2,1.5,"#f8eee0");
 }
 ellipse(x,y,7,4,"#f6b0a0");
 ctx.restore();
}
function drawLettuce(x,y,width=134){
 ctx.save();ctx.translate(x,y);
 ctx.beginPath();for(let i=0;i<=40;i++){
  const u=i/40,xv=(u-.5)*width*2;
  const wav=7*Math.sin(u*TAU*4)+5*Math.sin(u*TAU*9);
  const yv=-12+12*Math.sin(Math.PI*u)-wav;
  if(i===0)ctx.moveTo(xv,yv);else ctx.lineTo(xv,yv);
 }
 for(let i=40;i>=0;i--){
  const u=i/40,xv=(u-.5)*width*2;
  const yv=25+7*Math.sin(u*TAU*7);ctx.lineTo(xv,yv);
 }
 ctx.closePath();ctx.fillStyle=linear(0,-30,0,40,"#bde28b","#6faa57","#3b803b");ctx.fill();
 ctx.strokeStyle="#428449";ctx.lineWidth=3;ctx.stroke();
 ctx.save();ctx.clip();
 for(let i=-4;i<5;i++){line([[0,10],[i*25,-19+(i%2)*4]],"#d9efa6aa",2.4);}
 ctx.restore();
 ctx.restore();
}
function drawCheese(x,y,width=300){
 ctx.save();ctx.translate(x,y);
 withShadow(()=>{
  ctx.beginPath();
  ctx.moveTo(-width*.49,-21);
  ctx.lineTo(width*.46,-19);
  ctx.quadraticCurveTo(width*.52,3,width*.40,24);
  ctx.lineTo(width*.29,43);
  ctx.quadraticCurveTo(width*.20,48,width*.19,20);
  ctx.lineTo(-width*.20,19);
  ctx.quadraticCurveTo(-width*.29,57,-width*.38,40);
  ctx.lineTo(-width*.49,13);
  ctx.closePath();ctx.fillStyle=linear(0,-30,0,55,"#ffe89e","#ffd35d","#dc9f3e");ctx.fill();
 },"#55371920",6,3);
 ctx.beginPath();ctx.moveTo(-width*.43,-14);ctx.lineTo(width*.42,-13);
 ctx.strokeStyle="#fff5c5bb";ctx.lineWidth=5;ctx.stroke();
 ctx.restore();
}
function drawBunBottom(x,y,w=151){
 ctx.save();ctx.translate(x,y);
 withShadow(()=>ellipse(0,25,w+8,37,"#71503944"),"#3c2c2339",16,7);
 ellipse(0,18,w,45,linear(0,-26,0,58,"#e0a76b","#bb773e","#8d5333"));
 ellipse(0,11,w*.96,33,linear(0,-20,0,45,"#fff0bd","#e6bc80","#c88b4f"));
 ellipse(-24,2,w*.66,12,"#fff4c068");
 ctx.restore();
}
function drawBunTop(x,y,w=153,progress=1){
 ctx.save();ctx.translate(x,y+((1-progress)*-90));ctx.globalAlpha=progress;
 withShadow(()=>{
  ctx.beginPath();ctx.moveTo(-w,14);
  ctx.bezierCurveTo(-w*1.02,-57,-w*.53,-98,0,-104);
  ctx.bezierCurveTo(w*.73,-99,w*1.01,-43,w,14);
  ctx.quadraticCurveTo(0,43,-w,14);
  ctx.closePath();
  ctx.fillStyle=linear(0,-99,0,40,"#f7d89e","#dca162","#9e6339");ctx.fill();
 },"#54391d55",15,12);
 ctx.beginPath();ctx.moveTo(-w*.86,-7);ctx.bezierCurveTo(-w*.7,-71,10,-106,w*.66,-52);
 ctx.strokeStyle="#fff1ca76";ctx.lineWidth=13;ctx.lineCap="round";ctx.stroke();
 ellipse(0,15,w,18,"#d19a60");
 ellipse(0,17,w*.94,9,"#e4b37a");
 for(let i=0;i<22;i++){
  const a=rnd(i*19+22)*TAU,r=Math.sqrt(rnd(i*31+10));
  const xx=Math.cos(a)*w*.78*r,yy=-70+Math.sin(a)*27*r+12*Math.pow(r,2);
  ellipse(xx,yy,5,2.8,"#fff0c4",rnd(i*3.9)*TAU);
 }
 ctx.restore();
}
function drawPickle(x,y,r=40){
 ellipse(x,y+4,r,r*.66,"#466c3729");
 ellipse(x,y,r,r*.65,"#4f873b");
 ellipse(x,y,r*.86,r*.54,"#d4eab1");
 ellipse(x,y,r*.60,r*.39,"#a8ce70");
 for(let i=0;i<6;i++){let a=i*TAU/6;ellipse(x+Math.cos(a)*r*.31,y+Math.sin(a)*r*.21,3,2,"#f5e6c4");}
}
function drawOnion(x,y,r=35){
 ellipse(x,y+3,r,r*.61,"#5c3a3b28");
 ellipse(x,y,r,r*.60,"#dcc9dd");
 ellipse(x,y,r*.80,r*.48,"#a885ad");
 ellipse(x,y,r*.61,r*.37,"#f8eeef");
 ellipse(x,y,r*.43,r*.25,"#bfa2c4");
 ellipse(x,y,r*.21,r*.13,"#f2e9ed");
}
function drawSkillet(t){
 ctx.save();
 // cast iron lip & handle
 ctx.translate(360,255);
 withShadow(()=>ellipse(2,44,221,127,"#383f36bb"),"#382b2a6e",24,14);
 roundRect(187,16,185,45,20,linear(180,0,375,45,"#65726b","#343b35","#2c2f2c"));
 roundRect(310,26,48,20,8,"#9b95847a");
 ellipse(0,32,232,148,"#444940");
 ellipse(0,22,209,129,radial(-49,-27,220,"#4e524a","#242c28"));
 ellipse(0,28,195,116,"#242b26");
 ctx.save();ctx.beginPath();ctx.ellipse(0,28,195,116,0,0,TAU);ctx.clip();
 for(let i=0;i<9;i++){line([[-170,(-95+i*24)+28],[170,(-95+i*24)+28]],"#4d514a66",9);}
 if(st.heating){const gl=ctx.createRadialGradient(0,25,20,0,25,170);gl.addColorStop(0,"#c66e3334");gl.addColorStop(1,"#c66e3300");ctx.fillStyle=gl;ctx.fillRect(-202,-130,405,299);}
 ctx.restore();
 ctx.restore();
}
function drawSmoke(time,amount=1){
 ctx.save();
 for(let i=0;i<9;i++){
  const a=(time*0.42+i*23)%150,alpha=(1-a/150)*.32*amount;
  const x=315+Math.sin(i*7.2+time*.002)*62+a*.12,y=220-a*1.12;
  ellipse(x,y,6+a*.1,9+a*.12,"rgba(247,243,227,"+alpha.toFixed(3)+")",Math.sin(i*2)*.3);
 }
 ctx.restore();
}
function drawSparkle(x,y,t){
 ctx.save();ctx.translate(x,y);ctx.rotate(t);
 ctx.fillStyle="#fff3b1";ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(5,-3,13,0);ctx.quadraticCurveTo(2,5,0,13);ctx.quadraticCurveTo(-4,2,-13,0);ctx.quadraticCurveTo(-3,-3,0,-14);ctx.fill();
 ctx.restore();
}
function drawCeramicPlate(){
 ctx.save();
 withShadow(()=>ellipse(360,410,215,79,"#dce5dc"),"#313b3355",23,17);
 ellipse(360,398,209,72,linear(165,360,560,465,"#fffefb","#e5eee4","#d2ded6"));
 ellipse(360,396,178,57,"#f9fbf5");
 ctx.beginPath();ctx.ellipse(360,396,168,49,0,0,TAU);
 ctx.strokeStyle="#e5ece4";ctx.lineWidth=4;ctx.stroke();
 ellipse(359,410,135,25,"#5f483d1b");
 ctx.restore();
}
function drawAssembly(){
 drawCeramicPlate();
 drawBunBottom(360,372);
 let level=346;
 for(let i=0;i<st.ingredients.length;i++){
  const id=st.ingredients[i];
  const t=id===st.lastFood?safe((performance.now()-st.foodAddedAt)/570,0,1):1;
  const y=level-((1-ease(t))*120),xx=360+Math.sin(i*2)*3;
  ctx.save();
  if(id==="carne"){drawMeat(xx,y,.98,1);level-=41;}
  else if(id==="queijo"){drawCheese(xx,y,302);level-=27;}
  else if(id==="tomate"){drawTomatoSlice(xx-65,y,47);drawTomatoSlice(xx+56,y-7,45);level-=25;}
  else if(id==="alface"){drawLettuce(xx,y,145);level-=27;}
  else if(id==="pepino"){drawPickle(xx-66,y,43);drawPickle(xx+63,y-3,41);level-=21;}
  else if(id==="cebola"){drawOnion(xx-60,y,43);drawOnion(xx+55,y-3,44);level-=20;}
  ctx.restore();
 }
 if(st.phase===4){
   const pos=level-12,dt=safe((performance.now()-st.serveAt)/800,0,1);
   drawBunTop(360,pos,153,ease(dt));
 }
}
function renderRawShape(){
 drawBoard();
 const t=safe(st.effort/100,0,1);
 drawMeat(360,265,0,t);
 // motion marks on pressing, not floating emoji badges
 if(st.drag||t>.05&&t<.98){
  for(let i=0;i<3;i++){
   const x=230+i*130;
   ctx.beginPath();ctx.arc(x,202,22,Math.PI*1.3,Math.PI*1.9);
   ctx.strokeStyle="#ffffff86";ctx.lineWidth=5;ctx.stroke();
  }
 }
 if(t>=1){drawSparkle(238,171,frame*.012);drawSparkle(499,222,-frame*.008);}
}
function renderCut(){
 drawBoard();
 // O tomate mostra somente os cortes que a faca realmente concluiu.
 drawTomato(360,248,st.cuts,1);
 const elapsed=st.cutting?safe((performance.now()-st.cutStartedAt)/KNIFE_DURATION,0,1):0;
 // Antecipação → descida lenta → pressão → retirada com breve pausa.
 const down=elapsed<.15?0:elapsed<.63?ease((elapsed-.15)/.48):elapsed<.77?1:1-ease((elapsed-.77)/.23);
 const wobble=st.cutting?Math.sin(elapsed*Math.PI)*.022:0;
 const knifeX=264+st.cuts*59,knifeY=st.cutting?lerp(42,245,down):37;
 ctx.save();ctx.translate(knifeX,knifeY);ctx.rotate(-.24+wobble);
 // Lâmina larga com bisel em aço polido.
 withShadow(()=>{
  ctx.beginPath();ctx.moveTo(-31,-130);ctx.lineTo(28,-125);ctx.lineTo(20,11);ctx.quadraticCurveTo(0,31,-28,13);ctx.closePath();
  ctx.fillStyle=linear(-31,-115,26,20,"#e4eae6","#b3c1bf","#697e7c");ctx.fill();
 },"#362b2345",10,5);
 ctx.beginPath();ctx.moveTo(-15,-121);ctx.lineTo(14,-116);ctx.lineTo(12,0);ctx.lineTo(-16,5);ctx.closePath();
 ctx.fillStyle=linear(-15,-120,14,4,"#f9fbf6","#d1ded9","#8d9c99");ctx.fill();
 line([[-29,13],[20,11]],"#f5faf5",3);
 roundRect(-17,14,37,88,10,linear(-15,14,22,100,"#8b5b3e","#684b3a","#342e2b"),"#422a22");
 roundRect(-10,24,9,69,5,"#a67e5a86");
 for(let i=0;i<3;i++)ellipse(7,35+i*23,3.6,3.6,"#ddc8a8");
 ctx.restore();
 // Marcas curtas e discretas indicam o corte que está acontecendo.
 if(st.cutting&&elapsed>.4&&elapsed<.80){
  const alpha=safe((elapsed-.4)/.18,0,.7);
  line([[knifeX-34,268],[knifeX-14,274]],"rgba(255,244,220,"+alpha+")",4);
  for(let i=0;i<3;i++){
   const a=elapsed*11+i*2.1;
   ellipse(knifeX+Math.cos(a)*17,260+Math.sin(a)*8,3,2,"rgba(245,204,153,"+(alpha*.65)+")");
  }
 }
 if(st.cuts>=4)drawSparkle(235,184,frame*.015);
}
function renderGrill(time){
 drawSkillet(time);
 const g=st.grill/100,t=safe(g,0,1);
 let yy=273+(st.flippingAt&&performance.now()-st.flippingAt<550?-Math.sin((performance.now()-st.flippingAt)/550*Math.PI)*105:0);
 let flip=st.flippingAt&&performance.now()-st.flippingAt<550?Math.abs(Math.cos((performance.now()-st.flippingAt)/550*Math.PI)):1;
 ctx.save();ctx.translate(360,yy);ctx.scale(1,flip);
 drawMeat(0,0,t,1,Math.sin(t*TAU)*.02);
 ctx.restore();
 drawSmoke(time,st.heating?1:.2);
 if(st.waitingFlip){
  ctx.save();roundRect(249,397,229,37,19,"#fff4d4e8","#efd5a6");ctx.fillStyle="#935d39";ctx.font="800 16px 'Outfit',sans-serif";ctx.textAlign="center";ctx.fillText("VIRE A CARNE",362,422);ctx.restore();
 }
 if(t>=1){drawSparkle(243,170,frame*.01);drawSparkle(476,150,frame*.009);}
}
function renderServe(){
 drawAssembly();
 for(let i=0;i<6;i++){
  const x=180+i*75,y=170+Math.sin(frame*.03+i*2)*14;
  drawSparkle(x,y,frame*.01+i);
 }
}
function render(timestamp){
 const dt=Math.min((timestamp-prev)/1000,.08);prev=timestamp;frame++;
 resize();
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.save();
 ctx.translate(logical.x,logical.y);ctx.scale(logical.s,logical.s);
 drawEnvironment(timestamp);
 if(st.phase===0)renderRawShape();
 if(st.phase===1)renderCut();
 if(st.phase===2)renderGrill(timestamp);
 if(st.phase===3)drawAssembly();
 if(st.phase===4)renderServe();
 ctx.restore();
 // Brilho discreto de transição sobre a própria bancada.
 const entering=safe((performance.now()-st.enteredAt)/490,0,1);
 if(entering<1){
   ctx.fillStyle="rgba(255,250,227,"+((1-ease(entering))*.40).toFixed(3)+")";
   ctx.fillRect(0,0,canvas.width,canvas.height);
 }
 if(st.phase===2&&st.heating&&!st.waitingFlip&&!st.finished){
  const previous=st.grill;
  st.grill=safe(st.grill+dt*24.5,0,100);
  if(previous<51&&st.grill>=51&&!st.flipped){
   st.grill=51;st.waitingFlip=true;st.heating=false;
   update();
  }else if(st.grill>=100){
   st.grill=100;st.heating=false;st.waitingFlip=false;
   sfx("done");autoAdvance(2,970);
  }else if(frame%9===0)status();
 }
 requestAnimationFrame(render);
}
function resize(){
 const r=canvas.getBoundingClientRect();
 const cssW=Math.max(1,r.width),cssH=Math.max(1,r.height);
 const dpr=Math.min(2,window.devicePixelRatio||1);
 if(canvas.width!==Math.round(cssW*dpr)||canvas.height!==Math.round(cssH*dpr)){
  canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);
 }
 const scale=Math.min(canvas.width/W,canvas.height/H);
 logical={s:scale,x:(canvas.width-W*scale)/2,y:(canvas.height-H*scale)/2};
}
function point(evt){
 const r=canvas.getBoundingClientRect(),dpr=canvas.width/Math.max(1,r.width);
 return {x:(evt.clientX-r.left)*dpr/logical.s-logical.x/logical.s,y:(evt.clientY-r.top)*dpr/logical.s-logical.y/logical.s};
}
function inBounds(p){return p.x>=95&&p.x<=617&&p.y>=75&&p.y<=420;}
function paintTools(){
 const list=$("toolList");let tools=[];
 if(st.phase===0)tools=[{id:"raw",name:"Carne fresca",detail:"Modele com o dedo"},{id:"board",name:"Tábua de madeira",detail:"Onde tudo começa"}];
 else if(st.phase===1)tools=[{id:"tomate",name:"Tomate fresco",detail:"Faça quatro cortes"},{id:"board",name:"Faca de cozinha",detail:"Deslize para cortar"}];
 else if(st.phase===2)tools=[{id:"carne",name:"Carne na chapa",detail:"Doure dos dois lados"},{id:"board",name:"Espátula",detail:"Vire no ponto certo"}];
 else if(st.phase===3)tools=palette.map(p=>({id:p.id,name:p.name,detail:p.description,active:st.ingredients.includes(p.id),interactive:true}));
 else tools=[{id:"carne",name:"Hambúrguer pronto",detail:"Chegou a hora de servir!"}];
 list.innerHTML=tools.map(p=>'<button type="button" class="tool-item '+(p.active?'active':'')+'" data-food="'+p.id+'" '+(!p.interactive||p.active?'disabled':'')+'><span class="thumb"><canvas width="112" height="112" data-thumb="'+p.id+'"></canvas></span><span><strong>'+p.name+'</strong><small>'+p.detail+'</small></span>'+(p.active?'<span class="check">✓</span>':'')+'</button>').join("");
 for(const node of list.querySelectorAll("[data-thumb]"))drawThumb(node,node.dataset.thumb);
}
function drawThumb(node,id){
 const t=node.getContext("2d");const old=ctx; // draw with shared scene context via temporary binding is not possible; use precise 2D thumbnail renderer.
 const r=56;
 t.save();t.clearRect(0,0,112,112);t.scale(1,1);
 const grad=(x,y,rr,a,b)=>{const g=t.createRadialGradient(x-12,y-14,2,x,y,rr);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
 const oval=(x,y,rx,ry,color)=>{t.beginPath();t.ellipse(x,y,rx,ry,0,0,TAU);t.fillStyle=color;t.fill();};
 oval(56,92,40,6,"#59463024");
 if(["raw","carne"].includes(id)){
  oval(56,60,43,24,grad(56,57,51,id==="raw"?"#f39c8d":"#d69c6e",id==="raw"?"#8f3b40":"#643c30"));
  for(let i=0;i<6;i++){t.beginPath();t.moveTo(26,49+i*5);t.lineTo(86,48+i*4);t.strokeStyle=id==="raw"?"#f8b5aa44":"#3a281e58";t.lineWidth=3;t.stroke();}
 }else if(id==="queijo"){
  t.beginPath();t.moveTo(13,43);t.lineTo(92,39);t.lineTo(87,83);t.lineTo(65,95);t.lineTo(55,72);t.lineTo(27,94);t.lineTo(17,72);t.closePath();t.fillStyle=grad(56,50,75,"#fff1ac","#e6b742");t.fill();
 }else if(id==="tomate"){
  oval(56,57,42,29,grad(56,53,46,"#f48f72","#ae3230"));oval(56,57,29,17,"#e44d42");
  for(let i=0;i<6;i++)oval(56+Math.cos(i*TAU/6)*18,57+Math.sin(i*TAU/6)*9,3,2,"#f9dcc0");
 }else if(id==="alface"){
  t.beginPath();t.moveTo(14,69);for(let i=0;i<20;i++){const x=14+i*4.5;t.lineTo(x,49+Math.sin(i*2)*10);}t.lineTo(100,76);t.lineTo(14,76);t.closePath();t.fillStyle=grad(56,55,53,"#d0e99d","#4d9550");t.fill();
 }else if(id==="pepino"){oval(56,56,40,28,grad(56,53,49,"#d0e7a0","#599044"));oval(56,56,27,18,"#a8cb78");}
 else if(id==="cebola"){oval(56,56,39,25,"#a985aa");oval(56,56,31,19,"#f4ebef");oval(56,56,20,12,"#ad8baf");oval(56,56,12,8,"#eee4ea");}
 else if(id==="board"){t.fillStyle="#ad7e54";t.beginPath();t.roundRect(19,28,77,64,12);t.fill();t.strokeStyle="#ebc69b";t.stroke();}
 t.restore();
}
function status(){
 let pct=0,text="";
 if(st.phase===0){pct=st.effort;text="Carne modelada";}
 else if(st.phase===1){pct=st.cuts*25;text="Tomate cortado";}
 else if(st.phase===2){pct=st.grill;text=st.waitingFlip?"Vire a carne!":"Carne grelhada";}
 else if(st.phase===3){pct=100*expected.filter(id=>st.ingredients.includes(id)).length/expected.length;text="Ingredientes pedidos";}
 else{pct=100;text="Pronto para servir";}
 $("actionStatus").firstChild.textContent=text+" ";
 $("actionPercent").textContent=Math.round(pct)+"%";
 $("progressFill").style.width=pct+"%";
}
function update(){
 const d=stageDefs[st.phase];
 $("stageCode").textContent=d.label;
 $("stageTitle").textContent=d.title;
 $("stageDescription").textContent=st.autoPhase===st.phase?"Ótimo trabalho! A próxima etapa começa automaticamente.":d.desc;
 $("stageCount").textContent=String(st.phase+1).padStart(2,"0")+" / 05";
 $("toolTitle").textContent=d.tool;
 $("toolDescription").textContent=d.info;
 $("canvasHint").textContent=st.autoPhase===st.phase?"ETAPA CONCLUÍDA · AVANÇANDO...":st.cutting?"FACA CORTANDO · AGUARDE O MOVIMENTO":st.waitingFlip?"TOQUE NA CARNE OU NO BOTÃO PARA VIRAR":d.hint;
 document.querySelectorAll(".step").forEach((node,i)=>{
  node.classList.toggle("active",i===st.phase);
  node.classList.toggle("done",i<st.phase);
 });
 const btn=$("mainAction");
 const labels={
  0:st.autoPhase===0?"Modelagem concluída ✓":"Modele a carne com o dedo",
  1:st.autoPhase===1?"Tomate cortado ✓":st.cutting?"Cortando devagar...":"Corte o tomate com quatro toques",
  2:st.waitingFlip?"Virar a carne":st.grill>=100?"Carne pronta ✓":"Grelhando na chapa...",
  3:st.autoPhase===3?"Montagem concluída ✓":"Adicione os ingredientes ao pão",
  4:"Entregando ao Theo..."
 };
 btn.textContent=labels[st.phase]||"Preparando...";
 const arrow=document.createElement("span");arrow.textContent=st.autoPhase===st.phase?"✓":st.waitingFlip?"↻":"→";btn.append(arrow);
 btn.disabled=!(st.phase===2&&st.waitingFlip);
 btn.classList.toggle("auto-transition",st.autoPhase===st.phase);
 paintTools();status();
}
function clearTimers(){
 if(st.cutTimer!=null)clearTimeout(st.cutTimer);
 if(st.autoTimer!=null)clearTimeout(st.autoTimer);
 st.cutTimer=null;st.autoTimer=null;st.cutting=false;st.autoPhase=-1;
}
function advancePhase(phase){
 clearTimers();
 st.drag=null;
 st.phase=phase;st.enteredAt=performance.now();
 if(phase===2){
  // Entrando na chapa, ela começa a aquecer sozinha.
  st.heating=true;st.grill=.1;sfx("sizzle");
 }
 if(phase===4){
  st.serveAt=performance.now();
  update();
  autoAdvance(4,1930);
  return;
 }
 update();
 sfx("done");
}
function autoAdvance(phase,delay=PHASE_DELAY){
 if(st.phase!==phase||st.finished||st.autoTimer!=null)return;
 st.autoPhase=phase;
 st.autoTimer=setTimeout(()=>{
  st.autoTimer=null;
  if(st.phase!==phase||st.finished)return;
  st.autoPhase=-1;
  if(phase===4)serve();
  else advancePhase(phase+1);
 },delay);
 update();
}
let audioCtx=null;
function sfx(kind){
 if(!st.sound)return;
 try{
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  if(!audioCtx)audioCtx=new AudioContext();
  if(audioCtx.state==="suspended")audioCtx.resume();
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime;
  osc.type=kind==="sizzle"?"sawtooth":"sine";
  const note={cut:340,shape:210,flip:260,drop:380,done:570,serve:660,sizzle:160}[kind]||300;
  osc.frequency.setValueAtTime(note,now);osc.frequency.exponentialRampToValueAtTime(note*(kind==="done"?1.35:.70),now+.15);
  gain.gain.setValueAtTime(kind==="sizzle"?.055:.085,now);gain.gain.exponentialRampToValueAtTime(.001,now+.18);
  osc.connect(gain).connect(audioCtx.destination);osc.start(now);osc.stop(now+.2);
 }catch(e){}
}
function voiceSpeak(text){if(voice){const res=voice.speak(text,voice.profile("Theo",1),{enabled:st.sound});if(res.reason==="voices-loading")$("canvasHint").textContent="CARREGANDO A VOZ DO THEO...";}}
function next(){
 if(st.phase!==2||!st.waitingFlip||st.flipped)return;
 st.flipped=true;st.flippingAt=performance.now();
 st.waitingFlip=false;st.heating=true;sfx("flip");
 update();
}
function cutAt(){
 if(st.phase!==1||st.cuts>=4||st.cutting||st.autoPhase===1)return;
 st.cutting=true;
 st.cutStartedAt=performance.now();
 sfx("cut");
 update();
 st.cutTimer=setTimeout(()=>{
  st.cutTimer=null;
  if(st.phase!==1||!st.cutting)return;
  st.cutting=false;st.cuts++;
  if(st.cuts>=4){sfx("done");autoAdvance(1,850);}
  else update();
 },KNIFE_DURATION);
}
function shapeAt(){
 if(st.phase!==0||st.effort>=100||st.autoPhase===0)return;
 st.effort=safe(st.effort+19,0,100);sfx("shape");status();
 if(st.effort>=100){sfx("done");autoAdvance(0,780);}
}
function addIngredient(id){
 if(st.phase!==3||st.autoPhase===3||st.ingredients.includes(id))return;
 st.ingredients.push(id);st.lastFood=id;st.foodAddedAt=performance.now();sfx("drop");
 const complete=expected.every(item=>st.ingredients.includes(item));
 if(complete){autoAdvance(3,1450);}
 else update();
}
function pointerDown(e){
 if(st.phase===2&&st.waitingFlip){
   next();return;
 }
 if(st.phase===0||st.phase===1){
  const p=point(e);if(!inBounds(p))return;
  st.drag={type:"work",id:e.pointerId,last:p,travel:0};
  try{canvas.setPointerCapture?.(e.pointerId)}catch(err){}
  if(st.phase===0)shapeAt();else cutAt();
 }
}
function pointerMove(e){
 const drag=st.drag;if(!drag||drag.type!=="work"||drag.id!==e.pointerId)return;
 const p=point(e),travel=Math.hypot(p.x-drag.last.x,p.y-drag.last.y);
 if(travel>25){drag.last=p;drag.travel+=travel;
  if(st.phase===0)shapeAt();else if(st.phase===1)cutAt();
 }
}
function pointerUp(e){if(st.drag?.type==="work"&&st.drag.id===e.pointerId)st.drag=null;}
canvas.addEventListener("pointerdown",pointerDown);
canvas.addEventListener("pointermove",pointerMove);
canvas.addEventListener("pointerup",pointerUp);
canvas.addEventListener("pointercancel",()=>{st.drag=null;});
let dragIngredient=null,ignoreClickUntil=0;
$("toolList").addEventListener("click",e=>{
 const b=e.target.closest("[data-food]");
 if(!b||b.disabled||performance.now()<ignoreClickUntil)return;
 addIngredient(b.dataset.food);
});
$("toolList").addEventListener("pointerdown",e=>{
 const b=e.target.closest("[data-food]");if(!b||b.disabled||st.phase!==3)return;
 dragIngredient={id:b.dataset.food,pointer:e.pointerId,x:e.clientX,y:e.clientY,moving:false,ghost:null};
 try{b.setPointerCapture(e.pointerId)}catch(err){}
});
document.addEventListener("pointermove",e=>{
 const d=dragIngredient;if(!d||e.pointerId!==d.pointer)return;
 if(!d.moving&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>12){
  d.moving=true;
  d.ghost=document.createElement("div");d.ghost.className="food-ghost";d.ghost.setAttribute("aria-hidden","true");
  d.ghost.innerHTML='<canvas width="112" height="112"></canvas>';
  document.body.append(d.ghost);
  drawThumb(d.ghost.querySelector("canvas"),d.id);
 }
 if(d.ghost){
  e.preventDefault();d.ghost.style.left=e.clientX+"px";d.ghost.style.top=e.clientY+"px";
 }
},{passive:false});
document.addEventListener("pointerup",e=>{
 const d=dragIngredient;if(!d||e.pointerId!==d.pointer)return;
 if(d.moving){
  ignoreClickUntil=performance.now()+250;
  const r=canvas.getBoundingClientRect();
  if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)addIngredient(d.id);
 }
 d.ghost?.remove();dragIngredient=null;
});
document.addEventListener("pointercancel",()=>{dragIngredient?.ghost?.remove();dragIngredient=null;});
const style=document.createElement("style");style.textContent=".food-ghost{position:fixed;z-index:100;pointer-events:none;transform:translate(-50%,-50%) rotate(-6deg);background:#fffaf0ef;border:2px solid #ddc59e;border-radius:16px;padding:8px;box-shadow:0 11px 23px #3e2b234d}.food-ghost canvas{width:64px;height:64px;display:block}";document.head.append(style);
function calcRating(){
 const good=expected.filter(id=>st.ingredients.includes(id)).length;
 const extra=st.ingredients.filter(id=>!expected.includes(id)).length;
 const missing=expected.length-good;
 const secs=Math.round((performance.now()-st.startedAt)/1000);
 const score=safe(100-22*missing-18*extra+(secs<85?4:0),0,100);
 const stars=score>=85?3:score>=60?2:score>=30?1:0;
 return {good,extra,missing,seconds:secs,score,stars,level:score>=85?"excellent":score>=60?"good":score>=30?"okay":"low"};
}
function serve(){
 if(st.finished)return;
 st.finished=true;st.rating=calcRating();
 const feedback=voice?voice.feedback({level:st.rating.level,elapsed:st.rating.seconds}):
 "Muito obrigado, Chefe Hanna!";
 st.lastLine=feedback;
 $("modalEyebrow").textContent="PEDIDO ENTREGUE · CHEF HANNA";
 $("modalTitle").textContent=st.rating.level==="excellent"?"Um hambúrguer de respeito!":st.rating.level==="good"?"Cliente satisfeito!":st.rating.level==="okay"?"Quase perfeito!":"Vamos melhorar essa receita!";
 $("modalText").textContent="“"+feedback+"”";
 $("modalScore").innerHTML='<span class="star">'+("★".repeat(st.rating.stars)||"☆")+'</span><div class="score-detail">'+st.rating.score+'% de satisfação · '+st.rating.good+' certos · '+st.rating.extra+' extras</div>';
 $("modalVisual").innerHTML=window.FoodArt?.person(2,"Theo")||'<span>★</span>';
 $("overlay").hidden=false;
 sfx("serve");voiceSpeak(feedback);
}
function restart(){
 voice?.cancel();clearTimers();st=initialState(st.sound);
 $("overlay").hidden=true;voice?.reset();update();
}
$("mainAction").addEventListener("click",next);
$("restart").addEventListener("click",restart);
$("playAgain").addEventListener("click",restart);
$("hearOrder").addEventListener("click",()=>voiceSpeak(orderText));
$("hearFeedback").addEventListener("click",()=>voiceSpeak(st.lastLine));
$("soundToggle").addEventListener("click",()=>{
 st.sound=!st.sound;$("soundToggle").textContent=st.sound?"♫":"♪̸";
 if(!st.sound)voice?.cancel();
});
update();
requestAnimationFrame(render);
window.BurgerPrototypeDebug={
 getState:()=>({phase:st.phase,effort:st.effort,cuts:st.cuts,cutting:st.cutting,knifeDuration:KNIFE_DURATION,autoPhase:st.autoPhase,grill:st.grill,flipped:st.flipped,heating:st.heating,ingredients:st.ingredients.slice(),finished:st.finished,rating:st.rating}),
 sceneReady:()=>canvas.width>0&&canvas.height>0,
 // Read-only state; all game actions are exercised through public controls.
};
})();
