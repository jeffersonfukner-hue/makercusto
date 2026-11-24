import {useEffect,useState} from 'react';
import {listWorkshopServices,type WorkshopService} from '../data/supabase';
import {laborCandidate,type LaborActivity} from '../domain/l4-labor-draft';
type Candidate=ReturnType<typeof laborCandidate>;
export function PrintLaborPanel({workspaceId,executionId,onImport,onInvalidate}:{workspaceId:string|null;executionId:string;onImport:(c:Candidate)=>void;onInvalidate:()=>void}){
 const [activities,setActivities]=useState<LaborActivity[]>([]);
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
 if(activities.length)try{candidate=laborCandidate(executionId,activities);}catch{/* erro exibido na inclusão */}
 const add=()=>{
  const next=[...activities,{id:crypto.randomUUID(),activity,minutes,hourlyRate:rate,reference,basis,serviceId:serviceId||undefined}];
  try{laborCandidate(executionId,next);onInvalidate();setActivities(next);setActivity('');setMinutes('');setRate('');setReference('');setServiceId('');setError('');}
  catch(e){setError((e as Error).message);}
 };
 return <section className="panel" aria-label="Mão de obra da impressão">
  <h4>Mão de obra — atividades da oficina</h4>
  <p className="footnote">Informe somente o tempo de trabalho humano, não as horas automáticas da impressora. Tarifas do catálogo são atuais, não comprovantes históricos. Dados desta seção não são salvos.</p>
  {serviceError&&<p>{serviceError}</p>}
  <div className="product-save-fields">
   <label>Serviço da oficina<select value={serviceId} onChange={e=>{const s=services.find(x=>x.id===e.target.value);setServiceId(e.target.value);if(s){setActivity(s.name);setRate(String(s.rate));}}}><option value="">Informar manualmente</option>{services.map(s=><option key={s.id} value={s.id}>{s.name} — R$ {s.rate}/h</option>)}</select></label>
   <label>Atividade<input value={activity} onChange={e=>setActivity(e.target.value)}/></label>
   <label>Minutos de trabalho<input value={minutes} onChange={e=>setMinutes(e.target.value)} inputMode="decimal"/></label>
   <label>Tarifa R$/h<input value={rate} onChange={e=>setRate(e.target.value)} inputMode="decimal"/></label>
   <label>Origem / referência única<input value={reference} onChange={e=>setReference(e.target.value)}/></label>
   <label>Base do tempo<select value={basis} onChange={e=>setBasis(e.target.value as LaborActivity['basis'])}><option value="measured">Medido</option><option value="estimated">Estimado</option></select></label>
  </div>
  <button type="button" onClick={add}>Adicionar atividade</button>
  {error&&<p role="alert">{error}</p>}
  <ul>{activities.map(a=><li key={a.id}>{a.activity}: {a.minutes} min · R$ {a.hourlyRate}/h · {a.basis==='measured'?'medido':'estimado'} <button type="button" onClick={()=>{onInvalidate();setActivities(v=>v.filter(x=>x.id!==a.id));}}>Remover atividade</button></li>)}</ul>
  {candidate&&<><p>Total provisório da mão de obra: R$ {candidate.amountBrl}</p><button type="button" disabled={!candidate.importable} onClick={()=>onImport(candidate!)}>Usar mão de obra no rateio</button></>}
 </section>;
}
