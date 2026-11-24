import {useEffect,useState} from 'react';
import {listWorkshopServices,getL4Labor,recordL4Labor,reviseL4Labor,type LaborRevisionDraft,type WorkshopService,type StoredLaborActivity} from '../data/supabase';
import {laborCandidate,validateLaborRevision,type LaborActivity} from '../domain/l4-labor-draft';
type Candidate=ReturnType<typeof laborCandidate>;
export function PrintLaborPanel({workspaceId,executionId,onImport,onInvalidate}:{workspaceId:string|null;executionId:string;onImport:(c:Candidate)=>void;onInvalidate:()=>void}){
 const [activities,setActivities]=useState<LaborActivity[]>([]);
 const [stored,setStored]=useState<StoredLaborActivity[]|null>(null);
 const [busy,setBusy]=useState(false);
 const [saveError,setSaveError]=useState('');
 const [revision,setRevision]=useState<LaborRevisionDraft|null>(null);
 const [revisionError,setRevisionError]=useState('');
 const startRevision=(a:StoredLaborActivity)=>{
  if(!a.versionId)return;
  onInvalidate();setRevisionError('');
  setRevision({evidenceId:a.id,priorId:a.versionId,key:crypto.randomUUID(),minutes:a.minutes,hourlyRate:a.hourlyRate,basis:a.basis,reason:''});
 };
 const changeRevision=(patch:Partial<LaborRevisionDraft>)=>{
  setRevision(v=>v?{...v,...patch,key:crypto.randomUUID()}:null);setRevisionError('');onInvalidate();
 };
 const saveRevision=async()=>{
  if(!workspaceId||!revision||busy)return;
  let draft:LaborRevisionDraft;
  try{draft=validateLaborRevision(revision);}catch(e){setRevisionError((e as Error).message);return;}
  setBusy(true);setRevisionError('');setStored(null);onInvalidate();
  try{
   await reviseL4Labor(workspaceId,executionId,draft);
   setRevision(null);
   const data=await getL4Labor(workspaceId,executionId);
   if(data.workspace_id!==workspaceId||data.execution_id!==executionId||data.posting_allowed!==false||!Array.isArray(data.activities))throw new Error('Resposta histórica inválida.');
   setStored(data.activities);
  }catch(e){setRevisionError((e as Error).message);}
  finally{setBusy(false);}
 };
 const loadStored=async()=>{
  if(!workspaceId)return;
  setRevision(null);setRevisionError('');setBusy(true);setSaveError('');setStored(null);onInvalidate();
  try{
   const data=await getL4Labor(workspaceId,executionId);
   if(data.workspace_id!==workspaceId||data.execution_id!==executionId||data.posting_allowed!==false||!Array.isArray(data.activities))throw new Error('Resposta histórica inválida.');
   setStored(data.activities);
  }catch(e){setSaveError((e as Error).message);}
  finally{setBusy(false);}
 };
 const saveActivity=async(a:LaborActivity)=>{
  if(!workspaceId)return;
  setBusy(true);setSaveError('');setStored(null);onInvalidate();
  try{
   await recordL4Labor(workspaceId,executionId,a);
   setActivities(v=>v.filter(x=>x.id!==a.id));
   const data=await getL4Labor(workspaceId,executionId);
   if(data.workspace_id!==workspaceId||data.execution_id!==executionId||data.posting_allowed!==false||!Array.isArray(data.activities))throw new Error('Resposta histórica inválida.');
   setStored(data.activities);
  }catch(e){setSaveError((e as Error).message);}
  finally{setBusy(false);}
 };
 const [services,setServices]=useState<WorkshopService[]>([]);
 const [serviceError,setServiceError]=useState('');
 const [activity,setActivity]=useState(''),[minutes,setMinutes]=useState(''),[rate,setRate]=useState(''),[reference,setReference]=useState('');
 const [basis,setBasis]=useState<LaborActivity['basis']>('measured');
 const [serviceId,setServiceId]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  let live=true;
  if(workspaceId)void listWorkshopServices(workspaceId).then(v=>{if(live)setServices(v.filter(s=>s.unit==='hour'));}).catch(()=>{if(live)setServiceError('Catálogo indisponível; informe tarifa manualmente.');});
  return()=>{live=false;};
 },[workspaceId]);
 let candidate:Candidate|null=null;
 let recorded:Candidate|null=null;
 if(stored?.length)try{const v=laborCandidate(executionId,stored);recorded={...v,sourceVersion:v.sourceVersion.replace('labor-draft:','labor-evidence:'),source:v.source.replace('declaração local','evidência registrada')};}catch{/* fonte inválida não importável */}
 if(activities.length)try{candidate=laborCandidate(executionId,activities);}catch{/* erro exibido na inclusão */}
 const add=()=>{
  const next=[...activities,{id:crypto.randomUUID(),activity,minutes,hourlyRate:rate,reference,basis,serviceId:serviceId||undefined}];
  try{laborCandidate(executionId,next);onInvalidate();setActivities(next);setActivity('');setMinutes('');setRate('');setReference('');setServiceId('');setError('');}
  catch(e){setError((e as Error).message);}
 };
 return <section className="panel" aria-label="Mão de obra da impressão">
  <h4>Mão de obra — atividades da oficina</h4>
  <p className="footnote">Informe somente o tempo de trabalho humano, não as horas automáticas da impressora. Tarifas do catálogo são atuais, não comprovantes históricos. Rascunhos são locais até o registro explícito. Evidências registradas são imutáveis e não constituem lançamento financeiro.</p>
  {serviceError&&<p>{serviceError}</p>}
  <div className="product-save-fields">
   <label>Serviço da oficina<select value={serviceId} onChange={e=>{const s=services.find(x=>x.id===e.target.value);setServiceId(e.target.value);if(s){setActivity(s.name);setRate(String(s.rate));}}}><option value="">Informar manualmente</option>{services.map(s=><option key={s.id} value={s.id}>{s.name} — R$ {s.rate}/h</option>)}</select></label>
   <label>Atividade<input value={activity} onChange={e=>setActivity(e.target.value)}/></label>
   <label>Minutos de trabalho<input value={minutes} onChange={e=>setMinutes(e.target.value)} inputMode="decimal"/></label>
   <label>Tarifa R$/h<input value={rate} onChange={e=>{setRate(e.target.value);setServiceId('');}} inputMode="decimal"/></label>
   <label>Origem / referência única<input value={reference} onChange={e=>setReference(e.target.value)}/></label>
   <label>Base do tempo<select value={basis} onChange={e=>setBasis(e.target.value as LaborActivity['basis'])}><option value="measured">Medido</option><option value="estimated">Estimado</option></select></label>
  </div>
  <button type="button" disabled={busy||Boolean(revision)} onClick={add}>Adicionar atividade</button>
  {error&&<p role="alert">{error}</p>}
  <ul>{activities.map(a=><li key={a.id}>{a.activity}: {a.minutes} min · R$ {a.hourlyRate}/h · {a.basis==='measured'?'medido':'estimado'} <button type="button" disabled={busy||Boolean(revision)||!workspaceId} onClick={()=>void saveActivity(a)}>Registrar evidência</button> <button type="button" disabled={busy} onClick={()=>{onInvalidate();setActivities(v=>v.filter(x=>x.id!==a.id));}}>Remover rascunho</button></li>)}</ul>
  <button type="button" disabled={busy||!workspaceId} onClick={()=>void loadStored()}>{busy?'Consultando / registrando…':'Consultar atividades registradas'}</button>
  {saveError&&<p role="alert">{saveError}</p>}
  {stored&&<ul>{stored.map(a=><li key={a.id}>
   {a.activity} · {a.minutes} min · R$ {a.hourlyRate}/h · {a.basis==='measured'?'medido':'estimado'} · {a.reference} · {a.createdAt}
   {a.versionId&&<button type="button" disabled={busy||Boolean(revision)} onClick={()=>startRevision(a)}>Revisar evidência</button>}
   {Boolean(a.revisions?.length)&&<details><summary>Histórico de revisões ({a.revisions?.length})</summary>
    {a.original&&<p>Original: {a.original.minutes} min · R$ {a.original.hourlyRate}/h · {a.original.basis==='measured'?'medido':'estimado'} · {a.original.createdAt} · autor {a.original.authorId}</p>}
    <ol>{a.revisions?.map(v=><li key={v.id}>{v.minutes} min · R$ {v.hourlyRate}/h · {v.basis==='measured'?'medido':'estimado'} · {v.reason} · {v.createdAt} · autor {v.authorId}</li>)}</ol>
   </details>}
  </li>)}</ul>}
  {revision&&<section aria-label="Revisão de mão de obra">
   <h5>Registrar revisão de evidência</h5>
   <p className="footnote">O registro original será preservado. A revisão altera somente minutos, tarifa declarada e base do tempo; não gera lançamento financeiro.</p>
   <div className="product-save-fields">
    <label>Minutos revisados<input disabled={busy} value={revision.minutes} onChange={e=>changeRevision({minutes:e.target.value})} inputMode="decimal"/></label>
    <label>Tarifa revisada R$/h<input disabled={busy} value={revision.hourlyRate} onChange={e=>changeRevision({hourlyRate:e.target.value})} inputMode="decimal"/></label>
    <label>Base revisada<select disabled={busy} value={revision.basis} onChange={e=>changeRevision({basis:e.target.value as LaborActivity['basis']})}><option value="measured">Medido</option><option value="estimated">Estimado</option></select></label>
    <label>Motivo da revisão<textarea disabled={busy} maxLength={1000} value={revision.reason} onChange={e=>changeRevision({reason:e.target.value})}/></label>
   </div>
   <button type="button" disabled={busy} onClick={()=>void saveRevision()}>Confirmar revisão</button>
   <button type="button" disabled={busy} onClick={()=>{setRevision(null);setRevisionError('');}}>Cancelar revisão</button>
  </section>}
  {revisionError&&<p role="alert">{revisionError}</p>}
  {recorded&&<><p>Total registrado indicativo: R$ {recorded.amountBrl}</p><button type="button" disabled={busy||Boolean(revision)||!recorded.importable||activities.length>0} onClick={()=>onImport(recorded!)}>Usar evidências registradas no rateio</button></>}
  {candidate&&<><p>Total provisório da mão de obra: R$ {candidate.amountBrl}</p><button type="button" disabled={busy||Boolean(revision)||!candidate.importable||Boolean(stored?.length)} onClick={()=>onImport(candidate!)}>Usar mão de obra no rateio</button></>}
 </section>;
}
