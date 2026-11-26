import {useEffect,useId,useRef,useState} from 'react';
import {matchKey} from '../domain/catalogName';
export {formatCatalogName,matchKey} from '../domain/catalogName';
export function suggestionsFor(input:string,choices:string[],limit=3):string[]{
 const term=matchKey(input);if(!term)return [];
 return [...new Set(choices)].filter(c=>matchKey(c)!==term).map((c,i)=>({c,i,k:matchKey(c)}))
 .filter(x=>x.k.startsWith(term)||x.k.includes(term))
 .sort((a,b)=>Number(b.k.startsWith(term))-Number(a.k.startsWith(term))||a.i-b.i).slice(0,limit).map(x=>x.c);
}
type Props={label:string;value:string;onChange:(text:string)=>void;options:string[];hint?:string;onBlur?:(text:string)=>void;placeholder?:string;id?:string;browseOnFocus?:boolean};
export function SmartField({label,value,onChange,options,hint,onBlur,placeholder,id,browseOnFocus=false}:Props){
 const generated=useId();
 const inputId=id??generated;
 const hintId=inputId+'-hint',listId=inputId+'-suggestions';
 const [focused,setFocused]=useState(false);
 const [browsing,setBrowsing]=useState(false);
 const list=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(-1);
 const exact=options.find(o=>matchKey(o)===matchKey(value));
 const picks=focused?(browsing?options:suggestionsFor(value,options)):[];
 useEffect(()=>{
  const viewport=list.current;
  const option=viewport?.children[active] as HTMLElement|undefined;
  if(!viewport||!option)return;
  const {top,bottom}=option.getBoundingClientRect();
  const bounds=viewport.getBoundingClientRect();
  if(top<bounds.top)viewport.scrollTop-=bounds.top-top;
  else if(bottom>bounds.bottom)viewport.scrollTop+=bottom-bounds.bottom;
 },[active]);
 const open=()=>{setFocused(true);setBrowsing(browseOnFocus);setActive(-1);};

 const pick=(text:string)=>{onChange(text);onBlur?.(text);setFocused(false);setActive(-1);};
 return <div className="smart-field">
  <input id={inputId} aria-label={label} aria-describedby={hintId} autoComplete="off"
   role="combobox" aria-autocomplete="list" aria-expanded={picks.length>0} aria-controls={picks.length?listId:undefined}
   aria-activedescendant={active>=0&&active<picks.length?listId+'-'+active:undefined}
   placeholder={placeholder} value={value}
   onFocus={open}
   onClick={()=>{if(!focused)open();}}
   onBlur={()=>{setFocused(false);setActive(-1);onBlur?.(value);}}
   onChange={e=>{onChange(e.target.value);setFocused(true);setBrowsing(browseOnFocus&&!e.target.value.trim());setActive(-1);}}
   onKeyDown={e=>{
    if(picks.length&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();setActive(old=>e.key==='ArrowDown'?(old+1)%picks.length:old<=0?picks.length-1:old-1);}
    if(picks.length&&e.key==='Enter'&&active>=0&&active<picks.length){e.preventDefault();pick(picks[active]);}
    if(e.key==='Escape'){setFocused(false);setActive(-1);}
   }}/>
  {picks.length>0&&<div ref={list} className="smart-suggestions" role="listbox" id={listId} aria-label={'Sugestões disponíveis'}>
   {picks.map((s,i)=><button key={s} id={listId+'-'+i} role="option" tabIndex={-1} aria-selected={i===active} type="button"
    onMouseDown={e=>e.preventDefault()} onClick={()=>pick(s)}>{s}</button>)}
  </div>}
  <small id={hintId} className="smart-hint">{exact?'Opção já cadastrada.':hint??'Digite para encontrar opções existentes ou criar uma personalizada.'}</small>
 </div>;
}
