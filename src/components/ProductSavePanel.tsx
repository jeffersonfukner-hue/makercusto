import { useEffect, useState } from 'react';
import { listProducts, saveCalculatedProduct, type ProductRecord, type Session } from '../data/supabase';
import type { CostInput, CostResult } from '../domain/cost';

type Props = { session: Session | null; workspaceId: string | null; input: CostInput; result?: CostResult; filter?: 'all'|'component'; onLogin: () => void; onViewSaved?: (kind:'product'|'component')=>void; onCreateAssembly?:()=>void };
const currency=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
export function ProductSavePanel({session,workspaceId,input,result,filter='all',onLogin,onViewSaved,onCreateAssembly}:Props){
 const [name,setName]=useState('');
 const [sku,setSku]=useState('');
 const [description,setDescription]=useState('');
 const [kind,setKind]=useState<'product'|'component'>('product');
 const [lastSavedKind,setLastSavedKind]=useState<'product'|'component'>('product');
 const [items,setItems]=useState<ProductRecord[]>([]);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let live=true;
  if(!session||!workspaceId){setItems([]);return;}
  setLoading(true);
  void listProducts(workspaceId).then(rows=>{if(live){setItems(rows);setError('');}})
   .catch(e=>{if(live)setError('Não foi possível consultar produtos: '+(e as Error).message);})
   .finally(()=>{if(live)setLoading(false);});
  return ()=>{live=false;};
 },[session?.user.id,workspaceId,refresh]);
 const visibleItems=filter==='component'?items.filter(item=>item.kind==='component'):items;
 const save=async()=>{
  setError('');setMessage('');
  if(!session||!workspaceId){onLogin();return;}
  if(!result){setError('Corrija os valores do cálculo antes de salvar.');return;}
  if(name.trim().length<2){setError('Informe um nome com pelo menos 2 caracteres.');return;}
  setBusy(true);
  try{
   await saveCalculatedProduct(workspaceId,{
    name:name.trim(),sku:sku.trim(),description:description.trim(),kind,
    salePrice:input.salePrice,quantity:input.quantity,totalCost:result.lotCost,
    parameters:{origin:'calculator',source:'user-and-estimates',saved_input:input,calculated_result:result}
   });
   setLastSavedKind(kind);setName('');setSku('');setDescription('');setKind('product');
   setMessage('Produto, versão inicial e custo estimado salvos na sua oficina.');
   setRefresh(n=>n+1);
  }catch(e){setError('Não foi possível salvar o produto: '+(e as Error).message);}
  finally{setBusy(false);}
 };
 return <section className="panel product-save-panel" aria-labelledby="product-save-title">
  <div className="panel-heading"><div><h2 id="product-save-title">{filter==='component'?'Minhas peças':'Meus produtos'}</h2>
   <p>Salve o cálculo como um produto da oficina. Os custos anteriores ficam registrados em um snapshot.</p></div></div>
  {!session?<div><p className="footnote">Entre na sua conta para salvar e consultar os produtos na nuvem.</p>
   <button type="button" className="primary-action" onClick={onLogin}>Entrar para salvar produto</button></div>:
  <div className="product-save-content">
   <div className="product-save-fields">
    <label>Nome do produto <input aria-label="Nome do produto" maxLength={150} value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Chaveiro galo" /></label>
    <label>SKU / referência (opcional) <input aria-label="SKU do produto" maxLength={100} value={sku} onChange={e=>setSku(e.target.value)} placeholder="Ex.: CH-GALO-01" /></label>
    <label>Tipo <select aria-label="Tipo de produto" value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="product">Produto final</option><option value="component">Peça / componente</option></select></label>
    <label>Descrição (opcional) <input aria-label="Descrição do produto" maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)} /></label>
   </div>
   <p className="footnote">Uma placa com peças diferentes precisa de distribuição de custos validada antes de salvar cada peça. Conjuntos são montados a partir de peças cadastradas.</p>
   <p className="footnote">O custo salvo será uma estimativa do cálculo atual ({result?currency(result.lotCost):'inválido'} por lote). Não há baixa automática de estoque.</p>
   <button className="primary-action" type="button" disabled={busy||!result||!workspaceId} onClick={()=>void save()}>{busy?'Salvando produto…':'Salvar produto e custo'}</button>
   <div aria-live="polite">{message&&<div><p className="product-success" role="status">{message}</p>
    <div className="product-workspace-buttons">
     {onViewSaved&&<button type="button" onClick={()=>onViewSaved(lastSavedKind)}>Ver cadastros da oficina</button>}
     {onCreateAssembly&&<button type="button" onClick={onCreateAssembly}>Montar conjunto com peças</button>}
    </div></div>}{error&&<p className="error" role="alert">{error}</p>}</div>
   <div className="product-list"><h3>{filter==='component'?'Peças cadastradas':'Produtos da oficina'}</h3>{loading?<p role="status">Carregando produtos…</p>:visibleItems.length===0?<p className="footnote">Nenhum produto cadastrado nesta oficina.</p>:
    <ul>{visibleItems.map(item=><li key={item.id}><strong>{item.name}</strong><span>{item.kind==='kit'?'Kit':item.kind==='component'?'Componente':'Produto'} · {item.sku||'Sem SKU'} · {item.sale_price===null?'Sem preço':currency(item.sale_price)}</span></li>)}</ul>}
   </div>
  </div>}
 </section>;
}
