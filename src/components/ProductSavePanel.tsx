import { useEffect, useRef, useState, type ReactNode } from 'react';
import {CalculatorHelp} from './CalculatorHelp';
import {FormActionDock} from './FormActionDock';
import { listProducts, saveCalculatedProduct, appendProductCalculation, listSavedCalculations, type ProductRecord, type Session, type SavedCalculation } from '../data/supabase';
import type { CostInput, CostResult } from '../domain/cost';

type Props = { session: Session | null; workspaceId: string | null; input: CostInput; result?: CostResult; filter?: 'all'|'component'; onLogin: () => void; onViewSaved?: (kind:'product'|'component')=>void; onCreateAssembly?:()=>void; onLoadCalculation?:(draft:SavedCalculation)=>void; revisionTarget?:SavedCalculation|null; onClearRevisionTarget?:()=>void; description?:string; onDescriptionChange?:(value:string)=>void; lotField?:ReactNode; onNewCalculation?:()=>void };
const currency=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
const comparableName=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('pt-BR').trim().replace(/\s+/g,' ');
function availableCopyName(original:string,existing:Set<string>){
 for(let number=1;;number++){
  const suffix=number===1?' — cópia':' — cópia '+number;
  const candidate=original.trim().slice(0,150-suffix.length).trimEnd()+suffix;
  if(!existing.has(comparableName(candidate)))return candidate;
 }
}
export function ProductSavePanel({session,workspaceId,input,result,filter='all',onLogin,onViewSaved,onCreateAssembly,onLoadCalculation,revisionTarget,onClearRevisionTarget,description='',onDescriptionChange,lotField,onNewCalculation}:Props){
 const [name,setName]=useState('');
 const [copySource,setCopySource]=useState<string|null>(null);
 const nameInput=useRef<HTMLInputElement>(null);
 const focusCopyName=useRef(false);
 const [sku,setSku]=useState('');
 const [kind,setKind]=useState<'product'|'component'>('product');
 const [lastSavedKind,setLastSavedKind]=useState<'product'|'component'>('product');
 const [items,setItems]=useState<ProductRecord[]>([]);
 const [savedCalculations,setSavedCalculations]=useState<SavedCalculation[]>([]);
 const [selectedCalculation,setSelectedCalculation]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [refresh,setRefresh]=useState(0);
 const [requestKey,setRequestKey]=useState<string|null>(null);
 useEffect(()=>{
  let live=true;
  if(!session||!workspaceId){setItems([]);return;}
  setLoading(true);
  void listProducts(workspaceId).then(rows=>{if(live){setItems(rows);setError('');}})
   .catch(e=>{if(live)setError('Não foi possível consultar produtos: '+(e as Error).message);})
   .finally(()=>{if(live)setLoading(false);});
  return ()=>{live=false;};
 },[session?.user.id,workspaceId,refresh]);
 useEffect(()=>{
  let live=true;
  if(!session||!workspaceId){setSavedCalculations([]);return;}
  void listSavedCalculations(workspaceId).then(rows=>{if(live)setSavedCalculations(rows);})
    .catch(()=>{if(live)setSavedCalculations([]);});
  return()=>{live=false;};
 },[session?.user.id,workspaceId,refresh]);
 const registeredNames=new Set([...items,...savedCalculations].map(item=>comparableName(item.name)));
 const partCount=items.filter(item=>item.kind==='component').length;
 const visibleItems=filter==='component'?items.filter(item=>item.kind==='component'):items;
 useEffect(()=>{setRequestKey(null);if(revisionTarget){setCopySource(null);setName(revisionTarget.name);setSku(revisionTarget.sku??'');setKind(revisionTarget.kind);}},[revisionTarget?.snapshot_id]);
 useEffect(()=>{
  if(revisionTarget||!focusCopyName.current)return;
  focusCopyName.current=false;
  nameInput.current?.focus();
  nameInput.current?.select();
 },[revisionTarget]);
 const draftAsCopy=()=>{
  if(!revisionTarget||!onClearRevisionTarget)return;
  const original=revisionTarget.name;
  setCopySource(original);
  setName(availableCopyName(original,registeredNames));
  setSku('');
  setMessage('');setError('');
  focusCopyName.current=true;
  onClearRevisionTarget();
 };
 const save=async()=>{
  setError('');setMessage('');
  if(!session||!workspaceId){onLogin();return;}
  if(!result){setError('Corrija os valores do cálculo antes de salvar.');return;}
  if(!revisionTarget&&name.trim().length<2){setError('Informe um nome com pelo menos 2 caracteres.');return;}
  if(!revisionTarget&&copySource&&(comparableName(name)===comparableName(copySource)||registeredNames.has(comparableName(name)))){
   setError('Já existe um cadastro com esse nome. Escolha outro nome para a cópia.');
   nameInput.current?.focus();
   return;
  }
  setBusy(true);
  try{
   const payload={
    name:name.trim(),sku:sku.trim(),description:description.trim(),kind,
    salePrice:input.salePrice,quantity:input.quantity,totalCost:result.lotCost,
    parameters:{origin:'calculator',source:'user-and-estimates',saved_input:input,calculated_result:result}
   };
   if(revisionTarget){
    const key=requestKey??crypto.randomUUID();setRequestKey(key);
    await appendProductCalculation(workspaceId,revisionTarget.product_id,key,payload);
   }else await saveCalculatedProduct(workspaceId,payload);
   setLastSavedKind(kind);setCopySource(null);setName('');setSku('');onDescriptionChange?.('');setKind('product');
   setMessage(revisionTarget?'Nova revisão de custo salva na mesma ficha. O histórico anterior foi preservado.':(kind==='component'?'Peça':'Produto')+', versão inicial e custo estimado salvos na sua oficina.');
   setRequestKey(null);
   if(revisionTarget)onClearRevisionTarget?.();
   setRefresh(n=>n+1);
  }catch(e){setError('Não foi possível salvar o produto: '+(e as Error).message);}
  finally{setBusy(false);}
 };
 const startNewCalculation=()=>{
  if(!window.confirm('Iniciar um novo cálculo com os valores de exemplo? Os dados não salvos do cálculo atual serão descartados.'))return;
  setCopySource(null);setName('');setSku('');onDescriptionChange?.('');setKind('product');
  setSelectedCalculation('');setMessage('');setError('');setRequestKey(null);
  onNewCalculation?.();
 };
 if(!session)return <section className="panel product-save-panel" aria-labelledby="product-save-title">
  <h2 id="product-save-title">Identificação do produto</h2>
  <p className="footnote">Entre na sua conta para salvar e consultar os produtos na nuvem.</p>
  <button type="button" className="primary-action" onClick={onLogin}>Entrar para salvar produto</button>
 </section>;
 return <section className="calculator-identity" aria-label="Identificação do cálculo">
  <div className="product-save-content">
   {onLoadCalculation&&<section className="panel mc-recovery" aria-labelledby="recover-calculation">
    <div className="mc-identity-heading"><h2 id="recover-calculation">Recuperar cálculo salvo</h2>
     <CalculatorHelp label="Recuperar cálculo salvo">Os parâmetros são reaproveitados com a impressora selecionada. O histórico original fica preservado.</CalculatorHelp>
    </div>
    <div className="mc-recovery-controls">
     <select aria-label="Cálculo salvo para reutilizar" value={selectedCalculation} disabled={busy} onChange={event=>setSelectedCalculation(event.target.value)}>
      <option value="">Selecione</option>
      {savedCalculations.map(item=><option key={item.snapshot_id} value={item.snapshot_id}>
       {item.kind==='component'?'Peça: ':'Produto: '}{item.name}
      </option>)}
     </select>
     <button type="button" disabled={busy||!selectedCalculation} onClick={()=>{
      const item=savedCalculations.find(snapshot=>snapshot.snapshot_id===selectedCalculation);
      if(item)onLoadCalculation(item);
     }}>Carregar</button>
    </div>
    <div className="mc-recovery-actions">
     {onNewCalculation&&<button type="button" className="mc-new-calculation" disabled={busy} onClick={startNewCalculation}><span aria-hidden="true">＋</span> Novo cálculo</button>}
     <details className="product-list"><summary>Cadastros{!loading&&items.length>0&&' · '+partCount+(partCount===1?' peça':' peças')}</summary>
      <h3>{filter==='component'?'Peças cadastradas':'Produtos da oficina'}</h3>
      {loading?<p role="status">Carregando produtos…</p>:visibleItems.length===0?<p className="footnote">Nenhum produto cadastrado nesta oficina.</p>:
       <ul>{visibleItems.map(item=><li key={item.id}><strong>{item.name}</strong><span>{item.kind==='kit'?'Kit':item.kind==='component'?'Componente':'Produto'} · {item.sku||'Sem SKU'} · {item.sale_price===null?'Sem preço':currency(item.sale_price)}</span></li>)}</ul>}
     </details>
    </div>
   </section>}
   <section className="panel mc-current-product" aria-labelledby="product-save-title">
    <div className="mc-identity-heading"><h2 id="product-save-title">Identificação do produto</h2>
     <CalculatorHelp label="Salvar produto">O custo é registrado com os parâmetros atuais. Peças diferentes na mesma placa exigem rateio validado. O salvamento não movimenta estoque.</CalculatorHelp>
    </div>
    <div className="product-save-fields mc-product-identity-fields">
     <label className="product-name-input">Nome {kind==='component'?'da peça':'do produto'}
      <input ref={nameInput} aria-label="Nome do produto" maxLength={150} value={name} disabled={Boolean(revisionTarget)||busy} onChange={event=>setName(event.target.value)} placeholder="Ex.: Guirlanda natalina"/>
     </label>
     <label>Tipo
      <select aria-label="Tipo de produto" value={kind} disabled={Boolean(revisionTarget)||busy} onChange={event=>setKind(event.target.value as typeof kind)}>
       <option value="product">Produto final</option><option value="component">Peça / componente</option>
      </select>
     </label>
     {lotField}
     <label>SKU / referência (opcional)
      <input aria-label="SKU do produto" maxLength={100} value={sku} disabled={Boolean(revisionTarget)||busy} onChange={event=>setSku(event.target.value)} placeholder="Ex.: CH-GALO-01"/>
     </label>
    </div>
    {revisionTarget&&<p className="mc-revision" role="status">Nova revisão do cadastro atual</p>}
   </section>
   <div className="mc-save-feedback" aria-live="polite">{message&&<div className="mc-save-confirmation"><p className="product-success" role="status">{message}</p>
    <div className="product-workspace-buttons">
     {onViewSaved&&<button type="button" onClick={()=>onViewSaved(lastSavedKind)}>Ver cadastros da oficina</button>}
     {onCreateAssembly&&<button type="button" onClick={onCreateAssembly}>Montar conjunto com peças</button>}
    </div></div>}{error&&<p className="error" role="alert">{error}</p>}</div>
  </div>
  <FormActionDock title={name.trim()||'Produto sem nome'} subtitle={result?(kind==="component"?"Peça / componente":"Produto final"):"Cálculo inválido"} metrics={result?[{label:"Custo unitário",value:currency(result.unitCost)},{label:"Venda",value:currency(input.salePrice)},{label:"Lucro bruto/un.",value:currency(input.salePrice-result.unitCost)},{label:"Margem",value:result.marginPercent.toFixed(1).replace(".",",")+"%"}]:undefined}>
   {revisionTarget&&onClearRevisionTarget&&<button type="button" className="secondary-action" disabled={busy} onClick={draftAsCopy}>Salvar como novo</button>}
   <button className="primary-action" type="button" disabled={busy||!result||!workspaceId||name.trim().length<2} onClick={()=>void save()}>{busy?'Salvando…':revisionTarget?'Salvar nova revisão':kind==='component'?'Salvar peça e custo':'Salvar produto e custo'}</button>
  </FormActionDock>
 </section>;
}
