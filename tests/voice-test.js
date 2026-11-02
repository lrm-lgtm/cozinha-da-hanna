'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const uttered=[];
class Utterance {
 constructor(text){this.text=text;this.lang='';this.voice=null;}
}
const available=[
 {name:'Microsoft Francisca Online (Natural) - Portuguese (Brazil)',lang:'pt-BR',voiceURI:'f-natural',localService:false},
 {name:'Microsoft Antonio Online (Natural) - Portuguese (Brazil)',lang:'pt-BR',voiceURI:'m-natural',localService:false},
 {name:'Português Brasil genérico',lang:'pt-BR',voiceURI:'generic',localService:true},
 {name:'Português Portugal',lang:'pt-PT',voiceURI:'portugal',localService:true}
];
const root={
 SpeechSynthesisUtterance:Utterance,
 speechSynthesis:{
  getVoices:()=>available,
  speak:u=>uttered.push(u),
  cancel:()=>{}
 }
};
vm.runInNewContext(fs.readFileSync('assets/voice-engine.js','utf8'),{window:root});
const kit=root.HannaVoice;
assert.ok(kit,'Motor de voz deve estar globalmente acessível');
for(const name of ['Sofia','Theo','Nina','Davi']){
 const p=kit.profile(name,0);
 assert.ok(p.rate>=.88&&p.rate<=1.07);
 assert.ok(p.pitch>=.91&&p.pitch<=1.12);
}
let p=kit.profile('Sofia',0);
assert.equal(kit.pickVoice(p).voiceURI,'f-natural','Sofia deve priorizar voz feminina natural');
assert.ok(kit.speak('Chefe Hanna, que delícia!',p,{enabled:true}).spoken);
assert.equal(uttered.at(-1).voice.voiceURI,'f-natural');
p=kit.profile('Theo',0);
assert.equal(kit.pickVoice(p).voiceURI,'m-natural','Theo deve priorizar voz masculina natural');
kit.speak('Oi, chefe Hanna!',p,{enabled:true});
assert.equal(uttered.at(-1).voice.voiceURI,'m-natural');
assert.equal(kit.speak('Silêncio',p,{enabled:false}).spoken,false);
assert.equal(uttered.length,2);
for(const course of ['main','dessert']){
 const lines=new Set();
 for(let i=0;i<8;i++){
  const sentence=kit.request('Quero uma pizza com queijo e tomate!',course,'Sofia');
  assert.match(sentence,/pizza/i);
  assert.match(sentence,/queijo e tomate/i);
  lines.add(sentence);
 }
 assert.ok(lines.size>=5,'Variedade de pedidos insuficiente em '+course);
}
for(const level of ['excellent','good','okay','low']){
 for(const elapsed of [12,80]){
  const lines=new Set();
  for(let i=0;i<8;i++){
   const line=kit.feedback({level,elapsed});
   assert.match(line,/hanna/i);
   lines.add(line);
  }
  assert.ok(lines.size>=4,'Pouca variação: '+level+' '+elapsed);
 }
}

assert.equal(kit.pronunciation("Oi, Hanna. Tudo bem, Chefe Hanna?"),"Oi, Ranna. Tudo bem, Chefe Ranna?");
assert.equal(kit.pronunciation("Não é Hannah, nem banana!"),"Não é Hannah, nem banana!");
let sample=kit.speak("Parabéns, Chefe Hanna! Seu restaurante está lindo.",kit.profile("Sofia",0),{enabled:true});
assert.ok(sample.spoken);
assert.equal(uttered.at(-1).text,"Parabéns, Chefe Ranna! Seu restaurante está lindo.");
assert.equal(kit.inspect().lastText,"Parabéns, Chefe Hanna! Seu restaurante está lindo.","Texto visível preservado");
assert.equal(kit.setPronunciation("Hâna"),true);
kit.speak("Hanna, seu pedido chegou.",kit.profile("Sofia",0),{enabled:true});
assert.equal(uttered.at(-1).text,"Hâna, seu pedido chegou.");
assert.equal(kit.setPronunciation("Ranna"),true);
assert.equal(kit.setVoicePreference("female","generic"),true);
kit.speak("Oi, Hanna",kit.profile("Sofia",0),{enabled:true});
assert.equal(uttered.at(-1).voice.voiceURI,"generic","Escolha manual de voz deve prevalecer");
assert.equal(kit.setVoicePreference("female",""),true);
assert.ok(kit.availableVoices().length>=3);
assert.ok(kit.aliases.includes("Ranna")&&kit.aliases.includes("Hanna"));
kit.reset();
assert.equal(kit.inspect().lastText,'');
const tinyRoot={SpeechSynthesisUtterance:Utterance,speechSynthesis:{getVoices:()=>[],speak:u=>uttered.push(u),cancel:()=>{}}};
vm.runInNewContext(fs.readFileSync('assets/voice-engine.js','utf8'),{window:tinyRoot});
assert.equal(tinyRoot.HannaVoice.pickVoice(tinyRoot.HannaVoice.profile('Lili',0)),null);
assert.equal(tinyRoot.HannaVoice.speak('Olá!',tinyRoot.HannaVoice.profile('Lili',0),{enabled:true}).spoken,true);
console.log('PASS: vozes naturais pt-BR, preferência por gênero, 64 reações variadas, variação de pedidos e fallback.');
