import {filamentBrands,filamentTypes} from '../data/filamentCatalog';

export const matchKey=(value:string)=>value.normalize('NFD').replace(/\p{M}/gu,'')
 .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9+]/g,'');

const connectors=new Set(['a','as','o','os','de','da','das','do','dos','e','em','na','nas','no','nos','por','para','com','sem']);
const preferredWords=new Map(
 [...filamentTypes,...filamentBrands,'3D','QIDI','STL','G-code']
  .filter(name=>!name.includes(' ')).map(name=>[name.toLocaleLowerCase('pt-BR'),name])
);
const ambiguousAcronyms=new Set(['asa','pa','pc','pet']);
const capitalize=(word:string)=>word.charAt(0).toLocaleUpperCase('pt-BR')+word.slice(1);

export function formatCatalogName(input:string,official:readonly string[]=[]):string {
 const clean=input.trim().replace(/\s+/g,' ');
 const known=official.find(value=>matchKey(value)===matchKey(clean));
 if(known)return known;
 return clean.replace(/[\p{L}\p{M}\d]+(?:[’'+/-][\p{L}\p{M}\d]+)*\+?/gu,(word,offset:number,full:string)=>{
   const lower=word.toLocaleLowerCase('pt-BR');
   const preferred=preferredWords.get(lower);
   if(preferred&&(!ambiguousAcronyms.has(lower)||word===preferred))return preferred;
   if(lower==='cópia'&&full.slice(0,offset).endsWith('— '))return lower;
   if(lower.startsWith('d’'))return (offset===0?'D’':'d’')+capitalize(lower.slice(2));
   if(offset>0&&connectors.has(lower))return lower;
   if(/\d/u.test(word)&&/\p{L}/u.test(word))return word;
   return lower.split('-').map(capitalize).join('-');
  });
}

function oneEditApart(first:string,second:string):boolean {
 if(Math.abs(first.length-second.length)>1||first===second)return false;
 if(first.length>second.length)return oneEditApart(second,first);
 const index=[...first].findIndex((letter,i)=>letter!==second[i]);
 if(index===-1)return second.length===first.length+1;
 if(second.length>first.length)return first.slice(index)===second.slice(index+1);
 return first.slice(index+1)===second.slice(index+1)||
  first[index]===second[index+1]&&first[index+1]===second[index]&&first.slice(index+2)===second.slice(index+2);
}

export function similarCatalogName(input:string,options:readonly string[]):string|undefined {
 const key=matchKey(input);
 if(key.length<5||options.some(option=>matchKey(option)===key))return;
 return options.find(option=>oneEditApart(key,matchKey(option)));
}
