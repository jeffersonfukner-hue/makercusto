import {ContactEditor} from './ContactEditor';
import {OperationFeedback} from './OperationFeedback';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {listWorkshopCustomers,saveCustomerOrder,type CustomerOrderDraft,type WorkshopCustomer} from '../data/supabase';

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
 const [customers,setCustomers]=useState<WorkshopCustomer[]>([]);
 const [customersLoading,setCustomersLoading]=useState(true);
 const [customersError,setCustomersError]=useState('');
 const [customerId,setCustomerId]=useState('');
 const [query,setQuery]=useState('');
 const [editingCustomer,setEditingCustomer]=useState(false);
 useEffect(()=>{
  let live=true;
  void listWorkshopCustomers(workspaceId).then(rows=>{if(live)setCustomers(rows);})
   .catch(cause=>{if(live)setCustomersError((cause as Error).message||'A solicitação falhou.');})
   .finally(()=>{if(live)setCustomersLoading(false);});
  return ()=>{live=false;};
 },[workspaceId]);
 const term=query.trim().toLocaleLowerCase('pt-BR');
 const choices=customers.filter(customer=>customer.id===customerId||customer.name.toLocaleLowerCase('pt-BR').includes(term));
 const payload={...draft,product_name:name.trim(),status,...(customerId?{customer_id:customerId}:{})};
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
 return <>
 <form onSubmit={event=>void submit(event)}>
  <label>Item do pedido<input value={name} onChange={event=>setName(event.target.value)} minLength={2} maxLength={150} required disabled={busy}/></label>
  <label>Situação<select value={status} onChange={event=>setStatus(event.target.value==='sold'?'sold':'planned')} disabled={busy}>
   <option value="planned">Planejado</option><option value="sold">Vendido</option>
  </select></label>
  <fieldset className="mc-order-customer" disabled={busy}>
   <legend>Cliente (opcional)</legend>
   {customers.length>0&&<label>Buscar cliente<input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>}
   <div className="mc-order-customer-choice">
    <select aria-label="Cliente do pedido" value={customerId} disabled={customersLoading} onChange={event=>setCustomerId(event.target.value)}>
     <option value="">Sem cliente</option>
     {choices.map(customer=><option key={customer.id} value={customer.id}>{customer.name}</option>)}
    </select>
    <button type="button" disabled={customersLoading} onClick={()=>setEditingCustomer(true)}>Novo cliente</button>
   </div>
   <OperationFeedback pending={customersLoading} pendingMessage="Carregando clientes…" error={customersError} failureMessage="Não foi possível consultar clientes."/>
  </fieldset>
  <div className="mc-calculation-share-actions">
   <button type="submit" disabled={busy||saved||name.trim().length<2}>{busy?'Registrando…':'Registrar pedido'}</button>
   {saved&&<button type="button" onClick={onViewOrders}>Ver pedidos</button>}
  </div>
  {saved&&<p role="status">Pedido registrado no histórico da oficina.</p>}
  <OperationFeedback pending={busy} pendingMessage="Aguardando o registro do pedido…" error={error} failureMessage="Não foi possível registrar o pedido."/>
 </form>
 {editingCustomer&&<ContactEditor kind="cliente" workspaceId={workspaceId} onClose={()=>setEditingCustomer(false)}
  onSaved={customer=>{setCustomers(previous=>[...previous,customer]);setCustomerId(customer.id);setQuery('');setEditingCustomer(false);}}/>}
 </>;
}
