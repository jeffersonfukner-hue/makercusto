import {useEffect,useId,useRef,useState} from 'react';
import type {SavedCalculation} from '../data/supabase';
import {matchKey} from '../domain/catalogName';

export function savedCalculationLabel(item:SavedCalculation){
 return (item.kind==='component'?'Peça: ':'Produto: ')+item.name+(item.composition?' · Montagem por partes':'');
}

export function SavedCalculationPicker({items,selected,disabled,onPick}:{
 items:SavedCalculation[];selected?:SavedCalculation|null;disabled:boolean;onPick:(item:SavedCalculation)=>boolean;
}){
 const listId=useId();
 const list=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [active,setActive]=useState(-1);
 const term=matchKey(query);
 const matches=items.filter(item=>matchKey(item.name+' '+(item.sku??'')).includes(term));
 const current=selected&&(items.some(item=>item.snapshot_id===selected.snapshot_id)
  ?savedCalculationLabel(selected):selected.name+' · revisão carregada');
 useEffect(()=>{
  const viewport=list.current;
  const option=viewport?.children[active];
  if(!viewport||!option)return;
  const bounds=viewport.getBoundingClientRect();
  const row=option.getBoundingClientRect();
  if(row.top<bounds.top)viewport.scrollTop+=row.top-bounds.top;
  else if(row.bottom>bounds.bottom)viewport.scrollTop+=row.bottom-bounds.bottom;
 },[active]);
 const close=()=>{setOpen(false);setQuery('');setActive(-1);};
 const pick=(item:SavedCalculation)=>{if(onPick(item))close();};
 return <div className="mc-saved-picker catalog-field">
  <input role="combobox" aria-label="Cálculo salvo para reutilizar" aria-autocomplete="list" aria-expanded={open}
   aria-controls={open?listId:undefined} aria-activedescendant={open&&active>=0&&matches[active]?listId+'-'+active:undefined}
   placeholder={open?(current||'Digite nome ou SKU'):'Buscar cálculo salvo'} autoComplete="off"
   disabled={disabled} value={open?query:current||''}
   onFocus={()=>setOpen(true)} onClick={()=>setOpen(true)} onBlur={close}
   onChange={event=>{setOpen(true);setQuery(event.target.value);setActive(-1);}}
   onKeyDown={event=>{
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
     event.preventDefault();setOpen(true);
     if(matches.length)setActive(index=>event.key==='ArrowDown'?(index+1)%matches.length:index<=0?matches.length-1:index-1);
    }
    if(open&&event.key==='Enter'&&matches[active>=0?active:0]){
     event.preventDefault();pick(matches[active>=0?active:0]);
    }
   }}/>
  {open&&<div className="smart-suggestions" ref={list} role="listbox" id={listId} aria-label="Cálculos salvos">
   {matches.map((item,index)=><button type="button" key={item.snapshot_id} id={listId+'-'+index} role="option" tabIndex={-1}
    aria-selected={index===active} onMouseDown={event=>event.preventDefault()} onClick={()=>pick(item)}>
    {savedCalculationLabel(item)}{item.sku&&<small> · {item.sku}</small>}
   </button>)}
   {!matches.length&&<span role="status">{term?'Nenhum cálculo encontrado.':'Nenhum cálculo salvo disponível.'}</span>}
  </div>}
 </div>;
}
