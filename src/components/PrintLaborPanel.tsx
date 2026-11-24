import {useEffect,useState} from 'react';
import {listWorkshopServices,getL4Labor,recordL4Labor,type WorkshopService,type StoredLaborActivity} from '../data/supabase';
import {laborCandidate,type LaborActivity} from '../domain/l4-labor-draft';
type Candidate=ReturnType<typeof laborCandidate>;
export function PrintLaborPanel({workspaceId,executionId,onImport,onInvalidate}:{workspaceId:string|null;executionId:string;onImport:(c:Candidate)=>void;onInvalidate:()=>void}){
 const [activities,setActivities]=useState<LaborActivity[]>([]);
 const [stored,setStored]=useState<StoredLaborActivity[]|null>(null);
 const [busy,setBusy]=useState(false);
 const [saveError,setSaveError]=useState('');
 const loadStored=async()=>{
  if(!workspaceId)return;
  setBusy(true);setSaveError('');setStored(null);onInvalidate();
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
  <button type="button" disabled={busy} onClick={add}>Adicionar atividade</button>
  {error&&<p role="alert">{error}</p>}
  <ul>{activities.map(a=><li key={a.id}>{a.activity}: {a.minutes} min · R$ {a.hourlyRate}/h · {a.basis==='measured'?'medido':'estimado'} <button type="button" disabled={busy||!workspaceId} onClick={()=>void saveActivity(a)}>Registrar evidência</button> <button type="button" disabled={busy} onClick={()=>{onInvalidate();setActivities(v=>v.filter(x=>x.id!==a.id));}}>Remover rascunho</button></li>)}</ul>
  <button type="button" disabled={busy||!workspaceId} onClick={()=>void loadStored()}>{busy?'Consultando / registrando…':'Consultar atividades registradas'}</button>
  {saveError&&<p role="alert">{saveError}</p>}
  {stored&&<ul>{stored.map(a=><li key={a.id}>{a.activity} · {a.minutes} min · R$ {a.hourlyRate}/h · {a.reference} · {a.createdAt}</li>)}</ul>}
  {recorded&&<><p>Total registrado indicativo: R$ {recorded.amountBrl}</p><button type="button" disabled={busy||!recorded.importable||activities.length>0} onClick={()=>onImport(recorded!)}>Usar evidências registradas no rateio</button></>}
  {candidate&&<><p>Total provisório da mão de obra: R$ {candidate.amountBrl}</p><button type="button" disabled={busy||!candidate.importable||Boolean(stored?.length)} onClick={()=>onImport(candidate!)}>Usar mão de obra no rateio</button></>}
 </section>;
}
