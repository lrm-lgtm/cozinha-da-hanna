/* Cozinha da Hanna — 24 missões declarativas, autoria original.
   Progresso armazenado somente no navegador.
*/
(function(root){
"use strict";
const ingredients={
massa:"Massa",queijo:"Queijo",tomate:"Tomate",milho:"Milho",pao:"Pão",carne:"Hambúrguer",
alface:"Alface",morango:"Morango",banana:"Banana",chocolate:"Chocolate",confeitos:"Confeitos",
casquinha:"Casquinha",pepino:"Pepino",cenoura:"Cenoura",panqueca:"Panqueca",mel:"Mel",
ovo:"Ovo",tigela:"Taça"
};
const recipes={
torrada:{label:"Torrada da manhã",base:"pao",needs:["pao","queijo","tomate"],action:"toast",station:"chapa",cook:true,art:"sanduiche"},
omelete:{label:"Omelete da chef",base:"ovo",needs:["ovo","queijo","tomate"],action:"stir",station:"chapa",cook:true,art:"burger"},
banana:{label:"Panqueca de banana",base:"panqueca",needs:["panqueca","banana","mel"],action:"stir",station:"chapa",cook:true,art:"panqueca"},
fruteira:{label:"Taça de frutas",base:"tigela",needs:["tigela","banana","morango"],action:"chop",station:"bancada",cook:false,art:"frutas"},
pizza_tomate:{label:"Pizza queijo e tomate",base:"massa",needs:["massa","queijo","tomate"],action:"spread",station:"forno",cook:true,art:"pizza"},
pizza_milho:{label:"Pizza de milho",base:"massa",needs:["massa","queijo","milho"],action:"spread",station:"forno",cook:true,art:"pizza"},
pizza_horta:{label:"Pizza da horta",base:"massa",needs:["massa","tomate","milho","alface"],action:"spread",station:"forno",cook:true,art:"pizza"},
pizza_especial:{label:"Pizza especial",base:"massa",needs:["massa","queijo","tomate","milho"],action:"spread",station:"forno",cook:true,art:"pizza"},
burger_queijo:{label:"Hambúrguer com queijo",base:"pao",needs:["pao","carne","queijo"],action:"grill",station:"chapa",cook:true,art:"burger"},
burger_salad:{label:"Hambúrguer com alface",base:"pao",needs:["pao","carne","alface"],action:"grill",station:"chapa",cook:true,art:"burger"},
sanduiche_ovo:{label:"Sanduíche de ovo",base:"pao",needs:["pao","ovo","alface"],action:"toast",station:"chapa",cook:true,art:"sanduiche"},
burger_completo:{label:"Hambúrguer completo",base:"pao",needs:["pao","carne","queijo","tomate","alface"],action:"grill",station:"chapa",cook:true,art:"burger"},
sorvete_morango:{label:"Sorvete de morango",base:"casquinha",needs:["casquinha","morango","confeitos"],action:"scoop",station:"bancada",cook:false,art:"sorvete"},
sorvete_chocolate:{label:"Sorvete de chocolate",base:"casquinha",needs:["casquinha","chocolate","confeitos"],action:"scoop",station:"bancada",cook:false,art:"sorvete"},
doce_banana:{label:"Panqueca doce",base:"panqueca",needs:["panqueca","banana","chocolate"],action:"stir",station:"chapa",cook:true,art:"panqueca"},
frutas_mel:{label:"Frutas com mel",base:"tigela",needs:["tigela","morango","banana","mel"],action:"chop",station:"bancada",cook:false,art:"frutas"},
salada:{label:"Salada crocante",base:"alface",needs:["alface","tomate","pepino"],action:"chop",station:"bancada",cook:false,art:"salada"},
salada_milho:{label:"Salada de milho",base:"alface",needs:["alface","milho","cenoura"],action:"chop",station:"bancada",cook:false,art:"salada"}
};
const chapterDefs=[
{id:"manha",title:"Café da Manhã",description:"As primeiras receitas da chef",color:"#d89865",tone:"#f4dfbe",icon:"☀️",station:"Bancada",missions:[
["manha-01","A primeira torrada","torrada","Aprenda a usar a chapa."],
["manha-02","Omelete da manhã","omelete","Misture e prepare os ovos."],
["manha-03","Hora da panqueca","banana","Prepare uma panqueca macia."],
["manha-04","Café caprichado","fruteira","Corte e monte uma taça de frutas."]
]},
{id:"pizza",title:"Pizzaria",description:"Da massa ao forno",color:"#bb6854",tone:"#f4d4bf",icon:"🍕",station:"Forno",missions:[
["pizza-01","Abrindo a massa","pizza_tomate","Espalhe o molho e monte a primeira pizza."],
["pizza-02","Milho dourado","pizza_milho","Uma cobertura diferente."],
["pizza-03","Pizza da horta","pizza_horta","Novas cores e ingredientes."],
["pizza-04","Especial da Hanna","pizza_especial","Uma pizza com quatro ingredientes."]
]},
{id:"lanche",title:"Lanchonete",description:"Chapa quente e sanduíches",color:"#a78254",tone:"#eee0c6",icon:"🍔",station:"Chapa",missions:[
["lanche-01","Primeiro hambúrguer","burger_queijo","Grelhe e monte o seu lanche."],
["lanche-02","Verde crocante","burger_salad","Acrescente folhas frescas."],
["lanche-03","Sanduíche especial","sanduiche_ovo","Um novo pedido na chapa."],
["lanche-04","Combo campeão","burger_completo","O desafio com cinco ingredientes."]
]},
{id:"doce",title:"Doceria",description:"Sorvetes e receitas doces",color:"#b77898",tone:"#f2d5e3",icon:"🍨",station:"Balcão gelado",missions:[
["doce-01","Meu primeiro sorvete","sorvete_morango","Sirva e decore uma casquinha."],
["doce-02","Chuva de chocolate","sorvete_chocolate","Escolha os ingredientes doces."],
["doce-03","Panqueca doce","doce_banana","Misture e prepare a sobremesa."],
["doce-04","Taça especial","frutas_mel","Prepare frutas e finalize com mel."]
]},
{id:"lotado",title:"Restaurante Cheio",description:"Mais de um pedido por vez",color:"#718e8b",tone:"#d7e5e2",icon:"🧾",station:"Salão",missions:[
["lotado-01","Dois clientes","pizza_tomate","Atenda a pizza e depois a salada.",["pizza_tomate","salada"]],
["lotado-02","Combo e sobremesa","burger_queijo","Monte o lanche e o sorvete.",["burger_queijo","sorvete_morango"]],
["lotado-03","Pedido diferente","pizza_milho","Pizza e sobremesa de chocolate.",["pizza_milho","sorvete_chocolate"]],
["lotado-04","A casa está cheia","burger_completo","Dois pratos mais elaborados.",["burger_completo","frutas_mel"]]
]},
{id:"festa",title:"A Grande Festa",description:"Desafios especiais e convidados",color:"#987aa4",tone:"#e6d9ee",icon:"🎉",station:"Salão de festas",missions:[
["festa-01","Preparando a festa","pizza_especial","Uma grande pizza para começar.",["pizza_especial","sorvete_morango"]],
["festa-02","Mesa colorida","salada_milho","Dois pratos cheios de cor.",["salada_milho","frutas_mel"]],
["festa-03","Todo mundo com fome","burger_completo","Capriche no lanche e na pizza.",["burger_completo","pizza_tomate"]],
["festa-04","Grande final da Hanna","pizza_especial","A festa termina com três pedidos!",["pizza_especial","burger_queijo","sorvete_chocolate"]]
]}
];
const chapters=chapterDefs.map((ch,chapterIndex)=>({...ch,index:chapterIndex,missions:ch.missions.map((raw,index)=>{
const [id,title,recipe,hint,orders]=raw;return {id,title,recipe,hint,chapter:ch.id,chapterIndex,index,orders:orders||[recipe]};
})}));
const missions=chapters.flatMap(ch=>ch.missions);
function get(id){return missions.find(m=>m.id===id)||null;}
function unlocked(id,progress){const index=missions.findIndex(m=>m.id===id);if(index<=0)return index===0;const prev=missions[index-1];return !!progress?.[prev.id]?.completed;}
function next(id){const i=missions.findIndex(m=>m.id===id);return missions[i+1]||null;}
root.HannaMissions={ingredients,recipes,chapters,missions,get,unlocked,next};
})(window);
