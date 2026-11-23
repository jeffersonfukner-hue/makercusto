import {useEffect,useRef,useState} from 'react';
import {createPrint,confirmPrint,listPrints,listPrinters,listProducts,listExistingSpools,
 type PrintRecord,type ProductRecord,type StoredPrinter,type ExistingSpool} from '../data/supabase';

const newKey=()=>crypto.randomUUID();
const valid=(value:string)=>value.trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=0;
export function PrintsWorkspace({workspaceId}:{workspaceId:string|null}){
 const [printers,setPrinters]=useState<StoredPrinter[]>([]),[products,setProducts]=useState<ProductRecord[]>([]);
 const [spools,setSpools]=useState<ExistingSpool[]>([]),[prints,setPrints]=useState<PrintRecord[]>([]);
 const [printer,setPrinter]=useState(''),[product,setProduct]=useState(''),[quantity,setQuantity]=useState('1');
 const [hours,setHours]=useState(''),[source,setSource]=useState<'slicer'|'measured'|'informed'|'estimated'>('slicer');
 const [notes,setNotes]=useState(''),[outputs,setOutputs]=useState<{product_id:string;quantity:number;name:string}[]>([]);
 const [selected,setSelected]=useState(''),[selectedOutput,setSelectedOutput]=useState(''),[lot,setLot]=useState(''),[mass,setMass]=useState(''),[purge,setPurge]=useState(''),[loss,setLoss]=useState(''),[good,setGood]=useState(''),[failed,setFailed]=useState('0');
 const [basis,setBasis]=useState<'weighed'|'slicer'|'estimated'>('slicer');
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [reload,setReload]=useState(0),operation=useRef(newKey());
 useEffect(()=>{
  let live=true;if(!workspaceId)return;
  Promise.all([listPrinters(workspaceId),listProducts(workspaceId),listExistingSpools(workspaceId),listPrints(workspaceId)])
   .then(([p,pr,s,executions])=>{if(live){setPrinters(p);setProducts(pr.filter(x=>x.kind!=='kit'));setSpools(s);setPrints(executions);}})
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
 const selectedPrint=prints.find(p=>p.id===selected);
 const confirm=async()=>{
  if(!workspaceId||!selectedPrint||!lot||!valid(mass)||!valid(purge)||!valid(loss)||Number(mass)+Number(purge)+Number(loss)<=0||!valid(good)||!valid(failed)){
   setError('Informe impressão, bobina, consumo positivo e peças novas boas/rejeitadas.');return;
  }
  if(Number(good)+Number(failed)>0&&!Number.isInteger(Number(good)+Number(failed))){setError('As peças devem ser números inteiros.');return;}
  if(!selectedPrint.outputs.some(o=>o.id===selectedOutput)){setError('Selecione a peça à qual pertencem as unidades confirmadas. Material compartilhado permanece sem rateio financeiro até L4.');return;}
  const output=selectedPrint.outputs.find(o=>o.id===selectedOutput)!;
  setBusy(true);setError('');setMessage('');
  try{
   await confirmPrint(workspaceId,{id:selectedPrint.id,key:operation.current,
    outputs:Number(good)+Number(failed)>0?[{output_id:output.id,good:Number(good),failed:Number(failed)}]:[],
    consumptions:[{lot_id:lot,model_g:Number(mass),purge_g:Number(purge),loss_g:Number(loss),basis}],actualHours:null});
   operation.current=newKey();
   setMessage('Confirmação incremental registrada; consumo da bobina baixado somente uma vez.');
   setMass('');setPurge('');setLoss('');setGood('');setFailed('0');setReload(v=>v+1);
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
  <section className="panel materials-form"><h3>Confirmação incremental de impressão</h3>
   <p className="footnote">Confirme a quantidade produzida de cada peça separadamente. O consumo informado é da mesa e não será rateado financeiramente entre as peças até L4. Encerramento definitivo bloqueado.</p>
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