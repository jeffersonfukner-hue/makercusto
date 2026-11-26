import {useEffect,useState,type FormEvent} from 'react';
import {addPrintAuditReason,listPrintAudit,printAuditPageSize,type PrintAuditEvent,type PrintAuditNote} from '../data/supabase';
import {OperationFeedback} from './OperationFeedback';

const actionName:Record<PrintAuditEvent['action'],string>={
 cancel_print:'Cancelamento da impressão',
 reduce_print_plan:'Redução parcial do planejamento',
 swap_reserved_lot:'Troca de bobina reservada'
};
const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});

function PrintAuditReason({event,workspaceId}:{event:PrintAuditEvent;workspaceId:string}){
 const [saved,setSaved]=useState<PrintAuditNote>();
 const [editing,setEditing]=useState(false);
 const [reason,setReason]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const note=saved??event.note;
 const submit=async(form:FormEvent)=>{
  form.preventDefault();
  const input=reason.trim();
  if(busy||input.length<10||input.length>1000)return;
  setBusy(true);setError('');
  try{
   setSaved(await addPrintAuditReason(workspaceId,event.id,input));
   setEditing(false);
  }catch(cause){setError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 if(event.reason?.trim())return <p>{event.reason}</p>;
 if(note)return <div>
  <p>{note.reason}</p>
  <small>Motivo acrescentado em {date.format(new Date(note.added_at))} · Usuário {note.added_by}</small>
 </div>;
 return editing?<form onSubmit={form=>void submit(form)}>
  <label>Motivo da ação
   <textarea value={reason} onChange={input=>setReason(input.target.value)} minLength={10} maxLength={1000} rows={3} required disabled={busy}/>
  </label>
  <div className="mc-calculation-share-actions">
   <button type="submit" disabled={busy||reason.trim().length<10}>Salvar motivo</button>
   <button type="button" disabled={busy} onClick={()=>{setEditing(false);setReason('');setError('');}}>Cancelar</button>
  </div>
  <OperationFeedback pending={busy} pendingMessage="Registrando motivo…" error={error} failureMessage="Não foi possível acrescentar o motivo."/>
 </form>:<>
  <p>Motivo não informado.</p>
  <div><button type="button" onClick={()=>setEditing(true)}>Adicionar motivo</button></div>
 </>;
}

export function PrintAuditHistory({workspaceId,printId,refresh}:{
 workspaceId:string;printId:string;refresh:number;
}){
 const [open,setOpen]=useState(false);
 const [offset,setOffset]=useState(0);
 const [retry,setRetry]=useState(0);
 const [loaded,setLoaded]=useState<{key:string;events:PrintAuditEvent[];error?:string}>();
 const key=[workspaceId,printId,offset,refresh,retry].join('/');
 const current=loaded?.key===key?loaded:undefined;
 useEffect(()=>{
  if(!open)return;
  let active=true;
  void listPrintAudit(workspaceId,printId,offset).then(events=>{
   if(active)setLoaded({key,events});
  }).catch(cause=>{
   if(active)setLoaded({key,events:[],error:(cause as Error).message||'A consulta falhou.'});
  });
  return()=>{active=false;};
 },[open,workspaceId,printId,offset,key]);
 return <details className="mc-print-audit" onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary>Histórico da impressão</summary>
  {open&&<>
   <OperationFeedback pending={!current} pendingMessage="Carregando histórico…" error={current?.error??''}
    failureMessage="Não foi possível consultar o histórico da impressão." onRetry={()=>setRetry(attempt=>attempt+1)}/>
   {current&&!current.error&&<>
    {current.events.length===0?<p>Nenhum cancelamento, redução ou troca de bobina registrado nesta página.</p>:
     <ol className="mc-print-audit-events">
      {current.events.slice(0,printAuditPageSize).map(event=><li key={event.id}>
       <strong>{actionName[event.action]}</strong>
       <time dateTime={event.occurred_at}>{date.format(new Date(event.occurred_at))}</time>
       <small>{event.actor_id?'Usuário '+event.actor_id:'Usuário não registrado'}</small>
       <PrintAuditReason event={event} workspaceId={workspaceId}/>
      </li>)}
     </ol>}
    {(offset>0||current.events.length>printAuditPageSize)&&<div className="mc-calculation-share-actions">
     {offset>0&&<button type="button" onClick={()=>setOffset(offset-printAuditPageSize)}>Anterior</button>}
     {current.events.length>printAuditPageSize&&<button type="button" onClick={()=>setOffset(offset+printAuditPageSize)}>Próxima</button>}
    </div>}
   </>}
  </>}
 </details>;
}
