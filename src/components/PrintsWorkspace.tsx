import {useEffect,useRef,useState} from 'react';
import {createPrint,confirmPrint,listPrints,listPrinters,listProducts,listExistingSpools,listPrintReservations,reservePrintLot,setPrintReservationDue,cancelPrint,reducePrintPlan,swapPrintReservedLot,
 type PrintRecord,type ProductRecord,type StoredPrinter,type ExistingSpool,type PrintReservation} from '../data/supabase';

const newKey=()=>crypto.randomUUID();
const valid=(value:string)=>value.trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=0;
export function PrintsWorkspace({workspaceId}:{workspaceId:string|null}){
 const [printers,setPrinters]=useState<StoredPrinter[]>([]),[products,setProducts]=useState<ProductRecord[]>([]);
 const [spools,setSpools]=useState<ExistingSpool[]>([]),[prints,setPrints]=useState<PrintRecord[]>([]),[reservations,setReservations]=useState<PrintReservation[]>([]);
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
 const [dueReservation,setDueReservation]=useState(''),[dueLocal,setDueLocal]=useState('');
 const [cancelTarget,setCancelTarget]=useState(''),[cancelReason,setCancelReason]=useState('');
 const cancelKey=useRef(newKey());
 const [basis,setBasis]=useState<'weighed'|'slicer'|'estimated'>('slicer'),[actualHours,setActualHours]=useState('');
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [reload,setReload]=useState(0),operation=useRef(newKey());
 useEffect(()=>{
  let live=true;if(!workspaceId)return;
  Promise.all([listPrinters(workspaceId),listProducts(workspaceId),listExistingSpools(workspaceId),listPrints(workspaceId),listPrintReservations(workspaceId)])
   .then(([p,pr,s,executions,held])=>{if(live){setPrinters(p);setProducts(pr.filter(x=>x.kind!=='kit'));setSpools(s);setPrints(executions);setReservations(held);}})
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