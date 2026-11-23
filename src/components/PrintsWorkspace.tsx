import {useEffect,useRef,useState} from 'react';
import {createPrint,confirmPrint,listPrints,listPrinters,listProducts,listExistingSpools,listPrintReservations,reservePrintLot,
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
    {reservations.filter(x=>x.status==='active').map(x=><li key={x.id}>{x.lot_label||'Bobina'} — reservado {x.remaining} g de {x.quantity} g para {prints.find(p=>p.id===x.production_id)?.outputs.map(o=>o.name).join(' + ')||'impressão registrada'}</li>)}
   </ul>}
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
  <h3>Execuções registradas</h3>
  {prints.length===0?<p>Nenhuma impressão registrada nesta oficina.</p>:<div className="materials-spool-grid">{prints.map(p=><article className="materials-spool-card" key={p.id}>
   <h4>{p.printer_name||'Impressora sem nome'}</h4><p>Status: {p.status} · {new Date(p.created_at).toLocaleString('pt-BR')}</p>
   <ul>{p.outputs.map(o=><li key={o.id}>{o.name}: planejadas {o.planned}, boas {o.good}, rejeitadas {o.failed}</li>)}</ul>
   <small>Tempo previsto: {p.planned_hours===null?'não informado':p.planned_hours+' h'}. Tempo registrado: {p.actual_hours===null?'não informado':p.actual_hours+' h'}.</small>
  </article>)}</div>}
 </section>
}