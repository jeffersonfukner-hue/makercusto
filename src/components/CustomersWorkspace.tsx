import {useEffect,useState} from 'react';
import {listWorkshopCustomers,type WorkshopCustomer} from '../data/supabase';
import {CustomerEditor} from './CustomerEditor';
import {OrdersWorkspace} from './OrdersWorkspace';
import {OperationFeedback} from './OperationFeedback';

export function CustomersWorkspace({workspaceId}:{workspaceId:string}){
 const [customers,setCustomers]=useState<WorkshopCustomer[]>([]);
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [edit,setEdit]=useState<WorkshopCustomer|'new'>();
 const [history,setHistory]=useState('');
 useEffect(()=>{
  let live=true;
  void listWorkshopCustomers(workspaceId).then(rows=>{if(live)setCustomers(rows);})
   .catch(cause=>{if(live)setError((cause as Error).message);})
   .finally(()=>{if(live)setLoading(false);});
  return ()=>{live=false;};
 },[workspaceId]);
 const term=query.trim().toLocaleLowerCase('pt-BR');
 const matches=customers.filter(customer=>
  [customer.name,customer.whatsapp,customer.email].some(value=>value?.toLocaleLowerCase('pt-BR').includes(term)));
 const selected=customers.find(customer=>customer.id===history);
 return <>
  <section className="panel" aria-label="Cadastro de clientes">
   <div className="mc-calculation-share-actions">
    <label>Buscar cliente<input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <button type="button" className="primary-action" disabled={loading} onClick={()=>setEdit('new')}>Novo cliente</button>
   </div>
   <OperationFeedback pending={loading} pendingMessage="Carregando clientes…" error={error} failureMessage="Não foi possível consultar clientes."/>
   {!loading&&!error&&matches.length===0&&<p>{term?'Nenhum cliente encontrado.':'Nenhum cliente cadastrado.'}</p>}
   {matches.map(customer=><article key={customer.id} className="product-detail">
    <h2>{customer.name}</h2>
    {customer.whatsapp&&<p>WhatsApp {customer.whatsapp}</p>}
    {customer.email&&<p>{customer.email}</p>}
    <div className="mc-calculation-share-actions">
     <button type="button" onClick={()=>setEdit(customer)}>Editar cliente</button>
     <button type="button" onClick={()=>setHistory(customer.id)}>Ver pedidos de {customer.name}</button>
    </div>
   </article>)}
  </section>
  {selected&&<OrdersWorkspace key={selected.id} workspaceId={workspaceId} customer={selected}/>}
  {edit&&<CustomerEditor workspaceId={workspaceId} customer={edit==='new'?undefined:edit} onClose={()=>setEdit(undefined)}
   onSaved={saved=>{setCustomers(previous=>[...previous.filter(customer=>customer.id!==saved.id),saved].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')));setEdit(undefined);}}/>}
 </>;
}
