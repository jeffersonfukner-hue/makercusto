import {useRef,useState,type FormEvent} from 'react';
import {saveWorkshopCustomer,saveWorkshopSupplier,type WorkshopCustomer,type WorkshopSupplier} from '../data/supabase';
import {Modal} from './Modals';
import {OperationFeedback} from './OperationFeedback';

export function ContactEditor({workspaceId,contact,kind,onClose,onSaved}:{
 workspaceId:string;contact?:WorkshopCustomer|WorkshopSupplier;kind:'cliente'|'fornecedor';onClose:()=>void;onSaved:(customer:WorkshopCustomer)=>void;
}){
 const [name,setName]=useState(contact?.name??'');
 const [whatsapp,setWhatsapp]=useState(contact?.whatsapp??'');
 const [email,setEmail]=useState(contact?.email??'');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const request=useRef<{id:string;key:string}>(undefined);
 const close=()=>{if(!busy)onClose();};
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  if(busy||name.trim().length<2)return;
  const draft={name:name.trim(),whatsapp:whatsapp.trim()||null,email:email.trim()||null};
  const key=JSON.stringify(draft);
  if(request.current?.key!==key)request.current={id:contact?.id??crypto.randomUUID(),key};
  setBusy(true);setError('');
  try{
   const saved=kind==='fornecedor'
    ? await saveWorkshopSupplier(workspaceId,request.current.id,draft,contact&&'contact' in contact?contact:undefined)
    : await saveWorkshopCustomer(workspaceId,request.current.id,draft,Boolean(contact));
   onSaved(saved);
  }catch(cause){setError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 return <Modal title={(contact?'Editar ':'Novo ')+kind} onClose={close}>
  <form className="modal-body" onSubmit={event=>void submit(event)}>
   <label>Nome do {kind}<input autoFocus required minLength={2} maxLength={150} disabled={busy} value={name} onChange={event=>setName(event.target.value)}/></label>
   <label>WhatsApp (opcional)<input type="tel" maxLength={40} disabled={busy} value={whatsapp} onChange={event=>setWhatsapp(event.target.value)}/></label>
   <label>E-mail (opcional)<input type="email" maxLength={254} disabled={busy} value={email} onChange={event=>setEmail(event.target.value)}/></label>
   <OperationFeedback pending={busy} pendingMessage={'Salvando '+kind+'…'} error={error} failureMessage={'Não foi possível salvar o '+kind+'.'}/>
   <div className="modal-actions">
    <button type="button" disabled={busy} onClick={close}>Cancelar</button>
    <button type="submit" className="primary-action" disabled={busy||name.trim().length<2}>Salvar {kind}</button>
   </div>
  </form>
 </Modal>;
}
