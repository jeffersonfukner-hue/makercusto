import {useEffect,useState} from 'react';
import {listWorkshopCustomers,listWorkshopSuppliers,type WorkshopCustomer} from '../data/supabase';
import {ContactEditor} from './ContactEditor';
import {OrdersWorkspace} from './OrdersWorkspace';
import {OperationFeedback} from './OperationFeedback';

export function ContactsWorkspace({workspaceId,kind}:{workspaceId:string;kind:'cliente'|'fornecedor'}){
 const supplier=kind==='fornecedor';
 const plural=supplier?'fornecedores':'clientes';
 const [contacts,setContacts]=useState<WorkshopCustomer[]>([]);
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [edit,setEdit]=useState<WorkshopCustomer|'new'>();
 const [history,setHistory]=useState('');
 const [orderOpen,setOrderOpen]=useState(false);
 useEffect(()=>{
  let live=true;
  void (supplier?listWorkshopSuppliers(workspaceId):listWorkshopCustomers(workspaceId)).then(rows=>{if(live)setContacts(rows);})
   .catch(cause=>{if(live)setError((cause as Error).message);})
   .finally(()=>{if(live)setLoading(false);});
  return ()=>{live=false;};
 },[workspaceId,supplier]);
 const term=query.trim().toLocaleLowerCase('pt-BR');
 const matches=contacts.filter(contact=>
  [contact.name,contact.whatsapp,contact.email].some(value=>value?.toLocaleLowerCase('pt-BR').includes(term)));
 const selected=contacts.find(contact=>contact.id===history);
 return <>
  {!orderOpen&&<section className="panel" aria-label={'Cadastro de '+plural}>
   <div className="mc-record-toolbar">
    <label>Buscar {kind}<input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <button type="button" className="primary-action" disabled={loading} onClick={()=>setEdit('new')}>Novo {kind}</button>
   </div>
   <OperationFeedback pending={loading} pendingMessage={'Carregando '+plural+'…'} error={error} failureMessage={'Não foi possível consultar '+plural+'.'}/>
   {!loading&&!error&&matches.length===0&&<p>{'Nenhum '+kind+(term?' encontrado.':' cadastrado.')}</p>}
   {matches.length>0&&<ul className="mc-contact-list">{matches.map(contact=><li key={contact.id} className="mc-contact-row">
    <div><h3>{contact.name}</h3>
     {(contact.whatsapp||contact.email)&&<small>{[contact.whatsapp,contact.email].filter(Boolean).join(' · ')}</small>}
    </div>
    <div className="mc-contact-actions">
     <button type="button" onClick={()=>setEdit(contact)}>Editar {kind}</button>
     {!supplier&&<button type="button" onClick={()=>setHistory(contact.id)}>Ver pedidos de {contact.name}</button>}
    </div>
   </li>)}</ul>}
  </section>}
  {selected&&<OrdersWorkspace key={selected.id} workspaceId={workspaceId} customer={selected} onDetailChange={setOrderOpen}/>}
  {edit&&<ContactEditor workspaceId={workspaceId} kind={kind} contact={edit==='new'?undefined:edit} onClose={()=>setEdit(undefined)}
   onSaved={saved=>{setContacts(previous=>[...previous.filter(contact=>contact.id!==saved.id),saved].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')));setEdit(undefined);}}/>}
 </>;
}
