import {useState} from 'react';
export const matchKey=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g,'');
const acronyms=new Map([['pla','PLA'],['pla+','PLA+'],['petg','PETG'],['abs','ABS'],['asa','ASA'],['tpu','TPU'],['pa','PA'],['pc','PC'],['pva','PVA'],['esun','eSUN'],['sunlu','SUNLU'],['qidi','QIDI'],['3d','3D']]);
export function formatCatalogName(input:string,official:string[]=[]):string {
 const clean=input.trim().replace(/\s+/g,' ');
 const known=official.find(v=>matchKey(v)===matchKey(clean));
 if(known)return known;
 return clean.split(' ').map(word=>acronyms.get(word.toLocaleLowerCase('pt-BR'))??(word.charAt(0).toLocaleUpperCase('pt-BR')+word.slice(1).toLocaleLowerCase('pt-BR'))).join(' ');
}
export function suggestionsFor(input:string,choices:string[],limit=3):string[]{
 const term=matchKey(input);if(!term)return [];
 return [...new Set(choices)].filter(c=>matchKey(c)!==term).map((c,i)=>({c,i,k:matchKey(c)}))
 .filter(x=>x.k.startsWith(term)||x.k.includes(term))
 .sort((a,b)=>Number(b.k.startsWith(term))-Number(a.k.startsWith(term))||a.i-b.i).slice(0,limit).map(x=>x.c);
}
type Props={label:string;value:string;onChange:(text:string)=>void;options:string[];hint?:string;onBlur?:(text:string)=>void;placeholder?:string;id?:string};
export function SmartField({label,value,onChange,options,hint,onBlur,placeholder,id}:Props){
 const [focused,setFocused]=useState(false);
 const exact=options.find(o=>matchKey(o)===matchKey(value));
 const picks=focused?suggestionsFor(value,options):[];
 return <div className="smart-field">
  <input id={id} aria-label={label} autoComplete="off" placeholder={placeholder} value={value}
   onFocus={()=>setFocused(true)}
   onBlur={()=>{setFocused(false);onBlur?.(value);}}
   onChange={e=>onChange(e.target.value)} />
  {picks.length>0&&<div className="smart-suggestions" role="group" aria-label="Opções sugeridas">{picks.map(s=><button key={s} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(s);setFocused(false);onBlur?.(s);}}>{s}</button>)}</div>}
  <small className="smart-hint">{exact?'Opção já cadastrada.':hint??'Digite para encontrar opções existentes ou criar uma personalizada.'}</small>
 </div>;
}
