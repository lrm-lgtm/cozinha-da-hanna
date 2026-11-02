/* Cozinha da Hanna | Falas e vozes v4
   Usa Web Speech SpeechSynthesis, sem APIs remotas, credenciais ou coleta de dados.
   Prefere vozes naturais/neurais que já existam no aparelho; fallback do navegador.
*/
(function(root){
"use strict";
const natural=/natural|neural|online|premium|enhanced|aria|multilingual|google português|microsoft/i;
const female=/francisca|luciana|maria|helena|camila|raquel|vitoria|vitória|isabela|female|feminina|mulher/i;
const male=/antonio|antônio|daniel|ricardo|paulo|felipe|marcos|male|masculino|homem/i;
const men=new Set(["Theo","Davi","Pedro"]);
const personalities={
  Nina:{style:"gentil",rate:.97,pitch:1.04},
  Sofia:{style:"animada",rate:1.03,pitch:1.10},
  Theo:{style:"brincalhao",rate:1.00,pitch:.95},
  Bia:{style:"curiosa",rate:1.00,pitch:1.06},
  Lili:{style:"doce",rate:.94,pitch:1.08},
  Davi:{style:"tranquilo",rate:.96,pitch:.93},
  Pedro:{style:"apressado",rate:1.04,pitch:.96}
};
const opening={
  main:[
    "Oi, chefe Hanna! {pedido}",
    "Olá, Hanna! Olha só o que eu queria hoje: {pedido}",
    "Chefe Hanna, posso fazer um pedido? {pedido}",
    "Que bom que você abriu o restaurante! {pedido}",
    "Tô com fome, Hanna! {pedido}",
    "Bom te ver, Hanna. {pedido}",
    "Hanna, capricha pra mim, tá? {pedido}",
    "Hoje eu vou deixar a cozinha me surpreender. {pedido}",
    "E aí, chefe Hanna! {pedido}",
    "Oi, pessoal da cozinha! {pedido}"
  ],
  dessert:[
    "Adorei a refeição, Hanna! Agora quero uma sobremesa. {pedido}",
    "Chefe Hanna, ainda cabe um docinho! {pedido}",
    "Hanna, chegou minha parte favorita: a sobremesa! {pedido}",
    "Agora vamos adoçar o dia, chefe Hanna. {pedido}",
    "Muito bom! Para terminar, {pedido}",
    "Tenho um espacinho reservado pra sobremesa, Hanna. {pedido}",
    "O prato principal já foi, agora quero experimentar o doce! {pedido}",
    "Que tal terminar com uma sobremesa, chefe Hanna? {pedido}"
  ]
};
const bank={
  excellent:{
    fast:[
      "A comida veio rapidinho e está deliciosa! Parabéns, chefe Hanna!",
      "Que maravilha, Hanna! Você acertou tudo e ainda foi super-rápida!",
      "Nossa, chef Hanna! Um prato perfeito e sem demora. Adorei!",
      "Que comida maravilhosa! Veio num instante, chefe Hanna!",
      "Hanna, nota dez! Ficou delicioso e chegou voando da cozinha!",
      "Parabéns, chefe Hanna! A comida veio rápida, quentinha e perfeita!"
    ],
    regular:[
      "Que comida maravilhosa, chefe Hanna! Você acertou tudo!",
      "Hanna, ficou delicioso! Era exatamente o que eu pedi.",
      "Você manda muito na cozinha, chef Hanna! Eu adorei.",
      "Que capricho, Hanna! Esse prato ficou perfeito.",
      "Valeu a pena esperar, chefe Hanna. Que delícia!",
      "Amei! Quero voltar pra provar outra receita sua, Hanna!"
    ]
  },
  good:{
    fast:[
      "Chegou rapidinho, Hanna! Muito gostoso, só mudou um detalhezinho.",
      "Nossa, que rapidez, chefe Hanna! Está bom, mas ficou um pouquinho diferente.",
      "Gostei, Hanna! Foi rápido e quase igual ao meu pedido.",
      "Que agilidade! Na próxima, só confere os ingredientes, tá, chef?"
    ],
    regular:[
      "Gostei, chef Hanna! Só faltou um pequeno detalhe do meu pedido.",
      "Ficou bom, Hanna! Da próxima vez, capricha na comanda.",
      "Tá gostoso, chefe Hanna! Eu só trocaria um ingrediente.",
      "Obrigada pelo carinho, Hanna! Ficou quase como eu pedi.",
      "Humm, que cheirinho bom! Só ficou um pouquinho diferente, chef."
    ]
  },
  okay:{
    fast:[
      "Foi rapidinho, chefe Hanna, mas alguns ingredientes não eram os meus.",
      "Hanna, você correu na cozinha! Acho que faltou conferir meu pedido.",
      "Nossa, chegou rápido! Mas esse prato saiu bem diferente, Hanna.",
      "Que pressa, chef! Da próxima, confere minha comanda com calma."
    ],
    regular:[
      "Hanna, acho que você trocou alguns ingredientes do meu pedido.",
      "Chefe Hanna, dessa vez ficou diferente, mas você pode tentar de novo!",
      "Quase lá, Hanna! Vou te contar: faltaram algumas coisinhas.",
      "Opa, Hanna, acho que a cozinha se confundiu um pouquinho.",
      "Não foi bem como eu pedi, chef Hanna. Vamos melhorar na próxima?"
    ]
  },
  low:{
    fast:[
      "Ô, Hanna! Você foi rápida, mas errou meu pedido!",
      "Chefe Hanna, chegou depressa, só que esse não é o prato que escolhi.",
      "Hanna, calma na cozinha! Foi rápido, mas faltou conferir o pedido.",
      "Ô, chefe Hanna, os ingredientes vieram trocados!"
    ],
    regular:[
      "Ô, Hanna, você errou meu pedido. Que tal tentar de novo?",
      "Chefe Hanna, acho que trouxeram o prato de outra pessoa!",
      "Hanna, esse não é o pedido que eu fiz. Vamos conferir a comanda?",
      "Ei, chef Hanna! Faltaram ingredientes e vieram outros no lugar.",
      "Acho que deu uma confusão na cozinha, Hanna. Você consegue melhorar!",
      "Hanna, fiquei esperando, mas o prato veio diferente do combinado."
    ]
  }
};
const used=new Set();
const assignedVoices=new Map();
let lastText="";
let lastVoiceName="";
function sample(list,key){
 if(!list||!list.length)return "";
 const choices=list.filter(s=>!used.has(key+"|"+s));
 const arr=choices.length?choices:list;
 const chosen=arr[Math.floor(Math.random()*arr.length)];
 if(!choices.length)for(const item of list)used.delete(key+"|"+item);
 used.add(key+"|"+chosen);
 return chosen;
}
function profile(name,index=0){
 const p=personalities[name]||{style:"gentil",rate:1,pitch:1};
 return {name,style:p.style,gender:men.has(name)?"male":"female",rate:p.rate,pitch:p.pitch,slot:index};
}
function cleanRequest(s){return String(s||"").replace(/\s+/g," ").trim();}
function request(original,course,name){
 const base=cleanRequest(original);
 const mode=course==="dessert"?"dessert":"main";
 const sentence=sample(opening[mode],mode);
 const lower=sentence.includes("terminar, {pedido}")?base.charAt(0).toLowerCase()+base.slice(1):base;
 return sentence.replace("{pedido}",lower);
}
function feedback(result){
 const level=bank[result.level]?result.level:"okay";
 const quick=typeof result.elapsed==="number"&&result.elapsed<=55;
 const group=quick?"fast":"regular";
 return sample(bank[level][group],level+"|"+group);
}
function voiceScore(v,p){
 const nm=(v.name||"");
 const lang=(v.lang||"").replace("_","-");
 const detected=p.gender==="female"?female.test(nm):male.test(nm);
 const other=p.gender==="female"?male.test(nm):female.test(nm);
 return (lang.toLowerCase()==="pt-br"?100:0)+(natural.test(nm)?38:0)+(detected?28:0)-(other?24:0)+(v.localService===false?8:0);
}
function voices(){
 const engine=root.speechSynthesis;
 if(!engine||typeof engine.getVoices!=="function")return [];
 try{return engine.getVoices().filter(v=>/^pt([-_]|$)/i.test(v.lang||""));}catch(e){return [];}
}
function pickVoice(p){
 const pool=voices();if(!pool.length)return null;
 const id=p.name;
 const previous=assignedVoices.get(id);
 if(previous){const found=pool.find(v=>v.voiceURI===previous);if(found)return found;}
 const sorted=pool.slice().sort((a,b)=>voiceScore(b,p)-voiceScore(a,p));
 // Para cada personagem, preserve a identidade vocal. Quando houver opções
 // equivalentes, alterne entre vozes ao invés de deixar todos iguais.
 const best=voiceScore(sorted[0],p);
 const near=sorted.filter(v=>voiceScore(v,p)>=best-14);
 const chosen=near[p.slot%near.length]||sorted[0];
 assignedVoices.set(id,chosen.voiceURI);
 return chosen;
}
function cancel(){try{root.speechSynthesis?.cancel();}catch(e){}}
function speak(text,p,opts={}){
 if(!opts.enabled)return {spoken:false,reason:"muted"};
 if(!root.speechSynthesis||!root.SpeechSynthesisUtterance)return {spoken:false,reason:"unsupported"};
 try{
   cancel();
   const u=new root.SpeechSynthesisUtterance(cleanRequest(text));
   u.lang="pt-BR";
   const selected=pickVoice(p);
   if(selected)u.voice=selected;
   // Ajustes moderados: pitch exagerado produz timbre artificial.
   u.rate=Math.max(.88,Math.min(1.07,p.rate||1));
   u.pitch=Math.max(.91,Math.min(1.12,p.pitch||1));
   u.volume=1;
   u.onerror=()=>{if(typeof opts.onError==="function")opts.onError();};
   root.speechSynthesis.speak(u);
   lastText=text;lastVoiceName=selected?.name||"voz padrão do navegador";
   return {spoken:true,voice:lastVoiceName,quality:selected&&natural.test(selected.name||"")?"preferred":"system"};
 }catch(e){return {spoken:false,reason:"error"};}
}
function reset(){used.clear();assignedVoices.clear();lastText="";lastVoiceName="";}
function inspect(){return {available:voices().map(v=>({name:v.name,lang:v.lang,local:v.localService})),lastVoiceName,lastText};}
root.HannaVoice={profile,request,feedback,pickVoice,speak,cancel,reset,inspect,bank};
})(window);
