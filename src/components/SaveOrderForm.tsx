import {OperationFeedback} from './OperationFeedback';
import {useRef,useState,type FormEvent} from 'react';
import {saveCustomerOrder,type CustomerOrderDraft} from '../data/supabase';

export function SaveOrderForm({workspaceId,productName,draft,onViewOrders}:{
 workspaceId:string;productName?:string;
 draft:Omit<CustomerOrderDraft,'id'|'product_name'|'status'>;
 onViewOrders:()=>void;
}){
 const [name,setName]=useState(productName??'');
 const [status,setStatus]=useState<CustomerOrderDraft['status']>('planned');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [savedKey,setSavedKey]=useState('');
 const request=useRef<{key:string;id:string}>(undefined);
 const payload={...draft,product_name:name.trim(),status};
 const key=JSON.stringify(payload);
 const saved=savedKey===key;
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  if(busy||saved||payload.product_name.length<2)return;
  if(request.current?.key!==key)request.current={key,id:crypto.randomUUID()};
  setBusy(true);setError('');
  try{
   await saveCustomerOrder(workspaceId,{...payload,id:request.current.id});
   setSavedKey(key);
  }catch(cause){setError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 return <form onSubmit={event=>void submit(event)}>
  <label>Item do pedido<input value={name} onChange={event=>setName(event.target.value)} minLength={2} maxLength={150} required disabled={busy}/></label>
  <label>Situação<select value={status} onChange={event=>setStatus(event.target.value==='sold'?'sold':'planned')} disabled={busy}>
   <option value="planned">Planejado</option><option value="sold">Vendido</option>
  </select></label>
  <div className="mc-calculation-share-actions">
   <button type="submit" disabled={busy||saved||name.trim().length<2}>{busy?'Registrando…':'Registrar pedido'}</button>
   {saved&&<button type="button" onClick={onViewOrders}>Ver pedidos</button>}
  </div>
  {saved&&<p role="status">Pedido registrado no histórico da oficina.</p>}
  <OperationFeedback pending={busy} pendingMessage="Aguardando o registro do pedido…" error={error} failureMessage="Não foi possível registrar o pedido."/>
 </form>;
}
