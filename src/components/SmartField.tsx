import {useId,useState} from 'react';
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
 const generated=useId();
 const inputId=id??generated;
 const hintId=inputId+'-hint',listId=inputId+'-suggestions';
 const [focused,setFocused]=useState(false);
 const [active,setActive]=useState(-1);
 const exact=options.find(o=>matchKey(o)===matchKey(value));
 const picks=focused?suggestionsFor(value,options):[];
 const pick=(text:string)=>{onChange(text);onBlur?.(text);setFocused(false);setActive(-1);};
 return <div className="smart-field">
  <input id={inputId} aria-label={label} aria-describedby={hintId} autoComplete="off"
   role="combobox" aria-autocomplete="list" aria-expanded={picks.length>0} aria-controls={picks.length?listId:undefined}
   aria-activedescendant={active>=0&&active<picks.length?listId+'-'+active:undefined}
   placeholder={placeholder} value={value}
   onFocus={()=>setFocused(true)}
   onBlur={()=>{setFocused(false);setActive(-1);onBlur?.(value);}}
   onChange={e=>{onChange(e.target.value);setActive(-1);}}
   onKeyDown={e=>{
    if(picks.length&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();setActive(old=>e.key==='ArrowDown'?(old+1)%picks.length:old<=0?picks.length-1:old-1);}
    if(picks.length&&e.key==='Enter'&&active>=0&&active<picks.length){e.preventDefault();pick(picks[active]);}
    if(e.key==='Escape'){setFocused(false);setActive(-1);}
   }}/>
  {picks.length>0&&<div className="smart-suggestions" role="listbox" id={listId} aria-label={'Sugestões para '+label}>
   {picks.map((s,i)=><button key={s} id={listId+'-'+i} role="option" aria-selected={i===active} type="button"
    onMouseDown={e=>e.preventDefault()} onClick={()=>pick(s)}>{s}</button>)}
  </div>}
  <small id={hintId} className="smart-hint">{exact?'Opção já cadastrada.':hint??'Digite para encontrar opções existentes ou criar uma personalizada.'}</small>
 </div>;
}
