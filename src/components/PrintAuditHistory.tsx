import {useEffect,useState} from 'react';
import {listPrintAudit,printAuditPageSize,type PrintAuditEvent} from '../data/supabase';
import {OperationFeedback} from './OperationFeedback';

const actionName:Record<PrintAuditEvent['action'],string>={
 cancel_print:'Cancelamento da impressão',
 reduce_print_plan:'Redução parcial do planejamento',
 swap_reserved_lot:'Troca de bobina reservada'
};
const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});

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
       <p>{event.reason?.trim()||'Motivo não informado.'}</p>
       <small>{event.actor_id?'Usuário '+event.actor_id:'Usuário não registrado'}</small>
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
