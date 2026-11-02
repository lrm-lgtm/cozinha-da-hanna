/* Ilustracoes vetoriais originais para os clientes e estacoes. */
(function(root){
"use strict";
const people=[
["Sofia","#c58b62","#302b29","#dd857e",0,"bow"],
["Theo","#a96949","#2d2631","#75a39d",1,"glasses"],
["Nina","#e4b68e","#855636","#ba90b9",2,"band"],
["Davi","#9b6047","#2e2826","#c69c63",3,"cap"],
["Lili","#d9a07a","#4c3333","#7d9fa1",4,"clip"],
["Pedro","#edbf93","#875337","#8b96b6",5,"none"],
["Bia","#87583e","#282528","#c47b94",6,"glasses"],
["Caio","#dfac80","#3a3030","#92a879",7,"none"]
];
function person(index,feeling){
 const p=people[((index%people.length)+people.length)%people.length];
 const [name,skin,hair,shirt,style,accessory]=p;
 const hairstyles=[
 '<path d="M44 105Q20 25 89 25q69 1 68 80l-22-34-28-11-42 7Z" fill="'+hair+'"/>',
 '<path d="M45 94Q25 34 86 24q63-7 69 73L135 68Q107 75 82 59L53 75Z" fill="'+hair+'"/>',
 '<path d="M43 97Q20 29 78 18q72-8 78 75l-9 55-18-25-2-51-66-6-4 60-17 22Z" fill="'+hair+'"/>',
 '<path d="M42 96Q17 48 51 29q48-34 92 9 14 24 10 58l-27-36-34 14-39-15Z" fill="'+hair+'"/>',
 '<path d="M46 91Q18 29 80 20q76-1 76 83l3 45-18 8-13-85-65-4-5 80-20 10Z" fill="'+hair+'"/>',
 '<path d="M44 94Q29 36 77 24q61-4 75 68l-30-32-36 5-35-4Z" fill="'+hair+'"/>',
 '<path d="M42 99Q13 40 47 21q28-20 53-2 42-13 55 36l-13 44-21-28-49 2Z" fill="'+hair+'"/>',
 '<path d="M42 98Q20 43 52 30q46-29 91 6 15 25 10 62l-29-33-45 8-24-9Z" fill="'+hair+'"/>'
 ];
 const acc={
 bow:'<path d="M135 60l20-9-4 21-16-5-20 17-5-18Z" fill="#ed9d98"/><circle cx="135" cy="68" r="6" fill="#ffded4"/>',
 glasses:'<g fill="none" stroke="#654d3c" stroke-width="4"><circle cx="77" cy="106" r="16"/><circle cx="118" cy="106" r="16"/><path d="M93 106h10"/></g>',
 band:'<path d="M51 51Q98 7 144 54" fill="none" stroke="#edd8b2" stroke-width="10"/>',
 cap:'<path d="M47 69q17-53 94-19l12 24q-50-6-106-5Z" fill="#698cb8"/>',
 clip:'<rect x="122" y="61" width="23" height="9" rx="4" fill="#f9d67a" transform="rotate(20 125 62)"/>',
 none:''
 };
 const mouth=feeling==='sad'?'<path d="M86 149q12-11 25 0" fill="none" stroke="#884d46" stroke-width="4"/>':feeling==='surprised'?'<ellipse cx="98" cy="147" rx="8" ry="10" fill="#884d46"/>':'<path d="M83 140q14 16 29 0" fill="none" stroke="#884d46" stroke-width="4"/>';
 return '<svg class="portrait" viewBox="0 0 200 234" role="img" aria-label="Cliente '+name+'" xmlns="http://www.w3.org/2000/svg">'+
 '<ellipse cx="100" cy="223" rx="70" ry="9" fill="#69513b" opacity=".16"/>'+
 '<path d="M34 223q3-61 30-70 36-18 76 2 26 15 26 68Z" fill="'+shirt+'" stroke="#fff4df" stroke-width="4"/>'+
 '<path d="M63 173q37 22 75 0" stroke="#fff5ed" opacity=".6" stroke-width="8" fill="none"/>'+
 '<rect x="88" y="147" width="25" height="26" rx="10" fill="'+skin+'"/>'+
 '<ellipse cx="100" cy="102" rx="50" ry="60" fill="'+skin+'" stroke="#846044" stroke-opacity=".24" stroke-width="2"/>'+
 hairstyles[style]+acc[accessory]+
 '<path d="M62 90q12-8 27-2m21-1q15-7 27 4" fill="none" stroke="'+hair+'" stroke-width="4" stroke-linecap="round"/>'+
 '<ellipse cx="78" cy="106" rx="5" ry="6" fill="#262422"/><ellipse cx="120" cy="106" rx="5" ry="6" fill="#262422"/>'+
 '<circle cx="79" cy="104" r="1.6" fill="white"/><circle cx="121" cy="104" r="1.6" fill="white"/>'+
 '<path d="M97 113l-3 17q6 5 13 0" stroke="#a06a52" stroke-width="3" fill="none"/>'+
 '<ellipse cx="64" cy="132" rx="12" ry="6" fill="#e98780" opacity=".32"/><ellipse cx="137" cy="132" rx="12" ry="6" fill="#e98780" opacity=".32"/>'+
 mouth+'</svg>';
}
function food(id,type){
 if(!root.FoodArt)return '';
 try{return type==='dish'?root.FoodArt.dish(id):root.FoodArt.ingredient(id);}catch(e){return '';}
}
const stations={
 forno:'<svg viewBox="0 0 180 150"><rect x="15" y="4" width="150" height="138" rx="20" fill="#597769" stroke="#e8e3cf" stroke-width="7"/><rect x="31" y="38" width="120" height="87" rx="12" fill="#263f3c" stroke="#bbd2c2" stroke-width="5"/><path d="M49 109q5-23 20-10t22 0 30-2" fill="none" stroke="#dfab65" stroke-width="9" opacity=".8"/><rect x="43" y="14" width="70" height="10" rx="5" fill="#d0daca"/><circle cx="135" cy="19" r="8" fill="#f2cc85"/></svg>',
 chapa:'<svg viewBox="0 0 180 150"><rect x="12" y="56" width="156" height="68" rx="12" fill="#7a9b8a" stroke="#e4e0c6" stroke-width="6"/><rect x="22" y="41" width="134" height="24" rx="8" fill="#354e48"/><path d="M38 55h101" stroke="#eaa564" stroke-width="6" stroke-linecap="round"/><circle cx="43" cy="92" r="11" fill="#cfb378"/><circle cx="82" cy="92" r="11" fill="#cfb378"/><circle cx="121" cy="92" r="11" fill="#cfb378"/></svg>',
 bancada:'<svg viewBox="0 0 180 150"><ellipse cx="90" cy="87" rx="65" ry="38" fill="#e4be8c" stroke="#ae8a61" stroke-width="7"/><path d="M49 80q41-26 84 0" stroke="#fff4da" stroke-width="7" fill="none"/><path d="M133 15q-26 44-7 66" stroke="#9b6c55" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="124" cy="81" rx="10" ry="14" fill="#c0c8af"/></svg>'
};
root.HannaMissionArt={person,food,stations,people};
})(window);
