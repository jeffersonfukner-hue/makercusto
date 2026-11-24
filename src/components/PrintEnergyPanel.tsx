import {useEffect,useRef,useState} from 'react';
import {getEnergyEvidence,registerEnergyTariff,recordEnergyInterval,getIntegralEnergy,recordIntegralEnergy,reviseIntegralEnergy,type IntegralEnergyRevision,type IntegralEnergyEvidence,type EnergyEvidence,type EnergyEvidenceInterval} from '../data/supabase';
import {prepareRecordedEnergy} from '../domain/p07-recorded-energy';
import {energyAllocationCandidate} from '../domain/p07-energy-allocation';

export function PrintEnergyPanel({workspaceId,executionId,onUseForAllocation,onInvalidateAllocation}:{workspaceId:string|null;executionId:string;onInvalidateAllocation?:()=>void;onUseForAllocation?:(candidate:NonNullable<ReturnType<typeof energyAllocationCandidate>>)=>void}){
 const [data,setData]=useState<EnergyEvidence|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [name,setName]=useState(''),[price,setPrice]=useState(''),[from,setFrom]=useState(''),[until,setUntil]=useState(''),[tariffRef,setTariffRef]=useState('');
 const [start,setStart]=useState(''),[end,setEnd]=useState(''),[phase,setPhase]=useState<EnergyEvidenceInterval['phase']>('heating');
 const [condition,setCondition]=useState<NonNullable<EnergyEvidenceInterval['pause_condition']>>('unknown');
 const [kind,setKind]=useState<EnergyEvidenceInterval['source_kind']>('unknown'),[value,setValue]=useState(''),[reference,setReference]=useState('');
 const [periodStart,setPeriodStart]=useState(''),[periodEnd,setPeriodEnd]=useState('');
 const [draft,setDraft]=useState<ReturnType<typeof prepareRecordedEnergy>|null>(null);
 const [integralEnabled,setIntegralEnabled]=useState(false);
 const [integralKwh,setIntegralKwh]=useState(''),[integralRef,setIntegralRef]=useState('');
 const [savedIntegral,setSavedIntegral]=useState<IntegralEnergyEvidence|null>(null);
 const [originalIntegral,setOriginalIntegral]=useState<IntegralEnergyEvidence|null>(null);
 const [revisions,setRevisions]=useState<IntegralEnergyRevision[]>([]);
 const [revisionKwh,setRevisionKwh]=useState(''),[revisionReference,setRevisionReference]=useState(''),[revisionReason,setRevisionReason]=useState('');
 const revisionRequest=useRef<{fingerprint:string;key:string}|null>(null);
 const seq=useRef(0);
 useEffect(()=>()=>{++seq.current;},[]);
 const load=async(action?:()=>Promise<string>)=>{
  if(!workspaceId||busy)return;
  const request=++seq.current;setBusy(true);setError('');setDraft(null);onInvalidateAllocation?.();
  try{
   if(action)await action();
   const [result,integral]=await Promise.all([getEnergyEvidence(workspaceId,executionId),getIntegralEnergy(workspaceId,executionId)]);
   if(integral.workspace_id!==workspaceId||integral.execution_id!==executionId||integral.posting_allowed!==false)throw new Error('Resposta de medição integral inválida.');
   if(result.workspace_id!==workspaceId||result.execution_id!==executionId||result.posting_allowed!==false||!Array.isArray(result.intervals)||!Array.isArray(result.tariffs))throw new Error('Resposta P07 inválida.');
   if(request===seq.current){setData(result);setSavedIntegral(integral.measurement);setOriginalIntegral(integral.original??integral.measurement);setRevisions(integral.revisions??[]);if(integral.measurement){setIntegralEnabled(true);setIntegralKwh(integral.measurement.kwh);setIntegralRef(integral.measurement.reference);}}
  }catch(e){if(request===seq.current){setData(null);setSavedIntegral(null);setOriginalIntegral(null);setRevisions([]);setError((e as Error).message);}}
  finally{if(request===seq.current)setBusy(false);}
 };
 const iso=(v:string)=>new Date(v+'-03:00').toISOString();
 const revise=()=>{
  if(!workspaceId||!savedIntegral||!revisionKwh.trim()||!revisionReference.trim()||!revisionReason.trim())return;
  const fingerprint=JSON.stringify([savedIntegral.id,revisionKwh,revisionReference,revisionReason]);
  if(revisionRequest.current?.fingerprint!==fingerprint)revisionRequest.current={fingerprint,key:crypto.randomUUID()};
  const key=revisionRequest.current.key;
  void load(async()=>{
   const id=await reviseIntegralEnergy(workspaceId,executionId,{priorId:savedIntegral.id,key,kwh:revisionKwh,reference:revisionReference,reason:revisionReason});
   setRevisionKwh('');setRevisionReference('');setRevisionReason('');revisionRequest.current=null;return id;
  });
 };
 const calculate=()=>{
  setDraft(null);setError('');onInvalidateAllocation?.();
  if(!data)return;
  try{
   const observedStart=data.start_at??savedIntegral?.start_at??iso(periodStart),observedEnd=data.end_at??savedIntegral?.end_at??iso(periodEnd);
   setDraft(prepareRecordedEnergy(data,observedStart,observedEnd,savedIntegral?{start:savedIntegral.start_at,end:savedIntegral.end_at,kwh:savedIntegral.kwh,reference:savedIntegral.id+' — '+savedIntegral.reference}:integralEnabled?{start:observedStart,end:observedEnd,kwh:integralKwh,reference:integralRef}:undefined));
  }
  catch(e){setError((e as Error).message);}
 };
 return <section className="panel" aria-label="Energia P07">
  <h4>Energia da impressão — P07</h4>
  <p className="footnote">Registre evidências de consumo e vigência da tarifa. Não movimenta estoque nem confirma custo financeiro. Horários informados em Brasília.</p>
  <button type="button" disabled={busy||!workspaceId} onClick={()=>void load()}>Consultar fontes P07</button>
  {error&&<p role="alert" className="error">{error}</p>}
  {data&&workspaceId&&<>
   <p>Potência média atual cadastrada: {data.current_average_watts??'não informada'} W (referência, não medição histórica).</p>
   <details><summary>Tarifas da oficina</summary>
    <ul>{data.tariffs.map(t=><li key={t.id}>{t.name}: R$ {t.price}/kWh · {t.valid_from} até {t.valid_until} (fim exclusivo) · {t.reference}</li>)}</ul>
    <div className="product-save-fields">
     <label>Nome da tarifa<input value={name} onChange={e=>setName(e.target.value)}/></label>
     <label>R$/kWh<input value={price} onChange={e=>setPrice(e.target.value)}/></label>
     <label>Vigência inicial<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
     <label>Vigência final (exclusiva)<input type="date" value={until} onChange={e=>setUntil(e.target.value)}/></label>
     <label>Referência da tarifa<input value={tariffRef} onChange={e=>setTariffRef(e.target.value)} placeholder="Conta de energia / documento"/></label>
    </div>
    <button type="button" disabled={busy||!name.trim()||!price||!from||!until||!tariffRef.trim()} onClick={()=>void load(()=>registerEnergyTariff(workspaceId,{name,price,from,until,reference:tariffRef}))}>Registrar tarifa da oficina</button>
   </details>
   <details><summary>Intervalos de energia</summary>
    <ul>{data.intervals.map(i=><li key={i.id}>{i.phase} · {i.start_at} — {i.end_at} · {i.source_kind} · {i.kwh??i.watts??'desconhecido'} {i.kwh!==null?'kWh':i.watts!==null?'W':''}</li>)}</ul>
    <div className="product-save-fields">
     <label>Início da fase<input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/></label>
     <label>Fim da fase<input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)}/></label>
     <label>Fase<select value={phase} onChange={e=>setPhase(e.target.value as typeof phase)}><option value="heating">Aquecimento</option><option value="printing">Impressão ativa</option><option value="pause">Pausa</option><option value="resume">Retomada</option><option value="unclassified">Não classificada</option></select></label>
     {phase==='pause'&&<label>Condição da pausa<select value={condition} onChange={e=>setCondition(e.target.value as typeof condition)}><option value="unknown">Desconhecida</option><option value="heated">Aquecida</option><option value="partially_heated">Parcialmente aquecida</option><option value="motors_on">Motores ligados</option><option value="standby">Espera</option><option value="off">Desligada</option></select></label>}
     <label>Fonte<select value={kind} onChange={e=>{setKind(e.target.value as typeof kind);setValue('');setReference('');}}><option value="unknown">Desconhecida</option><option value="measured">Medida</option><option value="maker_estimate">Estimativa do maker</option><option value="manufacturer_estimate">Estimativa de fabricante</option></select></label>
     {kind!=='unknown'&&<><label>{kind==='measured'?'Consumo medido (kWh)':'Potência média (W)'}<input value={value} onChange={e=>setValue(e.target.value)}/></label><label>Referência da fonte<input value={reference} onChange={e=>setReference(e.target.value)}/></label></>}
    </div>
    {kind==='maker_estimate'&&data.current_average_watts!==null&&<button type="button" onClick={()=>{setValue(data.current_average_watts??'');setReference('Estimativa do cadastro atual da impressora '+data.printer_id);}}>Usar potência cadastrada como estimativa</button>}
    <button type="button" disabled={busy||!start||!end||end<=start||(kind!=='unknown'&&(!value||!reference.trim()))} onClick={()=>void load(()=>recordEnergyInterval(workspaceId,executionId,{start:iso(start),end:iso(end),phase,condition:phase==='pause'?condition:null,kind,reference:kind==='unknown'?null:reference,kwh:kind==='measured'?value:null,watts:kind.endsWith('estimate')?value:null}))}>Registrar intervalo sem contabilização</button>
   </details>
   <div className="product-save-fields">
    {!data.start_at&&!savedIntegral&&<label>Início total observado<input type="datetime-local" value={periodStart} onChange={e=>{setPeriodStart(e.target.value);setDraft(null);onInvalidateAllocation?.();}}/></label>}
    {!data.end_at&&!savedIntegral&&<label>Fim total observado<input type="datetime-local" value={periodEnd} onChange={e=>{setPeriodEnd(e.target.value);setDraft(null);onInvalidateAllocation?.();}}/></label>}
   </div>
   <details><summary>Medição integral da execução</summary>
    <label><input type="checkbox" checked={integralEnabled} disabled={!!savedIntegral} onChange={e=>{setIntegralEnabled(e.target.checked);setDraft(null);onInvalidateAllocation?.();}}/> Tenho medição real que cobre todo o período informado</label>
    <p className="footnote">A medição integral substitui a soma das fases, não é adicionada a ela. Confirme que o medidor cobre exatamente o início e fim da execução. O registro preserva a medição original; não confirma custo financeiro.</p>
    {integralEnabled&&<div className="product-save-fields">
     <label>Consumo integral medido (kWh)<input inputMode="decimal" readOnly={!!savedIntegral} value={integralKwh} onChange={e=>{setIntegralKwh(e.target.value);setDraft(null);onInvalidateAllocation?.();}}/></label>
     <label>Referência do medidor<input readOnly={!!savedIntegral} value={integralRef} onChange={e=>{setIntegralRef(e.target.value);setDraft(null);onInvalidateAllocation?.();}}/></label>
    </div>}
    {savedIntegral?<p>Registro preservado: {savedIntegral.reference} · {savedIntegral.kwh} kWh · {savedIntegral.start_at} — {savedIntegral.end_at}. Correções exigem revisão auditável.</p>:integralEnabled&&<button type="button" disabled={busy||!(data.start_at||periodStart)||!(data.end_at||periodEnd)||!integralKwh.trim()||!integralRef.trim()} onClick={()=>void load(()=>recordIntegralEnergy(workspaceId,executionId,{start:data.start_at??iso(periodStart),end:data.end_at??iso(periodEnd),kwh:integralKwh,reference:integralRef}))}>Registrar medição integral</button>}
    {savedIntegral&&<details><summary>Histórico e correção da medição</summary>
     {originalIntegral&&<p>Original: {originalIntegral.kwh} kWh · {originalIntegral.reference} · Autor: {originalIntegral.author_id} · {originalIntegral.created_at}</p>}
     <ul>{revisions.map(r=><li key={r.id}>{r.kwh} kWh · {r.reference} · {r.reason} · Autor: {r.author_id} · {r.created_at}</li>)}</ul>
     <div className="product-save-fields">
      <label>Consumo corrigido (kWh)<input inputMode="decimal" value={revisionKwh} onChange={e=>setRevisionKwh(e.target.value)}/></label>
      <label>Referência corrigida<input value={revisionReference} onChange={e=>setRevisionReference(e.target.value)}/></label>
      <label>Justificativa da correção<input value={revisionReason} onChange={e=>setRevisionReason(e.target.value)}/></label>
     </div>
     <p className="footnote">O registro original será preservado. A revisão não altera estoque, snapshots financeiros ou período observado.</p>
     <button type="button" disabled={busy||!revisionKwh.trim()||!revisionReference.trim()||!revisionReason.trim()} onClick={revise}>Registrar revisão auditável</button>
    </details>}
   </details>
   <button type="button" disabled={busy||!(data.start_at||savedIntegral?.start_at||periodStart)||!(data.end_at||savedIntegral?.end_at||periodEnd)||(integralEnabled&&(!integralKwh.trim()||!integralRef.trim()))} onClick={calculate}>Calcular energia registrada</button>
   {draft&&<div role="status"><p>Fechamento financeiro: PENDENTE.</p><p>{draft.categoryCents===null?'Custo energético desconhecido': 'Energia: '+draft.categoryCents+' centavos (prévia)'}</p><p>Fonte: {draft.energySource}. Pendências: {draft.issues.join(', ')||'nenhuma no cálculo energético'}</p>
    {onUseForAllocation&&energyAllocationCandidate(draft)&&<button type="button" onClick={()=>{const candidate=energyAllocationCandidate(draft);if(candidate)onUseForAllocation(candidate);}}>Usar energia na prévia de rateio P05</button>}
    {onUseForAllocation&&!energyAllocationCandidate(draft)&&<small>Energia não importável: corrija as pendências ou informe medição e tarifa completas. Valores nulos não são zero.</small>}
   </div>}
  </>}
 </section>;
}
