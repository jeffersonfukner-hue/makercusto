import {useEffect,useState} from 'react';
import {compositionCalculation,getAssemblySnapshot,listCalculationHistory,type CalculationHistoryRow,type SavedCalculation} from '../data/supabase';

const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'});
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});

type HistoryProduct=Pick<SavedCalculation,'product_id'|'name'|'sku'|'composition'|'available_composition'>&{kind:SavedCalculation['kind']|'kit';saved_input?:SavedCalculation['saved_input']};
export function CalculationHistory({workspaceId,products,onLoad,initialProductId=''}:{
 workspaceId:string;products:HistoryProduct[];onLoad?:(calculation:SavedCalculation)=>void;initialProductId?:string;
}){
 const [loadingRevision,setLoadingRevision]=useState('');
 const [revisionError,setRevisionError]=useState('');
 const [opened,setOpened]=useState(false);
 const [productId,setProductId]=useState(initialProductId);
 const [offset,setOffset]=useState(0);
 const [page,setPage]=useState<{key:string;rows:CalculationHistoryRow[];error?:string}>();
 const selected=products.find(product=>product.product_id===productId);
 const key=workspaceId+'/'+productId+'/'+offset;
 useEffect(()=>{
  if(!productId||!opened)return;
  let active=true;
  void listCalculationHistory(workspaceId,productId,offset)
   .then(rows=>{if(active)setPage({key,rows});})
   .catch(()=>{if(active)setPage({key,rows:[],error:'Não foi possível consultar as revisões.'});});
  return ()=>{active=false;};
 },[workspaceId,productId,offset,key,opened]);
 const current=page?.key===key?page:undefined;
 const openComposition=async(snapshotId:string)=>{
  setLoadingRevision(snapshotId);setRevisionError('');
  try{
   const assembly=await getAssemblySnapshot(workspaceId,snapshotId);
   const latest=products.find(item=>item.product_id===productId);
   const calculation=assembly&&compositionCalculation(assembly,latest?.saved_input?latest as SavedCalculation:undefined);
   if(!calculation)throw new Error('A revisão da composição não está disponível.');
   onLoad?.(calculation);
  }catch(cause){setRevisionError((cause as Error).message);}
  finally{setLoadingRevision('');}
 };

 return <details className="mc-calculation-share mc-calc-history" onToggle={event=>setOpened(event.currentTarget.open)}>
  <summary>Histórico de custos</summary>
  {!initialProductId&&<label>Produto do histórico<select value={productId} onChange={event=>{setProductId(event.target.value);setOffset(0);}}>
   <option value="">Selecione</option>
   {products.map(product=><option key={product.product_id} value={product.product_id}>{product.name}</option>)}
  </select></label>}
  {selected&&!current&&<p role="status">Carregando revisões…</p>}
  {revisionError&&<p role="alert">{revisionError}</p>}
  {current?.error&&<p role="alert">{current.error}</p>}
  {current&&!current.error&&current.rows.length===0&&<p>Nenhuma revisão disponível nesta página.</p>}
  {selected&&current&&current.rows.length>0&&<ul>
   {current.rows.map(row=>{
    const unitCost=row.total_cost===null?null:Number(row.total_cost)/Number(row.quantity);
    const kind=selected.kind;
    const composed=row.parameters?.origin==='assembly-revision';
    return <li key={row.id}>
     <span>{date.format(new Date(row.confirmed_at))} · {composed?'Montagem por partes':'Impressão direta'} · {row.quantity} un. · {unitCost===null?'Custo indefinido':money.format(unitCost)+'/un.'}</span>
     {onLoad&&kind!=='kit'&&composed&&<button type="button" disabled={Boolean(loadingRevision)}
      onClick={()=>void openComposition(row.id)}>Carregar composição</button>}
     {onLoad&&kind!=='kit'&&row.parameters?.saved_input&&<button type="button" onClick={()=>onLoad({product_id:selected.product_id,name:selected.name,sku:selected.sku,kind,snapshot_id:row.id,
      available_composition:selected.composition??selected.available_composition,
      unit_cost:unitCost,saved_input:row.parameters.saved_input!,saved_at:row.confirmed_at})}>Reutilizar parâmetros</button>}
    </li>;
   })}
  </ul>}
  <div className="mc-calculation-share-actions">
   {offset>0&&<button type="button" onClick={()=>setOffset(offset-20)}>Anterior</button>}
   {current?.rows.length===20&&<button type="button" onClick={()=>setOffset(offset+20)}>Próxima</button>}
  </div>
 </details>;
}
