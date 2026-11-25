import {ProductPhotos,ProductThumbnail} from './ProductPhotos';
import {useEffect,useMemo,useState} from 'react';
import {FormActionDock} from './FormActionDock';
import {
 createAssembly,listAssemblies,listProducts,saveProductRecord,updateAssembly,listComponentLibrary,saveAssemblyWithComponents,listSavedCalculations,
 type AssemblyPartDraft,type AssemblyRecord,type ProductRecord,type ComponentLibraryItem,type SavedCalculation
} from '../data/supabase';

type Tab='all'|'component'|'assemblies';
type Mode='catalog'|'view'|'edit'|'new';
type Props={workspaceId:string|null;tab:Tab;onCalculate?:(snapshot:SavedCalculation)=>void};
const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
const blank=():AssemblyPartDraft=>({name:'',quantity:1,grams:null,unit_cost:null,notes:''});
const template=()=>[blank(),blank()];
const moneyValue=(s:string):number|null=>s.trim()===''?null:Number(s);
const partDraft=(p:AssemblyRecord['parts'][number]):AssemblyPartDraft=>({id:p.id,product_id:p.product_id??null,name:p.name,quantity:Number(p.quantity),notes:p.notes??'',grams:p.grams===null?null:Number(p.grams),unit_cost:p.unit_cost});
export function ProductWorkspace({workspaceId,tab,onCalculate}:Props){
 const [items,setItems]=useState<ProductRecord[]>([]);
 const [kits,setKits]=useState<AssemblyRecord[]>([]);
 const [library,setLibrary]=useState<ComponentLibraryItem[]>([]);
 const [mode,setMode]=useState<Mode>('catalog');
 const [selected,setSelected]=useState<string|null>(null);
 const [kind,setKind]=useState<'product'|'component'|'kit'>('product');
 const [name,setName]=useState('');
 const [sku,setSku]=useState('');
 const [description,setDescription]=useState('');
 const [salePrice,setSalePrice]=useState('');
 const [parts,setParts]=useState<AssemblyPartDraft[]>(template);
 const [query,setQuery]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [feedback,setFeedback]=useState('');
 const [error,setError]=useState('');
 const [reload,setReload]=useState(0);
 const [openingCalculation,setOpeningCalculation]=useState(false);
 const [kitQuantity,setKitQuantity]=useState(1);
 const [kitExtra,setKitExtra]=useState(0);
 const [kitPrice,setKitPrice]=useState('');
 useEffect(()=>{setKitQuantity(1);setKitExtra(0);setKitPrice('');},[selected]);
 const [libraryError,setLibraryError]=useState('');
 useEffect(()=>{setMode('catalog');setSelected(null);setQuery('');setFeedback('');setError('');},[tab,workspaceId]);
 useEffect(()=>{
  let active=true;setLoading(true);setItems([]);setKits([]);
  if(!workspaceId){setLoading(false);return;}
  void Promise.all([listProducts(workspaceId),listAssemblies(workspaceId)]).then(([p,k])=>{
   if(active){setItems(p);setKits(k);}
  }).catch(e=>{if(active)setError('Erro ao consultar a oficina: '+(e as Error).message);})
    .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[workspaceId,reload]);
 useEffect(()=>{
  let live=true;setLibrary([]);setLibraryError('');
  if(!workspaceId){setLibrary([]);return;}
  void listComponentLibrary(workspaceId).then(rows=>{if(live)setLibrary(rows);})
   .catch(e=>{if(live){setLibrary([]);setLibraryError('Não foi possível consultar os custos das peças: '+(e as Error).message);}});
  return()=>{live=false;};
 },[workspaceId,reload]);
 const kit=kits.find(x=>x.id===selected);
 const product=items.find(x=>x.id===selected);
 const visible=useMemo(()=>items.filter(x=>
  (tab==='all'||(tab==='component'?x.kind==='component':x.kind==='kit'))&&
  (x.name+' '+(x.sku??'')).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
 ),[items,tab,query]);
 const totalCost=(p:AssemblyPartDraft[])=>p.every(x=>x.unit_cost!==null&&x.unit_cost!==undefined)?
   p.reduce((sum,x)=>sum+(x.unit_cost??0)*x.quantity,0):null;
 const reset=(next:'product'|'component'|'kit')=>{
  setSelected(null);setKind(next);setName('');setSku('');setDescription('');setSalePrice('');setParts(template());
  setFeedback('');setError('');setMode('new');
 };
 const open=(id:string)=>{
  setSelected(id);setMode('view');setFeedback('');setError('');
 };
 const edit=()=>{
  const record=kit??product;
  if(!record)return;
  setName(record.name);setSku(record.sku??'');setDescription(record.description??'');
  setSalePrice(record.sale_price===null?'':String(record.sale_price));
  setKind(kit?'kit':product?.kind??'product');
  if(kit)setParts(kit.parts.map(partDraft));
  setMode('edit');setFeedback('');setError('');
 };
 const duplicate=()=>{
  const record=kit??product;
  if(!record)return;
  setName(record.name+' — cópia');setSku('');setDescription(record.description??'');
  setSalePrice(record.sale_price===null?'':String(record.sale_price));setKind(kit?'kit':product?.kind??'product');
  if(kit)setParts(kit.parts.map(p=>({...partDraft(p),id:undefined,unit_cost:p.product_id?p.unit_cost:null})));
  setSelected(null);setMode('new');setError('');setFeedback('A cópia receberá novos registros e não herdará os custos históricos.');
 };
 const changePart=(i:number,patch:Partial<AssemblyPartDraft>)=>setParts(prev=>prev.map((p,n)=>n===i?{...p,...patch}:p));
 const chooseComponent=(i:number,id:string)=>{
  const source=library.find(x=>x.id===id);
  const fallback=items.find(x=>x.id===id&&(x.kind==='component'||x.kind==='product'));
  if(!id){changePart(i,{product_id:null,id:undefined,name:'',grams:null,unit_cost:null,notes:''});return;}
  if(!source&&!fallback)return;
  changePart(i,{product_id:id,id:undefined,name:source?.name??fallback!.name,
   grams:source?.grams??null,unit_cost:source?.unit_cost??null});
 };
 const componentChoices=items.filter(p=>p.kind==='component'||p.kind==='product');
 const calculateExisting=async()=>{
  if(!workspaceId||!product||product.kind==='kit'||!onCalculate)return;
  setError('');setOpeningCalculation(true);
  try{
   const history=await listSavedCalculations(workspaceId);
   const latest=history.filter(x=>x.product_id===product.id)
    .sort((a,b)=>b.saved_at.localeCompare(a.saved_at))[0];
   if(!latest){setError('Esta ficha ainda não possui um cálculo salvo. Use a calculadora para registrar o primeiro custo; o cadastro atual será preservado.');return;}
   onCalculate(latest);
  }catch(e){setError('Não foi possível abrir o cálculo: '+(e as Error).message);}
  finally{setOpeningCalculation(false);}
 };
 const save=async()=>{
  setError('');setFeedback('');
  if(!workspaceId){setError('A oficina não está conectada.');return;}
  if(name.trim().length<2){setError('Informe o nome do produto.');return;}
  const price=moneyValue(salePrice);
  if(price!==null&&(!Number.isFinite(price)||price<0||price>100000000)){setError('Preço de venda inválido.');return;}
  if(kind==='kit'&&(parts.length<2||parts.some(p=>!p.name.trim()||!Number.isSafeInteger(p.quantity)||
   p.quantity<1||p.quantity>100000||(p.grams!==null&&(!Number.isFinite(p.grams)||p.grams<0||p.grams>100000))||
   (p.unit_cost!==null&&p.unit_cost!==undefined&&(!Number.isFinite(p.unit_cost)||p.unit_cost<0||p.unit_cost>100000000))))){
   setError('Informe pelo menos duas peças válidas. Quantidades devem ser inteiras, e pesos e custos não podem ser negativos.');return;
  }
  setBusy(true);
  try{
   const basic={name:name.trim(),sku:sku.trim(),description:description.trim(),salePrice:price};
   let id:string;
   if(kind==='kit'){
    const cleanParts=parts.map(p=>({...p,name:p.name.trim(),notes:p.notes.trim()}));
    if(cleanParts.some(p=>p.product_id)){
     id=await saveAssemblyWithComponents(workspaceId,mode==='edit'?selected:null,{...basic,parts:cleanParts});
    }else if(mode==='edit'&&selected){
     await updateAssembly(workspaceId,selected,{...basic,parts:cleanParts});id=selected;
    }else{
     id=await createAssembly(workspaceId,{...basic,parts:cleanParts});
    }
   }else{
    id=await saveProductRecord(workspaceId,mode==='edit'?selected:null,{...basic,kind});
   }
   setSelected(id);setMode('view');setReload(x=>x+1);
   setFeedback('Cadastro salvo na oficina. As revisões anteriores foram preservadas.');
  }catch(e){setError('Não foi possível salvar: '+(e as Error).message);}
  finally{setBusy(false);}
 };
 const heading=tab==='assemblies'?'Conjuntos':tab==='component'?'Peças':'Produtos da oficina';
 const label=(p:ProductRecord)=>p.kind==='kit'?'Conjunto':p.kind==='component'?'Peça':'Produto';
 return <section className="product-workspace" aria-label="Gestão de produtos">
  <div className="product-workspace-heading">
   <div><h2>{mode==='catalog'?heading:mode==='view'?'Ficha do produto':mode==='edit'?'Editar produto':'Novo produto'}</h2>
    <p>{mode==='catalog'?'Selecione um cadastro para consultar, editar ou duplicar.':mode==='view'?'Detalhes registrados na oficina.':'Preencha somente os dados que você conhece.'}</p></div>
   <div className="product-workspace-buttons">
    {mode==='catalog'&&<button type="button" className="primary-action" onClick={()=>reset(tab==='assemblies'?'kit':tab==='component'?'component':'product')}>{tab==='assemblies'?'+ Novo conjunto':tab==='component'?'+ Nova peça':'+ Novo produto'}</button>}
   </div>
  </div>
  {error&&<p role="alert" className="error">{error}</p>}
  {feedback&&<p role="status" className="product-success">{feedback}</p>}
  {mode==='catalog'&&<>
   <div className="product-workspace-search"><input aria-label="Buscar produtos" placeholder="Buscar nome ou referência" value={query} onChange={e=>setQuery(e.target.value)}/>
    <span>{loading?'Atualizando…':visible.length+' cadastros'}</span></div>
   {loading?<p role="status">Carregando produtos…</p>:visible.length===0?<p>Nenhum cadastro encontrado nesta categoria.</p>:
   <div className="product-workspace-grid">{visible.map(p=><article className="product-catalog-card" key={p.id}>
    <div className="product-card-identity">
     {workspaceId&&<ProductThumbnail workspaceId={workspaceId} productId={p.id} name={p.name} defer/>}
     <div className="product-card-text"><span className="product-kind">{label(p)}</span><h3>{p.name}</h3><p>{p.description||'Sem descrição cadastrada'}</p></div>
    </div>
    <div className="product-catalog-meta"><span>{p.kind==='kit'?(kits.find(x=>x.id===p.id)?.parts.length??'—')+' peças':p.sku??'Sem referência'}</span><span>{p.sale_price===null?'Sem preço':brl(p.sale_price)}</span></div>
    <button type="button" onClick={()=>open(p.id)}>Ver ficha</button>
   </article>)}</div>}
  </>}
  {mode==='view'&&product&&<section className="product-detail">
   <div className="product-detail-head"><div><span className="product-kind">{label(product)}</span><h3>{product.name}</h3>
    <p>{product.description||'Sem descrição cadastrada'}</p></div>

   </div>
   {workspaceId&&<ProductPhotos key={product.id} workspaceId={workspaceId} productId={product.id} name={product.name}/>}
   <div className="product-detail-stats">
    <div><small>Referência</small><strong>{product.sku??'Não informada'}</strong></div>
    <div><small>Preço de venda</small><strong>{product.sale_price===null?'Não informado':brl(product.sale_price)}</strong></div>
    <div><small>Custo de produção</small><strong>{kit?(kit.total_cost===null?'Não apurado':brl(kit.total_cost)+' (informado)'):'Consultar cálculo'}</strong></div>
    <div><small>Revisão</small><strong>{kit?kit.revision:'Histórico preservado'}</strong></div>
   </div>
   {kit&&<><h4>Composição do conjunto</h4><div className="product-detail-scroll"><table><thead><tr><th>Peça</th><th>Qtd.</th><th>Peso/un.</th><th>Custo informado/un.</th><th>Subtotal</th></tr></thead><tbody>
    {kit.parts.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small>{p.notes||'Sem observação'}</small></td><td>{p.quantity}</td><td>{p.grams===null?'—':p.grams+' g'}</td><td>{p.unit_cost===null?'—':brl(p.unit_cost)}</td><td>{p.unit_cost===null?'—':brl(p.unit_cost*p.quantity)}</td></tr>)}
   </tbody></table></div>
   <section className="panel" aria-label="Calculadora de conjuntos"><h4>Simular custo e preço do conjunto</h4><div className="product-save-fields">
   <label>Quantidade de conjuntos<input type="number" min="1" step="1" value={kitQuantity} onChange={e=>setKitQuantity(Number(e.target.value))}/></label>
   <label>Custo adicional por conjunto (R$)<input type="number" min="0" step=".01" value={kitExtra} onChange={e=>setKitExtra(Number(e.target.value))}/><small>Somente montagem, embalagem ou outros custos ainda não incluídos nas peças.</small></label>
   <label>Preço de venda unitário (R$)<input type="number" min="0" step=".01" value={kitPrice} placeholder={kit.sale_price===null?'Não informado':String(kit.sale_price)} onChange={e=>setKitPrice(e.target.value)}/></label></div>
   {(()=>{const base=totalCost(kit.parts.map(partDraft));const price=kitPrice.trim()===''?kit.sale_price:Number(kitPrice);if(base===null)return <p>Não é possível apurar o custo: há peças sem custo registrado.</p>;if(!Number.isSafeInteger(kitQuantity)||kitQuantity<1||!Number.isFinite(kitExtra)||kitExtra<0||(price!==null&&(!Number.isFinite(price)||price<0)))return <p role="alert">Confira quantidade, custo adicional e preço.</p>;const unit=base+kitExtra;return <div className="product-detail-stats"><div><small>Custo por conjunto</small><strong>{brl(unit)}</strong></div><div><small>Custo do lote</small><strong>{brl(unit*kitQuantity)}</strong></div><div><small>Resultado estimado do lote</small><strong>{price===null?'Sem preço':brl((price-unit)*kitQuantity)}</strong></div></div>;})()}
   <p className="footnote">Simulação somente. Não altera custos históricos, estoque ou preço cadastrado.</p></section>
   <p className="footnote">Custos informados manualmente são estimativas, não medições auditadas. O total é apresentado somente quando todas as peças têm custo cadastrado.</p></>}
  </section>}
  {(mode==='new'||mode==='edit')&&<div className="product-editor">
   <div className="product-name-feature"><span>{kind==='kit'?'Conjunto':kind==='component'?'Peça':'Produto'} {mode==='new'?'novo':'em edição'}</span><strong>{name.trim()||'Informe o nome do produto'}</strong></div>
   <div className="product-save-fields">
    <label>Tipo<select aria-label="Tipo de produto" value={kind} disabled={mode==='edit'} onChange={e=>{const next=e.target.value as typeof kind;setKind(next);if(next==='kit')setParts(template());}}>
     <option value="product">Produto</option><option value="component">Peça</option><option value="kit">Conjunto</option></select></label>
    <label className="product-name-input product-wide">Nome do produto<input aria-label="Nome do produto" maxLength={150} value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Guirlanda natalina"/></label>
    <label>Referência (opcional)<input aria-label="SKU do produto" maxLength={100} value={sku} onChange={e=>setSku(e.target.value)}/></label>
    <label>Preço de venda (opcional)<input aria-label="Preço de venda" type="number" min="0" step="0.01" value={salePrice} onChange={e=>setSalePrice(e.target.value)}/></label>
    <label className="product-wide">Descrição (opcional)<textarea aria-label="Descrição do produto" maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}/></label>
   </div>
   {kind==='kit'&&<div className="product-component-editor">
    {libraryError&&<p role="alert" className="error">{libraryError}</p>}
    <div className="product-workspace-heading"><div><h3>Peças necessárias</h3><p>Inclua as peças que precisam ser combinadas.</p></div>
     <button type="button" className="secondary-action" disabled={parts.length>=30} onClick={()=>setParts(prev=>[...prev,blank()])}>+ Adicionar peça</button></div>
    {parts.map((p,i)=><fieldset key={p.id??'new-'+i} className="assembly-part">
     <legend>Peça {i+1}</legend>
     <div className="assembly-part-fields">
      <label className="product-wide">Usar peça já cadastrada
       <select aria-label={'Selecionar peça cadastrada '+(i+1)} value={p.product_id??''}
        onChange={e=>chooseComponent(i,e.target.value)}>
        <option value="">Cadastrar peça nova neste conjunto</option>
        {componentChoices.map(item=><option key={item.id} value={item.id}>{item.name}{item.sku?' — '+item.sku:''}</option>)}
       </select><small className="smart-hint">{p.product_id
        ?'Vínculo à peça original. Nome, peso e custo são referências; o servidor congela o custo na revisão do conjunto.'
        :'Ou selecione uma peça já criada para evitar duplicação e redigitação.'}</small>
      </label>
      <label>Nome da peça<input aria-label={'Nome da peça '+(i+1)} maxLength={150} value={p.name}
       disabled={Boolean(p.product_id)} onChange={e=>changePart(i,{name:e.target.value})}/></label>
      <label>Quantidade<input aria-label={'Quantidade da peça '+(i+1)} type="number" min="1" step="1" value={p.quantity} onChange={e=>changePart(i,{quantity:Number(e.target.value)})}/></label>
      <label>Peso/un. (g, opcional)<input aria-label={'Peso da peça '+(i+1)} type="number" min="0" step=".001" disabled={Boolean(p.product_id)} value={p.grams??''} onChange={e=>changePart(i,{grams:e.target.value===''?null:Number(e.target.value)})}/></label>
      <label>Custo/un. informado (R$, opcional)<input aria-label={'Custo da peça '+(i+1)} type="number" min="0" step=".01" disabled={Boolean(p.product_id)} value={p.unit_cost??''} onChange={e=>changePart(i,{unit_cost:e.target.value===''?null:Number(e.target.value)})}/></label>
      <label className="product-wide">Observações<input aria-label={'Observações da peça '+(i+1)} value={p.notes} maxLength={1000} onChange={e=>changePart(i,{notes:e.target.value})}/></label>
     </div>
     <button type="button" className="secondary-action remove-part-action" disabled={parts.length<=2} onClick={()=>setParts(prev=>prev.filter((_,n)=>n!==i))}>Remover peça {i+1}</button>
    </fieldset>)}
    <p className="product-cost-preview">Custo do conjunto: <strong>{totalCost(parts)===null?'Não apurado — há peças sem custo':brl(totalCost(parts)!)+' (informado)'}</strong></p>
    <p className="footnote">Peças selecionadas do catálogo usam o custo da ficha original quando houver snapshot; custos desconhecidos continuam desconhecidos. Peças diferentes na mesma placa não recebem rateio automático de tempo ou energia. Não há baixa de estoque; revisões preservam o histórico.</p>
   </div>}
  </div>}
  {mode==='view'&&product&&<FormActionDock title={product.name} subtitle="Ficha do cadastro">
    <button type="button" className="secondary-action" onClick={()=>{setMode('catalog');setSelected(null);setError('');}}>Voltar</button>
    {product.kind!=='kit'&&onCalculate&&<button type="button" disabled={openingCalculation} onClick={()=>void calculateExisting()}>{openingCalculation?'Consultando…':'Reutilizar na calculadora'}</button>}
    <button type="button" onClick={duplicate}>Duplicar</button><button type="button" className="primary-action" onClick={edit}>Editar</button>
   </FormActionDock>}
  {(mode==='new'||mode==='edit')&&<FormActionDock title={name.trim()||'Novo cadastro'} subtitle={mode==='edit'?'Editando ficha existente':'Cadastro de '+(kind==='kit'?'conjunto':kind==='component'?'peça':'produto')}>
    <button type="button" className="secondary-action" onClick={()=>setMode(mode==='edit'?'view':'catalog')}>Cancelar</button>
    <button type="button" className="primary-action" disabled={busy||!workspaceId||name.trim().length<2} onClick={()=>void save()}>{busy?'Salvando…':mode==='edit'?'Salvar nova revisão':'Salvar produto'}</button>
   </FormActionDock>}
 </section>;
}
