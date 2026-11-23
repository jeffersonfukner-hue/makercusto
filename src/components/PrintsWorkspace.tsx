import {useEffect,useRef,useState} from 'react';
import {createPrint,confirmPrint,listPrints,listPrinters,listProducts,listExistingSpools,listPrintReservations,reservePrintLot,setPrintReservationDue,cancelPrint,reducePrintPlan,swapPrintReservedLot,recordPhysicalOccurrence,listPhysicalOccurrences,reviewPhysicalOccurrence,listPhysicalOccurrenceReviews,proposeInventoryAdjustment,listInventoryAdjustmentProposals,
 type PrintRecord,type ProductRecord,type StoredPrinter,type ExistingSpool,type PrintReservation,type PhysicalConsumptionOccurrence,type PhysicalOccurrenceReview,type InventoryAdjustmentProposal} from '../data/supabase';

const newKey=()=>crypto.randomUUID();
const valid=(value:string)=>value.trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=0;
export function PrintsWorkspace({workspaceId}:{workspaceId:string|null}){
 const [printers,setPrinters]=useState<StoredPrinter[]>([]),[products,setProducts]=useState<ProductRecord[]>([]);
 const [spools,setSpools]=useState<ExistingSpool[]>([]),[prints,setPrints]=useState<PrintRecord[]>([]),[reservations,setReservations]=useState<PrintReservation[]>([]),[occurrences,setOccurrences]=useState<PhysicalConsumptionOccurrence[]>([]);
 const [printer,setPrinter]=useState(''),[product,setProduct]=useState(''),[quantity,setQuantity]=useState('1');
 const [hours,setHours]=useState(''),[source,setSource]=useState<'slicer'|'measured'|'informed'|'estimated'>('slicer');
 const [notes,setNotes]=useState(''),[outputs,setOutputs]=useState<{product_id:string;quantity:number;name:string}[]>([]);
 const [selected,setSelected]=useState(''),[selectedOutput,setSelectedOutput]=useState(''),[lot,setLot]=useState(''),[mass,setMass]=useState(''),[purge,setPurge]=useState(''),[loss,setLoss]=useState(''),[good,setGood]=useState(''),[failed,setFailed]=useState('0');
 const [reservePrintId,setReservePrintId]=useState(''),[reserveLot,setReserveLot]=useState(''),[reserveGrams,setReserveGrams]=useState('');
 const reservationKey=useRef(newKey());
 const [reduceTarget,setReduceTarget]=useState(''),[reduceOutput,setReduceOutput]=useState('');
 const [reducePlanned,setReducePlanned]=useState(''),[reduceReservation,setReduceReservation]=useState('');
 const [reduceGrams,setReduceGrams]=useState(''),[reduceReason,setReduceReason]=useState('');
 const reduceKey=useRef(newKey());
 const [swapReservation,setSwapReservation]=useState(''),[swapNewLot,setSwapNewLot]=useState('');
 const [swapRelease,setSwapRelease]=useState(''),[swapReserve,setSwapReserve]=useState('');
 const [swapReason,setSwapReason]=useState('');
 const swapKey=useRef(newKey());
 const [occPrint,setOccPrint]=useState(''),[occMaterial,setOccMaterial]=useState(''),[occGrams,setOccGrams]=useState('');
 const [occBasis,setOccBasis]=useState<'weighed'|'slicer'|'informed'|'other'>('weighed');
 const [occAt,setOccAt]=useState(''),[occLot,setOccLot]=useState('');
 const [occSource,setOccSource]=useState(''),[occEvidence,setOccEvidence]=useState(''),[occOrigin,setOccOrigin]=useState('');
 const [reviews,setReviews]=useState<PhysicalOccurrenceReview[]>([]);
 const [reviewOccurrence,setReviewOccurrence]=useState(''),[reviewNext,setReviewNext]=useState<'under_review'|'pending_decision'>('under_review');
 const [reviewCause,setReviewCause]=useState<PhysicalOccurrenceReview['cause_hypothesis']>('unknown');
 const [reviewNote,setReviewNote]=useState(''),[reviewEvidence,setReviewEvidence]=useState(''),[reviewLot,setReviewLot]=useState('');
 const reviewKey=useRef(newKey());
 const [proposals,setProposals]=useState<InventoryAdjustmentProposal[]>([]);
 const [proposalOccurrence,setProposalOccurrence]=useState(''),[proposalLot,setProposalLot]=useState('');
 const [proposalGrams,setProposalGrams]=useState(''),[proposalCause,setProposalCause]=useState<InventoryAdjustmentProposal['cause']>('verified_count_error');
 const [proposalOrigin,setProposalOrigin]=useState(''),[proposalReason,setProposalReason]=useState(''),[proposalEvidence,setProposalEvidence]=useState('');
 const proposalKey=useRef(newKey());
 const occKey=useRef(newKey());
 const [dueReservation,setDueReservation]=useState(''),[dueLocal,setDueLocal]=useState('');
 const [cancelTarget,setCancelTarget]=useState(''),[cancelReason,setCancelReason]=useState('');
 const cancelKey=useRef(newKey());
 const [basis,setBasis]=useState<'weighed'|'slicer'|'estimated'>('slicer'),[actualHours,setActualHours]=useState('');
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [reload,setReload]=useState(0),operation=useRef(newKey());
 useEffect(()=>{
  let live=true;if(!workspaceId)return;
  Promise.all([listPrinters(workspaceId),listProducts(workspaceId),listExistingSpools(workspaceId),listPrints(workspaceId),listPrintReservations(workspaceId),listPhysicalOccurrences(workspaceId),listPhysicalOccurrenceReviews(workspaceId),listInventoryAdjustmentProposals(workspaceId)])
   .then(([p,pr,s,executions,held,pending,history,adjustments])=>{if(live){setPrinters(p);setProducts(pr.filter(x=>x.kind!=='kit'));setSpools(s);setPrints(executions);setReservations(held);setOccurrences(pending);setReviews(history);setProposals(adjustments);}})
   .catch(e=>{if(live)setError('Falha ao consultar impressões: '+(e as Error).message);});
  return()=>{live=false};
 },[workspaceId,reload]);
 const addOutput=()=>{
  const p=products.find(x=>x.id===product),n=Number(quantity);
  if(!p||!Number.isInteger(n)||n<1||n>100000){setError('Selecione peça e quantidade inteira positiva.');return;}
  if(outputs.some(x=>x.product_id===product)){setError('Peça já incluída; remova para corrigir a quantidade.');return;}
  setOutputs(v=>[...v,{product_id:product,quantity:n,name:p.name}]);setError('');
 };
 const save=async()=>{
  if(!workspaceId||!printer||outputs.length===0||hours!==''&&(!valid(hours)||Number(hours)>100000)){setError('Informe impressora física, peças e tempo válido (ou deixe tempo vazio).');return;}
  setBusy(true);setError('');setMessage('');
  try{
   await createPrint(workspaceId,{printerId:printer,outputs,plannedHours:hours===''?null:Number(hours),notes,source});
   setMessage('Impressão registrada como rascunho. Nenhuma bobina foi consumida.');
   setOutputs([]);setNotes('');setHours('');setReload(x=>x+1);
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 };
 const remainingReserved=(lotId:string)=>reservations.filter(x=>x.lot_id===lotId&&x.status==='active').reduce((sum,x)=>sum+Number(x.remaining),0);
 const reserve=async()=>{
  if(!workspaceId||!reservePrintId||!reserveLot||!valid(reserveGrams)||Number(reserveGrams)<=0||
   Number(reserveGrams)>1000000||Math.abs(Number(reserveGrams)*1000-Math.round(Number(reserveGrams)*1000))>0.000001){
   setError('Selecione impressão, bobina e uma quantidade de reserva em gramas com até três casas decimais.');return;
  }
  const spool=spools.find(x=>x.id===reserveLot);
  const available=spool?Number(spool.remaining_grams)-remainingReserved(reserveLot):0;
  if(!spool||Number(reserveGrams)>available+0.000001){
   setError('Reserva excede a disponibilidade informada desta bobina; atualize os saldos antes de reservar.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await reservePrintLot(workspaceId,{productionId:reservePrintId,lotId:reserveLot,
    quantityGrams:Number(reserveGrams),key:reservationKey.current});
   reservationKey.current=newKey();
   setReserveGrams('');setMessage('Reserva lógica registrada sem movimentar o estoque físico.');
   setReload(x=>x+1);
  }catch(e){setError('Reserva recusada: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const updateReviewDue=async()=>{
  if(!workspaceId||!dueReservation){setError('Selecione uma reserva ativa.');return;}
  const parsed=dueLocal===''?null:new Date(dueLocal);
  if(parsed&&Number.isNaN(parsed.getTime())){setError('Data e hora de revisão inválidas.');return;}
  setBusy(true);setError('');setMessage('');
  try{
   await setPrintReservationDue(workspaceId,dueReservation,parsed?.toISOString()??null);
   setMessage('Prazo de revisão atualizado; nenhuma reserva foi liberada.');
   setReload(n=>n+1);
  }catch(e){setError('Prazo recusado: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const submitCancel=async()=>{
  const target=prints.find(p=>p.id===cancelTarget);
  if(!workspaceId||!target||!['draft','partial','reserved','running'].includes(target.status)){
   setError('Selecione uma impressão aberta para cancelar.');return;
  }
  if(cancelReason.trim().length<10||cancelReason.trim().length>1000){
   setError('Informe justificativa de cancelamento com 10 a 1000 caracteres.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await cancelPrint(workspaceId,cancelTarget,cancelKey.current,cancelReason.trim());
   cancelKey.current=newKey();setCancelTarget('');setCancelReason('');
   setMessage('Impressão cancelada. Reservas não utilizadas liberadas; consumos e peças anteriores preservados.');
   setReload(n=>n+1);
  }catch(e){setError('Cancelamento recusado: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const submitReduction=async()=>{
  if(!workspaceId||!reduceTarget||!reduceOutput){
   setError('Selecione uma impressão e uma peça para reduzir o planejamento.');return;
  }
  const print=prints.find(p=>p.id===reduceTarget);
  const output=print?.outputs.find(o=>o.id===reduceOutput);
  const newPlanned=Number(reducePlanned);
  if(!print||!output||reducePlanned.trim()===''||!Number.isInteger(newPlanned)||
    newPlanned<Number(output.good)+Number(output.failed)||newPlanned>=Number(output.planned)){
   setError('A nova quantidade deve ser inteira, menor que a planejada e nunca inferior às peças já confirmadas.');return;
  }
  const isReleasing=reduceReservation!=='';
  const reservation=reservations.find(x=>x.id===reduceReservation&&x.production_id===reduceTarget&&x.status==='active');
  const release=Number(reduceGrams);
  if((isReleasing&&(!reservation||!valid(reduceGrams)||release<=0||
    Math.abs(release*1000-Math.round(release*1000))>0.000001||
    release>Number(reservation.remaining)))||(!isReleasing&&reduceGrams.trim()!=='')){
   setError('Para liberar uma reserva, selecione a bobina e informe gramas válidos, até o saldo reservado, com três casas decimais.');return;
  }
  if(reduceReason.trim().length<10||reduceReason.trim().length>1000){
   setError('Informe justificativa de 10 a 1000 caracteres.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await reducePrintPlan(workspaceId,{productionId:reduceTarget,requestKey:reduceKey.current,
    outputChanges:[{output_id:reduceOutput,new_planned:newPlanned}],
    reservationReleases:isReleasing?[{reservation_id:reduceReservation,release_g:release}]:[],
    reason:reduceReason.trim()});
   reduceKey.current=newKey();setReduceTarget('');setReduceOutput('');setReducePlanned('');
   setReduceReservation('');setReduceGrams('');setReduceReason('');
   setMessage('Planejamento parcialmente reduzido. Peças, consumo e tempo já confirmados preservados; apenas a reserva informada foi liberada.');
   setReload(n=>n+1);
  }catch(e){setError('Redução parcial recusada: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const submitSwap=async()=>{
  const old=reservations.find(x=>x.id===swapReservation&&x.status==='active');
  const nextLot=spools.find(x=>x.id===swapNewLot);
  if(!workspaceId||!old||!nextLot||old.lot_id===swapNewLot){
   setError('Selecione reserva ativa e bobina substituta diferente da origem.');return;
  }
  const release=Number(swapRelease),held=Number(swapReserve);
  if(!valid(swapRelease)||!valid(swapReserve)||release<=0||held<=0||
    Math.abs(release*1000-Math.round(release*1000))>0.000001||
    Math.abs(held*1000-Math.round(held*1000))>0.000001||
    release>Number(old.remaining)||held>1000000){
   setError('Informe gramas positivos, até três casas, sem exceder a reserva de origem.');return;
  }
  const available=Number(nextLot.remaining_grams)-remainingReserved(swapNewLot);
  if(held>available+0.000001){
   setError('A bobina substituta não tem saldo disponível após outras reservas.');return;
  }
  if(swapReason.trim().length<10||swapReason.trim().length>1000){
   setError('Informe justificativa da troca de 10 a 1000 caracteres.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await swapPrintReservedLot(workspaceId,{productionId:old.production_id,oldReservationId:old.id,
    newLotId:swapNewLot,releaseGrams:release,newReserveGrams:held,
    requestKey:swapKey.current,reason:swapReason.trim()});
   swapKey.current=newKey();setSwapReservation('');setSwapNewLot('');setSwapRelease('');
   setSwapReserve('');setSwapReason('');
   setMessage('Troca de reserva registrada. Nenhum filamento foi baixado nem houve alteração dos custos históricos.');
   setReload(n=>n+1);
  }catch(e){setError('Troca de bobina recusada: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const recordOccurrence=async()=>{
  if(!workspaceId||!occPrint||occMaterial.trim().length<2||occMaterial.trim().length>150
    ||!valid(occGrams)||Number(occGrams)<=0||Number(occGrams)>1000000
    ||Math.abs(Number(occGrams)*1000-Math.round(Number(occGrams)*1000))>0.000001){
   setError('Informe impressão, material e massa observada positiva, com até três casas decimais.');return;
  }
  if(!occAt){setError('Informe a data e a hora efetivas da ocorrência física.');return;}
  const date=new Date(occAt);
  if(Number.isNaN(date.getTime())||date.getTime()>Date.now()+5*60000){
   setError('Data da ocorrência inválida ou futura.');return;
  }
  if(occSource.trim().length<10||occSource.trim().length>1000
    ||(occEvidence.trim()!==''&&(occEvidence.trim().length<3||occEvidence.trim().length>2000))
    ||(occOrigin.trim()!==''&&(occOrigin.trim().length<3||occOrigin.trim().length>1000))){
   setError('Explique como foi constatada a ocorrência (10 a 1000 caracteres); confira evidência e possível origem.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await recordPhysicalOccurrence(workspaceId,{productionId:occPrint,materialName:occMaterial.trim(),
    quantityGrams:Number(occGrams),basis:occBasis,observedAt:date.toISOString(),
    sourceNote:occSource.trim(),possibleLotId:occLot||null,
    evidenceReference:occEvidence.trim()||null,possibleOriginNote:occOrigin.trim()||null,
    key:occKey.current});
   occKey.current=newKey();setOccGrams('');setOccSource('');setOccEvidence('');setOccOrigin('');
   setMessage('Ocorrência física registrada como pendente. Nenhuma baixa, entrada ou custo foi lançado.');
   setReload(n=>n+1);
  }catch(e){setError('Ocorrência recusada: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const submitOccurrenceReview=async()=>{
  const occurrence=occurrences.find(x=>x.id===reviewOccurrence);
  if(!workspaceId||!occurrence){setError('Selecione uma ocorrência registrada.');return;}
  const permitted=occurrence.status==='registered'?reviewNext==='under_review':
    occurrence.status==='under_review'?reviewNext==='pending_decision':reviewNext==='under_review';
  if(!permitted){setError('Transição de acompanhamento inválida: não é permitido regularizar por investigação.');return;}
  if(reviewNote.trim().length<10||reviewNote.trim().length>2000||
    (reviewEvidence.trim()!==''&&(reviewEvidence.trim().length<3||reviewEvidence.trim().length>2000))){
   setError('Descreva a investigação em 10 a 2000 caracteres; confira a referência de evidência.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await reviewPhysicalOccurrence(workspaceId,{occurrenceId:occurrence.id,nextStatus:reviewNext,
    causeHypothesis:reviewCause,findingNote:reviewNote.trim(),
    evidenceReference:reviewEvidence.trim()||null,possibleLotId:reviewLot||null,key:reviewKey.current});
   reviewKey.current=newKey();setReviewOccurrence('');setReviewCause('unknown');
   setReviewNote('');setReviewEvidence('');setReviewLot('');
   setMessage('Investigação registrada no histórico. Nenhum ajuste de estoque, aprovação ou custo foi realizado.');
   setReload(n=>n+1);
  }catch(e){setError('Investigação recusada: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const submitInventoryProposal=async()=>{
  const occurrence=occurrences.find(x=>x.id===proposalOccurrence);
  const grams=Number(proposalGrams);
  if(!workspaceId||!occurrence||!['under_review','pending_decision'].includes(occurrence.status)
   ||!spools.some(x=>x.id===proposalLot)){
   setError('Selecione uma ocorrência investigada e uma bobina existente da oficina.');return;
  }
  if(proposalGrams.trim()===''||!Number.isFinite(grams)||grams===0||Math.abs(grams)>1000000
   ||Math.abs(grams*1000-Math.round(grams*1000))>0.000001){
   setError('Informe ajuste proposto em gramas, diferente de zero, com até três casas decimais.');return;
  }
  if(proposalOrigin.trim().length<10||proposalOrigin.trim().length>2000
   ||proposalReason.trim().length<10||proposalReason.trim().length>2000
   ||proposalEvidence.trim().length<3||proposalEvidence.trim().length>2000){
   setError('Informe origem e justificativa de 10 a 2000 caracteres e evidência de 3 a 2000.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await proposeInventoryAdjustment(workspaceId,{occurrenceId:occurrence.id,lotId:proposalLot,
    deltaGrams:grams,cause:proposalCause,originNote:proposalOrigin.trim(),
    justification:proposalReason.trim(),evidenceReference:proposalEvidence.trim(),
    key:proposalKey.current});
   proposalKey.current=newKey();setProposalOccurrence('');setProposalLot('');setProposalGrams('');
   setProposalOrigin('');setProposalReason('');setProposalEvidence('');
   setMessage('Proposta registrada como pendente de decisão. Nenhum ajuste de estoque, custo ou aprovação foi executado.');
   setReload(n=>n+1);
  }catch(e){setError('Proposta de inventário recusada: '+(e as Error).message)}
  finally{setBusy(false)}
 };
 const selectedPrint=prints.find(p=>p.id===selected);
 const confirm=async()=>{
  if(!workspaceId||!selectedPrint||!lot||!valid(mass)||!valid(purge)||!valid(loss)||Number(mass)+Number(purge)+Number(loss)<=0||!valid(good)||!valid(failed)){
   setError('Informe impressão, bobina, consumo positivo e peças novas boas/rejeitadas.');return;
  }
  if(!Number.isInteger(Number(good))||!Number.isInteger(Number(failed))){setError('As peças devem ser números inteiros.');return;}
  if(actualHours!==''&&(!valid(actualHours)||Number(actualHours)>100000||Math.abs(Number(actualHours)*10000-Math.round(Number(actualHours)*10000))>0.000001)){
   setError('Informe tempo real adicional válido, em horas, com até quatro casas decimais, ou deixe vazio.');return;
  }
  if(!selectedPrint.outputs.some(o=>o.id===selectedOutput)){setError('Selecione a peça à qual pertencem as unidades confirmadas. Material compartilhado permanece sem rateio financeiro até L4.');return;}
  const output=selectedPrint.outputs.find(o=>o.id===selectedOutput)!;
  if(Number(good)+Number(failed)>Number(output.planned)-Number(output.good)-Number(output.failed)){
   setError('A quantidade adicional excede as peças ainda pendentes desta impressão.');return;
  }
  if([mass,purge,loss].some(v=>Math.abs(Number(v)*1000-Math.round(Number(v)*1000))>0.000001)){
   setError('Informe massas em gramas com até três casas decimais.');return;
  }
  setBusy(true);setError('');setMessage('');
  try{
   await confirmPrint(workspaceId,{id:selectedPrint.id,key:operation.current,
    outputs:Number(good)+Number(failed)>0?[{output_id:output.id,good:Number(good),failed:Number(failed)}]:[],
    consumptions:[{lot_id:lot,model_g:Number(mass),purge_g:Number(purge),loss_g:Number(loss),basis}],actualHours:actualHours===''?null:Number(actualHours)});
   operation.current=newKey();
   setMessage('Confirmação incremental registrada; consumo da bobina baixado somente uma vez.');
   setMass('');setPurge('');setLoss('');setGood('');setFailed('0');setActualHours('');setReload(v=>v+1);
  }catch(e){setError('Confirmação recusada: '+(e as Error).message)}finally{setBusy(false)}
 };
 return <section className="materials-workspace" aria-label="Registro real de impressões">
  <div className="product-workspace-heading"><div><h2>Impressões da oficina</h2>
   <p>L2 registra a impressão sem baixar estoque. L3 confirma apenas os incrementos físicos.</p></div></div>
  {error&&<p role="alert" className="error">{error}</p>}{message&&<p role="status" className="product-success">{message}</p>}
  <section className="panel materials-form"><h3>Nova impressão</h3>
   <div className="product-save-fields">
    <label>Impressora física<select aria-label="Impressora física" value={printer} onChange={e=>setPrinter(e.target.value)}>
     <option value="">Selecione</option>{printers.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select>
     <small>É a unidade da oficina, não o modelo global.</small></label>
    <label>Fonte dos dados<select aria-label="Fonte dos dados de impressão" value={source} onChange={e=>setSource(e.target.value as typeof source)}>
     <option value="slicer">Fatiador</option><option value="measured">Medição</option><option value="informed">Informado</option><option value="estimated">Estimado</option></select></label>
    <label>Tempo previsto (horas, opcional)<input aria-label="Tempo previsto" type="number" min="0" step=".0001" value={hours} onChange={e=>setHours(e.target.value)}/>
     <small>Não presumimos tempos nem consumo.</small></label>
    <label>Observações<input aria-label="Observações da impressão" value={notes} maxLength={2000} onChange={e=>setNotes(e.target.value)}/></label>
    <label>Peça<select aria-label="Peça a imprimir" value={product} onChange={e=>setProduct(e.target.value)}>
     <option value="">Selecione</option>{products.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
    <label>Quantidade planejada<input aria-label="Quantidade planejada" type="number" min="1" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
   </div>
   <button type="button" onClick={addOutput} disabled={busy}>+ Adicionar peça à mesa</button>
   <ul>{outputs.map(o=><li key={o.product_id}>{o.name}: {o.quantity} <button type="button" aria-label={'Remover '+o.name} onClick={()=>setOutputs(v=>v.filter(x=>x.product_id!==o.product_id))}>Remover</button></li>)}</ul>
   <button type="button" className="primary-action" disabled={busy||!workspaceId||outputs.length===0} onClick={()=>void save()}>{busy?'Salvando…':'Registrar impressão sem baixa'}</button>
  </section>
  <section className="panel materials-form"><h3>Reserva opcional de filamento</h3>
   <p className="footnote">A reserva apenas compromete gramas da bobina para esta impressão. Não retira material físico nem gera custo. O saldo reservado é abatido somente durante confirmações reais.</p>
   <div className="product-save-fields">
    <label>Impressão para reservar<select aria-label="Impressão para reservar" value={reservePrintId} onChange={e=>{setReservePrintId(e.target.value);reservationKey.current=newKey();}}>
     <option value="">Selecione</option>{prints.filter(p=>p.status==='draft'||p.status==='partial').map(p=><option key={p.id} value={p.id}>{p.outputs.map(o=>o.name).join(' + ')} — {p.status}</option>)}</select></label>
    <label>Bobina para reservar<select aria-label="Bobina para reservar" value={reserveLot} onChange={e=>{setReserveLot(e.target.value);reservationKey.current=newKey();}}>
     <option value="">Selecione</option>{spools.map(x=><option key={x.id} value={x.id}>{x.label} — disponíveis {(Number(x.remaining_grams)-remainingReserved(x.id)).toFixed(3)} g</option>)}</select>
     <small>Disponível = físico menos reservas ativas da oficina.</small></label>
    <label>Quantidade a reservar (g)<input aria-label="Quantidade a reservar" type="number" min=".001" step=".001" value={reserveGrams} onChange={e=>{setReserveGrams(e.target.value);reservationKey.current=newKey();}}/>
     <small>Reserva opcional, por bobina. Não libera sobra em uma confirmação parcial.</small></label>
   </div>
   <button type="button" className="primary-action" disabled={busy||!workspaceId||!reservePrintId||!reserveLot} onClick={()=>void reserve()}>{busy?'Registrando…':'Registrar reserva sem baixa'}</button>
   {reservations.filter(x=>x.status==='active').length>0&&<ul aria-label="Reservas ativas da oficina">
    {reservations.filter(x=>x.status==='active').map(x=><li key={x.id}>{x.lot_label||'Bobina'} — reservado {x.remaining} g de {x.quantity} g para {prints.find(p=>p.id===x.production_id)?.outputs.map(o=>o.name).join(' + ')||'impressão registrada'}
     {x.due_at&&<> · Revisão: {new Date(x.due_at).toLocaleString('pt-BR')}{x.review_overdue&&<strong> · Revisão vencida (reserva mantida)</strong>}</>}
    </li>)}
   </ul>}
   {reservations.some(x=>x.status==='active')&&<div className="product-save-fields">
    <label>Reserva para revisar<select aria-label="Reserva para revisar" value={dueReservation} onChange={e=>{setDueReservation(e.target.value);setDueLocal('');}}>
     <option value="">Selecione</option>{reservations.filter(x=>x.status==='active').map(x=><option key={x.id} value={x.id}>{x.lot_label||'Bobina'} — {x.remaining} g</option>)}</select></label>
    <label>Data e hora de revisão (opcional)<input aria-label="Data e hora de revisão" type="datetime-local" value={dueLocal} onChange={e=>setDueLocal(e.target.value)}/>
     <small>Uma data vencida apenas alerta. Nunca libera reserva. Deixe vazio para remover a data.</small></label>
    <button type="button" disabled={busy||!dueReservation} onClick={()=>void updateReviewDue()}>Salvar prazo de revisão</button>
   </div>}
  </section>
  <section className="panel materials-form"><h3>Confirmação incremental de impressão</h3>
   <p className="footnote">Confirme a quantidade produzida de cada peça separadamente. O consumo e o tempo informados são incrementais; registre falhas mesmo sem peças boas. O material da mesa não será rateado financeiramente entre as peças até L4. Encerramento definitivo bloqueado.</p>
   <div className="product-save-fields">
    <label>Impressão<select aria-label="Impressão para confirmar" value={selected} onChange={e=>{setSelected(e.target.value);setSelectedOutput('');operation.current=newKey();}}>
     <option value="">Selecione</option>{prints.filter(p=>p.status==='draft'||p.status==='partial').map(p=><option key={p.id} value={p.id}>{p.outputs.map(o=>o.name).join(' + ')} — {p.status}</option>)}</select></label>
    <label>Peça confirmada<select aria-label="Peça confirmada" value={selectedOutput} onChange={e=>setSelectedOutput(e.target.value)}><option value="">Selecione</option>{selectedPrint?.outputs.map(o=><option key={o.id} value={o.id}>{o.name} — pendentes {Number(o.planned)-Number(o.good)-Number(o.failed)}</option>)}</select></label>
    <label>Bobina<select aria-label="Bobina consumida" value={lot} onChange={e=>setLot(e.target.value)}>
     <option value="">Selecione</option>{spools.map(s=><option key={s.id} value={s.id}>{s.label} — {s.remaining_grams} g</option>)}</select></label>
    <label>Consumo adicional de modelo (g)<input type="number" min=".001" step=".001" aria-label="Consumo adicional" value={mass} onChange={e=>setMass(e.target.value)}/><small>Somente gramas novas, sem repetir purga/perdas já incluídas. Origem obrigatória.</small></label>
    <label>Purga adicional (g)<input aria-label="Purga adicional" type="number" step=".001" min="0" value={purge} onChange={e=>setPurge(e.target.value)}/><small>Informe 0 se já estiver incluída no peso do modelo.</small></label>
    <label>Perda adicional (g)<input aria-label="Perda adicional" type="number" step=".001" min="0" value={loss} onChange={e=>setLoss(e.target.value)}/><small>Informe 0 quando não houver perda adicional; nunca conte a mesma massa duas vezes.</small></label>
    <label>Fonte do consumo<select aria-label="Fonte do consumo" value={basis} onChange={e=>setBasis(e.target.value as typeof basis)}><option value="weighed">Pesado</option><option value="slicer">Fatiador</option><option value="estimated">Estimado</option></select></label>
    <label>Tempo real adicional (h, opcional)<input aria-label="Tempo real adicional" type="number" step=".0001" min="0" value={actualHours} onChange={e=>setActualHours(e.target.value)}/><small>Informe somente o tempo novo desta confirmação. Em falha, registre o tempo efetivo mesmo com zero peças boas. Deixe vazio se desconhecido; nunca repetimos períodos anteriores.</small></label>
    <label>Peças boas adicionais<input aria-label="Peças boas adicionais" type="number" min="0" step="1" value={good} onChange={e=>setGood(e.target.value)}/></label>
    <label>Peças rejeitadas adicionais<input aria-label="Peças rejeitadas adicionais" type="number" min="0" step="1" value={failed} onChange={e=>setFailed(e.target.value)}/></label>
   </div>
   <button type="button" className="primary-action" disabled={busy||!selected||!lot||!workspaceId||!selectedOutput} onClick={()=>void confirm()}>{busy?'Confirmando…':'Confirmar consumo incremental'}</button>
  </section>
  <section className="panel materials-form" aria-label="Ocorrências físicas pendentes">
   <h3>Ocorrência física pendente — GAP01</h3>
   <p className="footnote">Registre o que realmente aconteceu, mesmo quando a massa observada exceder o saldo cadastrado ou a bobina não for conhecida. Este registro NÃO é baixa de estoque, confirmação de consumo, regularização financeira ou aprovação.</p>
   <div className="product-save-fields">
    <label>Impressão da ocorrência<select aria-label="Impressão da ocorrência" value={occPrint} onChange={e=>{setOccPrint(e.target.value);occKey.current=newKey();}}>
     <option value="">Selecione</option>{prints.map(p=><option key={p.id} value={p.id}>{p.outputs.map(o=>o.name).join(' + ')} — {p.status}</option>)}</select></label>
    <label>Material observado<input aria-label="Material observado" maxLength={150} value={occMaterial} onChange={e=>{setOccMaterial(e.target.value);occKey.current=newKey();}}/>
     <small>Nome informado do material. Não cria cadastro de estoque nem filamento fictício.</small></label>
    <label>Massa física observada (g)<input aria-label="Massa física observada" type="number" step=".001" min=".001" value={occGrams} onChange={e=>{setOccGrams(e.target.value);occKey.current=newKey();}}/>
     <small>Informe a quantidade total da ocorrência, sem reduzir artificialmente para caber no saldo.</small></label>
    <label>Fonte de aferição<select aria-label="Fonte da ocorrência física" value={occBasis} onChange={e=>{setOccBasis(e.target.value as typeof occBasis);occKey.current=newKey();}}>
     <option value="weighed">Pesagem</option><option value="slicer">Fatiador</option><option value="informed">Relato</option><option value="other">Outra fonte</option></select></label>
    <label>Data e hora observadas<input aria-label="Data e hora da ocorrência" type="datetime-local" value={occAt} onChange={e=>{setOccAt(e.target.value);occKey.current=newKey();}}/>
     <small>Obrigatórias; informe quando ocorreu de fato, sem horário presumido.</small></label>
    <label>Bobina possivelmente utilizada (opcional)<select aria-label="Bobina possivelmente utilizada" value={occLot} onChange={e=>{setOccLot(e.target.value);occKey.current=newKey();}}>
     <option value="">Origem não identificada</option>{spools.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select>
     <small>Hipótese, não confirmação. Saldo insuficiente não impede registrar o ocorrido.</small></label>
    <label>Como foi constatado<input aria-label="Como foi constatado" maxLength={1000} value={occSource} onChange={e=>{setOccSource(e.target.value);occKey.current=newKey();}}/>
     <small>Descreva pesagem, relato ou outra fonte observada; 10 a 1000 caracteres.</small></label>
    <label>Referência da evidência (opcional)<input aria-label="Referência da evidência" maxLength={2000} value={occEvidence} onChange={e=>{setOccEvidence(e.target.value);occKey.current=newKey();}}/>
     <small>Ex.: número do relatório, anotação ou foto já armazenada. Este campo não envia arquivos.</small></label>
    <label>Possível origem, ainda não comprovada (opcional)<input aria-label="Possível origem da ocorrência" maxLength={1000} value={occOrigin} onChange={e=>{setOccOrigin(e.target.value);occKey.current=newKey();}}/></label>
   </div>
   <button type="button" className="primary-action" disabled={busy||!workspaceId||!occPrint}
    onClick={()=>void recordOccurrence()}>{busy?'Registrando…':'Registrar ocorrência sem baixa'}</button>
   {occurrences.length>0&&<div>
    <h4>Ocorrências registradas para análise</h4>
    <ul aria-label="Ocorrências físicas registradas">
     {occurrences.map(o=><li key={o.id}>
      <strong>{o.status==='registered'?'Registrada, aguardando análise':o.status==='under_review'?'Em análise':'Pendente de decisão'}</strong>
      {' — '}{o.material_name}, {o.quantity_g} g — {new Date(o.observed_at).toLocaleString('pt-BR')}
      {o.possible_lot_label&&<> — possível bobina: {o.possible_lot_label}</>}
      <small>Sem baixa e sem custo confirmado. Fonte: {o.source_note}</small>
     </li>)}
    </ul>
   </div>}
   <h4>Investigação da ocorrência — sem regularização</h4>
   <p className="footnote">Cada investigação acrescenta um evento auditável. A causa selecionada continua sendo hipótese até conferência externa; não altera massa observada, saldo, reserva ou custo.</p>
   <div className="product-save-fields">
    <label>Ocorrência para investigar<select aria-label="Ocorrência para investigar" value={reviewOccurrence}
     onChange={e=>{const id=e.target.value;setReviewOccurrence(id);const item=occurrences.find(x=>x.id===id);
      setReviewNext(item?.status==='under_review'?'pending_decision':'under_review');
      setReviewNote('');setReviewEvidence('');setReviewLot('');reviewKey.current=newKey();}}>
     <option value="">Selecione</option>{occurrences.map(o=><option key={o.id} value={o.id}>{o.material_name} — {o.quantity_g} g — {o.status}</option>)}
    </select></label>
    <label>Próxima etapa do acompanhamento<select aria-label="Etapa de acompanhamento" value={reviewNext}
     onChange={e=>{setReviewNext(e.target.value as typeof reviewNext);reviewKey.current=newKey();}}>
     {occurrences.find(x=>x.id===reviewOccurrence)?.status==='under_review'?
      <option value="pending_decision">Pendente de decisão (sem aprovação)</option>:
      <option value="under_review">Em análise</option>}
    </select><small>Não existe opção de regularizar ou autorizar movimento de estoque neste fluxo.</small></label>
    <label>Hipótese investigada<select aria-label="Hipótese da divergência" value={reviewCause}
     onChange={e=>{setReviewCause(e.target.value as typeof reviewCause);reviewKey.current=newKey();}}>
     <option value="unknown">Origem ainda desconhecida</option>
     <option value="unrecorded_input">Possível entrada não contabilizada</option>
     <option value="lot_change">Possível troca de bobina</option>
     <option value="quantity_error">Possível erro de contagem</option>
     <option value="other">Outra hipótese</option></select>
     <small>Uma hipótese não confirma entrada, compra ou novo custo.</small></label>
    <label>Relato da investigação<textarea aria-label="Relato da investigação" maxLength={2000} rows={3}
     value={reviewNote} onChange={e=>{setReviewNote(e.target.value);reviewKey.current=newKey();}}/>
     <small>10 a 2000 caracteres. Preserve a observação original e detalhe o que foi apurado ou segue incerto.</small></label>
    <label>Evidência adicional (opcional)<input aria-label="Evidência da investigação" maxLength={2000}
     value={reviewEvidence} onChange={e=>{setReviewEvidence(e.target.value);reviewKey.current=newKey();}}/>
     <small>Referência de documento ou foto existente, sem assumir prova suficiente ou enviar arquivo.</small></label>
    <label>Bobina sob investigação (opcional)<select aria-label="Bobina sob investigação" value={reviewLot}
     onChange={e=>{setReviewLot(e.target.value);reviewKey.current=newKey();}}>
     <option value="">Nenhuma bobina comprovada</option>{spools.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
   </div>
   <button type="button" className="primary-action" disabled={busy||!reviewOccurrence}
    onClick={()=>void submitOccurrenceReview()}>{busy?'Registrando…':'Registrar investigação sem ajuste'}</button>
   {reviews.length>0&&<div>
    <h4>Histórico de investigações</h4>
    <ul aria-label="Histórico de investigações GAP01">{reviews.map(r=><li key={r.id}>
     <strong>{r.next_status==='under_review'?'Em análise':'Pendente de decisão'}</strong>
     {' — '}{new Date(r.created_at).toLocaleString('pt-BR')} — {r.finding_note}
     <small>Hipótese: {r.cause_hypothesis}; responsável: {r.author_id}
      {r.evidence_reference&&'; evidência: '+r.evidence_reference}. Nenhuma regularização aprovada.</small>
    </li>)}</ul>
   </div>}
  </section>
  <section className="panel materials-form" aria-label="Propostas de ajuste de inventário GAP01">
   <h3>Proposta de correção de inventário — GAP01-C</h3>
   <p className="footnote">Apenas uma proposta para análise humana. Quantidades positivas ou negativas não movimentam estoque, não corrigem saldos e não atribuem custo. Nenhuma aprovação extraordinária está habilitada.</p>
   <div className="product-save-fields">
    <label>Ocorrência investigada<select aria-label="Ocorrência para proposta de inventário" value={proposalOccurrence}
     onChange={e=>{setProposalOccurrence(e.target.value);proposalKey.current=newKey();}}>
     <option value="">Selecione</option>
     {occurrences.filter(o=>o.status==='under_review'||o.status==='pending_decision').map(o=><option key={o.id} value={o.id}>
      {o.material_name} — {o.quantity_g} g — {o.status}
     </option>)}</select><small>É necessário registrar a investigação antes de propor qualquer correção.</small></label>
    <label>Bobina cadastrada para possível ajuste<select aria-label="Bobina da proposta de ajuste" value={proposalLot}
     onChange={e=>{setProposalLot(e.target.value);proposalKey.current=newKey();}}>
     <option value="">Selecione</option>{spools.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
    </select><small>O lote deve existir na oficina; nenhuma nova compra ou bobina é criada.</small></label>
    <label>Diferença proposta em gramas<input aria-label="Diferença proposta em gramas" type="number" step=".001" value={proposalGrams}
     onChange={e=>{setProposalGrams(e.target.value);proposalKey.current=newKey();}}/>
     <small>Positivo para material anteriormente não contabilizado; negativo para erro de contagem demonstrado. Não é uma baixa.</small></label>
    <label>Causa investigada<select aria-label="Causa da proposta de inventário" value={proposalCause}
     onChange={e=>{setProposalCause(e.target.value as typeof proposalCause);proposalKey.current=newKey();}}>
     <option value="verified_count_error">Erro de contagem</option>
     <option value="unrecorded_physical_input">Material físico anteriormente não contabilizado</option>
    </select><small>A causa informada é submetida à revisão, não considerada automaticamente comprovada.</small></label>
    <label>Origem material a conferir<textarea aria-label="Origem material a conferir" rows={2} maxLength={2000} value={proposalOrigin}
     onChange={e=>{setProposalOrigin(e.target.value);proposalKey.current=newKey();}}/>
     <small>Identifique a origem real alegada, sem inventar compra ou fornecedor.</small></label>
    <label>Justificativa da proposta<textarea aria-label="Justificativa da proposta" rows={2} maxLength={2000} value={proposalReason}
     onChange={e=>{setProposalReason(e.target.value);proposalKey.current=newKey();}}/></label>
    <label>Evidência do inventário<input aria-label="Evidência da proposta" maxLength={2000} value={proposalEvidence}
     onChange={e=>{setProposalEvidence(e.target.value);proposalKey.current=newKey();}}/>
     <small>Referência verificável da pesagem, contagem ou documento. Este campo não envia arquivos.</small></label>
   </div>
   <button type="button" className="primary-action" disabled={busy||!proposalOccurrence||!proposalLot}
    onClick={()=>void submitInventoryProposal()}>{busy?'Registrando…':'Registrar proposta sem alterar estoque'}</button>
   {proposals.length>0&&<div><h4>Propostas pendentes de decisão</h4>
    <ul aria-label="Propostas de inventário pendentes">{proposals.map(p=><li key={p.id}>
     <strong>Pendente de decisão</strong> — {p.lot_label}, {p.proposed_delta_g>0?'+':''}{p.proposed_delta_g} g
     {' — '}{p.justification}
     <small>Evidência: {p.evidence_reference}. Nenhuma baixa, entrada, aprovação ou custo confirmado.</small>
    </li>)}</ul>
   </div>}
  </section>
  <section className="panel materials-form"><h3>Trocar bobina reservada</h3>
   <p className="footnote">A troca ajusta apenas as reservas lógicas. O filamento já consumido continua atribuído à bobina original, com o preço histórico original. A próxima confirmação deve indicar a bobina realmente consumida.</p>
   <div className="product-save-fields">
    <label>Reserva de origem<select aria-label="Reserva de origem para troca" value={swapReservation}
     onChange={e=>{setSwapReservation(e.target.value);setSwapNewLot('');setSwapRelease('');setSwapReserve('');swapKey.current=newKey();}}>
     <option value="">Selecione</option>
     {reservations.filter(r=>r.status==='active').map(r=><option value={r.id} key={r.id}>{r.lot_label||'Bobina'} — {r.remaining} g reservados</option>)}
    </select><small>Somente gramas ainda reservados podem ser liberados; nada retorna fisicamente à bobina.</small></label>
    <label>Nova bobina para reservar<select aria-label="Nova bobina para reservar" value={swapNewLot}
     onChange={e=>{setSwapNewLot(e.target.value);swapKey.current=newKey();}}>
     <option value="">Selecione</option>
     {spools.filter(x=>x.id!==reservations.find(r=>r.id===swapReservation)?.lot_id).map(x=><option value={x.id} key={x.id}>
      {x.label} — disponíveis {(Number(x.remaining_grams)-remainingReserved(x.id)).toFixed(3)} g
     </option>)}</select></label>
    <label>Gramas a liberar da origem<input aria-label="Gramas a liberar na troca" type="number" step=".001" min=".001"
     value={swapRelease} onChange={e=>{setSwapRelease(e.target.value);swapKey.current=newKey();}}/>
     <small>Pode liberar só parte do restante; o restante continua reservado na origem.</small></label>
    <label>Gramas a reservar na nova bobina<input aria-label="Gramas a reservar na nova bobina" type="number" step=".001" min=".001"
     value={swapReserve} onChange={e=>{setSwapReserve(e.target.value);swapKey.current=newKey();}}/>
     <small>Quantidade explicitamente informada; não presumimos igualdade nem conversão entre bobinas.</small></label>
    <label>Motivo da troca<input aria-label="Motivo da troca de bobina" value={swapReason} maxLength={1000}
     onChange={e=>{setSwapReason(e.target.value);swapKey.current=newKey();}}/>
     <small>Motivo obrigatório, auditado e associado aos dois lotes.</small></label>
   </div>
   <button className="primary-action" type="button" disabled={busy||!swapReservation||!swapNewLot}
    onClick={()=>void submitSwap()}>{busy?'Registrando…':'Confirmar troca de reserva'}</button>
  </section>
  <section className="panel materials-form"><h3>Cancelar parcialmente o planejamento</h3>
   <p className="footnote">Reduza somente peças ainda não produzidas. O material já extrudado e os resultados confirmados permanecem registrados. Informe explicitamente gramas a liberar por bobina: não presumimos consumo de material por peça.</p>
   <div className="product-save-fields">
    <label>Impressão para redução parcial<select aria-label="Impressão para redução parcial" value={reduceTarget}
     onChange={e=>{setReduceTarget(e.target.value);setReduceOutput('');setReduceReservation('');setReducePlanned('');setReduceGrams('');reduceKey.current=newKey();}}>
     <option value="">Selecione</option>{prints.filter(p=>p.status==='draft'||p.status==='partial').map(p=><option key={p.id} value={p.id}>{p.outputs.map(o=>o.name).join(' + ')}</option>)}</select></label>
    <label>Peça a reduzir<select aria-label="Peça a reduzir" value={reduceOutput}
     onChange={e=>{setReduceOutput(e.target.value);setReducePlanned('');reduceKey.current=newKey();}}>
     <option value="">Selecione</option>{prints.find(p=>p.id===reduceTarget)?.outputs.map(o=><option key={o.id} value={o.id}>{o.name} — previstas {o.planned}, confirmadas {Number(o.good)+Number(o.failed)}</option>)}</select></label>
    <label>Nova quantidade planejada<input aria-label="Novo total após redução parcial" type="number" min="0" step="1" value={reducePlanned}
     onChange={e=>{setReducePlanned(e.target.value);reduceKey.current=newKey();}}/>
     <small>Nunca inferior à soma de peças boas e rejeitadas já confirmadas.</small></label>
    <label>Reserva para liberação parcial (opcional)<select aria-label="Reserva para liberação parcial" value={reduceReservation}
     onChange={e=>{setReduceReservation(e.target.value);setReduceGrams('');reduceKey.current=newKey();}}>
     <option value="">Nenhuma liberação</option>{reservations.filter(r=>r.production_id===reduceTarget&&r.status==='active').map(r=><option key={r.id} value={r.id}>{r.lot_label||'Bobina'} — {r.remaining} g reservados</option>)}</select></label>
    <label>Gramas a liberar da reserva<input aria-label="Gramas a liberar da reserva" type="number" min="0" step=".001"
     disabled={!reduceReservation} value={reduceGrams}
     onChange={e=>{setReduceGrams(e.target.value);reduceKey.current=newKey();}}/>
     <small>Somente o excedente comprovado. Se houver mais de uma bobina, registre cada redução separadamente.</small></label>
    <label>Motivo da redução parcial<input aria-label="Motivo da redução parcial" value={reduceReason} maxLength={1000}
     onChange={e=>{setReduceReason(e.target.value);reduceKey.current=newKey();}}/>
     <small>Justificativa auditada, de 10 a 1000 caracteres.</small></label>
   </div>
   <button type="button" className="primary-action" disabled={busy||!reduceTarget||!reduceOutput}
    onClick={()=>void submitReduction()}>{busy?'Registrando…':'Confirmar redução parcial'}</button>
  </section>
  {cancelTarget&&<section className="panel materials-form" aria-label="Confirmar cancelamento de impressão">
   <h3>Confirmar cancelamento</h3>
   <p>O cancelamento encerra a impressão e libera somente reservas ainda não consumidas.
    Peças produzidas, falhas, tempo e material consumido continuam registrados.</p>
   <p>Impressão: {prints.find(p=>p.id===cancelTarget)?.outputs.map(o=>o.name).join(' + ')||'não encontrada'}</p>
   <label>Justificativa do cancelamento<input aria-label="Justificativa do cancelamento" maxLength={1000}
    value={cancelReason} onChange={e=>{setCancelReason(e.target.value);cancelKey.current=newKey();}}/>
    <small>Obrigatória, de 10 a 1000 caracteres. Fica registrada na auditoria.</small></label>
   <button type="button" disabled={busy} className="primary-action" onClick={()=>void submitCancel()}>
    {busy?'Cancelando…':'Confirmar cancelamento e liberar reservas'}</button>
   <button type="button" disabled={busy} onClick={()=>{setCancelTarget('');setCancelReason('');cancelKey.current=newKey();}}>Voltar sem cancelar</button>
  </section>}
  <h3>Execuções registradas</h3>
  {prints.length===0?<p>Nenhuma impressão registrada nesta oficina.</p>:<div className="materials-spool-grid">{prints.map(p=><article className="materials-spool-card" key={p.id}>
   <h4>{p.printer_name||'Impressora sem nome'}</h4><p>Status: {p.status} · {new Date(p.created_at).toLocaleString('pt-BR')}</p>
   <ul>{p.outputs.map(o=><li key={o.id}>{o.name}: planejadas {o.planned}, boas {o.good}, rejeitadas {o.failed}</li>)}</ul>
   <small>Tempo previsto: {p.planned_hours===null?'não informado':p.planned_hours+' h'}. Tempo registrado: {p.actual_hours===null?'não informado':p.actual_hours+' h'}.</small>
   {(p.status==='draft'||p.status==='partial')&&
    <button type="button" disabled={busy} aria-label={'Cancelar impressão '+p.outputs.map(o=>o.name).join(' + ')}
    onClick={()=>{setCancelTarget(p.id);setCancelReason('');cancelKey.current=newKey();setError('');}}>
    Cancelar impressão</button>}
  </article>)}</div>}
 </section>
}