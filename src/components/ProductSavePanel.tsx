import { useEffect, useState } from 'react';
import {FormActionDock} from './FormActionDock';
import { listProducts, saveCalculatedProduct, appendProductCalculation, listSavedCalculations, type ProductRecord, type Session, type SavedCalculation } from '../data/supabase';
import type { CostInput, CostResult } from '../domain/cost';

type Props = { session: Session | null; workspaceId: string | null; input: CostInput; result?: CostResult; filter?: 'all'|'component'; onLogin: () => void; onViewSaved?: (kind:'product'|'component')=>void; onCreateAssembly?:()=>void; onLoadCalculation?:(draft:SavedCalculation)=>void; revisionTarget?:SavedCalculation|null; onClearRevisionTarget?:()=>void };
const currency=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
export function ProductSavePanel({session,workspaceId,input,result,filter='all',onLogin,onViewSaved,onCreateAssembly,onLoadCalculation,revisionTarget,onClearRevisionTarget}:Props){
 const [name,setName]=useState('');
 const [sku,setSku]=useState('');
 const [description,setDescription]=useState('');
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
 const visibleItems=filter==='component'?items.filter(item=>item.kind==='component'):items;
 useEffect(()=>{setRequestKey(null);if(revisionTarget){setName(revisionTarget.name);setSku(revisionTarget.sku??'');setKind(revisionTarget.kind);}},[revisionTarget?.snapshot_id]);
 const save=async()=>{
  setError('');setMessage('');
  if(!session||!workspaceId){onLogin();return;}
  if(!result){setError('Corrija os valores do cálculo antes de salvar.');return;}
  if(!revisionTarget&&name.trim().length<2){setError('Informe um nome com pelo menos 2 caracteres.');return;}
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
   setLastSavedKind(kind);setName('');setSku('');setDescription('');setKind('product');
   setMessage(revisionTarget?'Nova revisão de custo salva na mesma ficha. O histórico anterior foi preservado.':(kind==='component'?'Peça':'Produto')+', versão inicial e custo estimado salvos na sua oficina.');
   setRequestKey(null);
   if(revisionTarget)onClearRevisionTarget?.();
   setRefresh(n=>n+1);
  }catch(e){setError('Não foi possível salvar o produto: '+(e as Error).message);}
  finally{setBusy(false);}
 };
 return <section className="panel product-save-panel" aria-label="Identificação do produto">
  <div className="panel-heading"><div><h2 id="product-save-title">Identificação do produto</h2>
   <span className="mc-info" tabIndex={0} title="Os custos anteriores ficam registrados em um snapshot.">ⓘ</span></div></div>
  {!session?<div><p className="footnote">Entre na sua conta para salvar e consultar os produtos na nuvem.</p>
   <button type="button" className="primary-action" onClick={onLogin}>Entrar para salvar produto</button></div>:
  <div className="product-save-content">
   {onLoadCalculation&&<div className="product-reuse-panel" aria-label="Reutilizar cálculo salvo">
    
    <div className="product-save-fields">
     <label><span>Escolha um cálculo salvo <span className="mc-info" tabIndex={0} title="Reaproveita parâmetros do cálculo escolhido. A máquina atual pode alterar o resultado; o histórico não é reescrito.">ⓘ</span></span><select aria-label="Cálculo salvo para reutilizar" value={selectedCalculation}
      onChange={e=>setSelectedCalculation(e.target.value)}>
      <option value="">Selecione</option>{savedCalculations.map(x=><option key={x.snapshot_id} value={x.snapshot_id}>
       {x.kind==='component'?'Peça: ':'Produto: '}{x.name}
      </option>)}</select></label>
     <button type="button" disabled={!selectedCalculation} onClick={()=>{
      const item=savedCalculations.find(x=>x.snapshot_id===selectedCalculation);
      if(item)onLoadCalculation(item);
     }}>Carregar</button>
    </div>
    
   </div>}
   {revisionTarget&&<div className="product-reuse-panel mc-revision" role="status"><strong>Nova revisão: {revisionTarget.name}</strong><span className="mc-info" tabIndex={0} title="A revisão atualiza o preço de venda e preserva os custos históricos."> ⓘ</span>{onClearRevisionTarget&&<button type="button" className="secondary-action" onClick={onClearRevisionTarget}>Salvar como novo cadastro</button>}</div>}
   <div className="product-save-fields mc-product-identity-fields">
    <label className="product-wide product-name-input">Nome {kind==='component'?'da peça':'do produto'}<input aria-label="Nome do produto" maxLength={150} value={name} disabled={Boolean(revisionTarget)||busy} onChange={e=>setName(e.target.value)} placeholder="Ex.: Guirlanda natalina"/></label>
    <label>SKU / referência (opcional) <input aria-label="SKU do produto" maxLength={100} value={sku} disabled={Boolean(revisionTarget)} onChange={e=>setSku(e.target.value)} placeholder="Ex.: CH-GALO-01" /></label>
    <label>Tipo <select aria-label="Tipo de produto" value={kind} disabled={Boolean(revisionTarget)} onChange={e=>setKind(e.target.value as typeof kind)}><option value="product">Produto final</option><option value="component">Peça / componente</option></select></label>
    <label className="mc-description">Descrição (opcional) <input aria-label="Descrição do produto" maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)} /></label>
   </div>
   <span className="mc-info mc-save-help" tabIndex={0} title="Peças diferentes na mesma placa exigem rateio validado. Conjuntos usam peças cadastradas. Não há baixa automática de estoque.">ⓘ Sobre o salvamento</span>
   

   <div aria-live="polite">{message&&<div><p className="product-success" role="status">{message}</p>
    <div className="product-workspace-buttons">
     {onViewSaved&&<button type="button" onClick={()=>onViewSaved(lastSavedKind)}>Ver cadastros da oficina</button>}
     {onCreateAssembly&&<button type="button" onClick={onCreateAssembly}>Montar conjunto com peças</button>}
    </div></div>}{error&&<p className="error" role="alert">{error}</p>}</div>
   <details className="product-list"><summary>Consultar cadastros existentes</summary><h3>{filter==='component'?'Peças cadastradas':'Produtos da oficina'}</h3>{loading?<p role="status">Carregando produtos…</p>:visibleItems.length===0?<p className="footnote">Nenhum produto cadastrado nesta oficina.</p>:
    <ul>{visibleItems.map(item=><li key={item.id}><strong>{item.name}</strong><span>{item.kind==='kit'?'Kit':item.kind==='component'?'Componente':'Produto'} · {item.sku||'Sem SKU'} · {item.sale_price===null?'Sem preço':currency(item.sale_price)}</span></li>)}</ul>}
   </details>
  </div>}
  {session&&<FormActionDock title={name.trim()||'Produto sem nome'} subtitle={result?`Custo: ${currency(result.unitCost)} · Venda: ${currency(input.salePrice)} · Lucro bruto/un.: ${currency(input.salePrice-result.unitCost)} · Margem: ${result.marginPercent.toFixed(1)}%`: 'Cálculo inválido'}>
   {revisionTarget&&onClearRevisionTarget&&<button type="button" className="secondary-action" onClick={onClearRevisionTarget}>Salvar como novo</button>}
   <button className="primary-action" type="button" disabled={busy||!result||!workspaceId||name.trim().length<2} onClick={()=>void save()}>{busy?'Salvando…':revisionTarget?'Salvar nova revisão':kind==='component'?'Salvar peça e custo':'Salvar produto e custo'}</button>
  </FormActionDock>}
 </section>;
}
