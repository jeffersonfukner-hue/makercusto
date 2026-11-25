import {useRef,useState,type FormEvent} from 'react';
import {saveWorkshopCustomer,type WorkshopCustomer} from '../data/supabase';
import {Modal} from './Modals';
import {OperationFeedback} from './OperationFeedback';

export function CustomerEditor({workspaceId,customer,onClose,onSaved}:{
 workspaceId:string;customer?:WorkshopCustomer;onClose:()=>void;onSaved:(customer:WorkshopCustomer)=>void;
}){
 const [name,setName]=useState(customer?.name??'');
 const [whatsapp,setWhatsapp]=useState(customer?.whatsapp??'');
 const [email,setEmail]=useState(customer?.email??'');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const request=useRef<{id:string;key:string}>(undefined);
 const close=()=>{if(!busy)onClose();};
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  if(busy||name.trim().length<2)return;
  const draft={name:name.trim(),whatsapp:whatsapp.trim()||null,email:email.trim()||null};
  const key=JSON.stringify(draft);
  if(request.current?.key!==key)request.current={id:customer?.id??crypto.randomUUID(),key};
  setBusy(true);setError('');
  try{
   const saved=await saveWorkshopCustomer(workspaceId,request.current.id,draft,Boolean(customer));
   onSaved(saved);
  }catch(cause){setError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 return <Modal title={customer?'Editar cliente':'Novo cliente'} onClose={close}>
  <form className="modal-body" onSubmit={event=>void submit(event)}>
   <label>Nome do cliente<input autoFocus required minLength={2} maxLength={150} disabled={busy} value={name} onChange={event=>setName(event.target.value)}/></label>
   <label>WhatsApp (opcional)<input type="tel" maxLength={40} disabled={busy} value={whatsapp} onChange={event=>setWhatsapp(event.target.value)}/></label>
   <label>E-mail (opcional)<input type="email" maxLength={254} disabled={busy} value={email} onChange={event=>setEmail(event.target.value)}/></label>
   <OperationFeedback pending={busy} pendingMessage="Salvando cliente…" error={error} failureMessage="Não foi possível salvar o cliente."/>
   <div className="modal-actions">
    <button type="button" disabled={busy} onClick={close}>Cancelar</button>
    <button type="submit" className="primary-action" disabled={busy||name.trim().length<2}>Salvar cliente</button>
   </div>
  </form>
 </Modal>;
}
