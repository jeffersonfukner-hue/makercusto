import {OperationFeedback} from './OperationFeedback';
import {useConfirmation} from './ConfirmationDialog';
import {Modal} from './Modals';
import {ProductPhotos} from './ProductPhotos';
import {useEffect,useId,useMemo,useRef,useState} from 'react';
import {CalculationResultPanel,type ResultLine,type ResultNumbers} from './CalculationResultPanel';
import {FormActionDock} from './FormActionDock';
import {formatCatalogName} from '../domain/catalogName';
import {createComposedProduct,getComponentCostSnapshot,listAssemblies,listComponentLibrary,listProducts,saveAssemblyWithComponents,
 type AssemblyRecord,type CompositionPricing,type ComponentCostSnapshot,type ComponentLibraryItem,type ProductRecord} from '../data/supabase';

type Part={id:string;quantity:number;savedCost?:number|null;snapshotId?:string|null};
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const number=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:3});
const costCategories=[
 ['material','Filamento'],['energy','Energia'],['depreciation','Depreciação'],
 ['assembly','Montagem'],['accessories','Acessórios']
] as const;

export type CompositionSummary={cost:number|null;partsCount:number;lines:ResultLine[];filamentDetails:ResultLine[]};
export function compositionNumbers(cost:number|null,price:number):ResultNumbers|undefined {
 if(cost===null||!Number.isFinite(price)||price<0)return undefined;
 const grossProfit=price-cost;
 return {unitCost:cost,lotCost:cost,salePrice:price,lotRevenue:price,grossProfit,
  marginPercent:price>0?grossProfit/price*100:0,markupPercent:cost>0?grossProfit/cost*100:0};
}

function summarizeComposition(parts:Part[],library:ComponentLibraryItem[],snapshots:Record<string,ComponentCostSnapshot|undefined>):CompositionSummary{
 const count=parts.reduce((sum,part)=>sum+part.quantity,0);
 const unitCosts=parts.map(part=>part.savedCost!==undefined?part.savedCost:library.find(item=>item.id===part.id)?.unit_cost??null);
 const total=parts.length&&unitCosts.every(cost=>cost!==null)
  ?parts.reduce((sum,part,index)=>sum+Number(unitCosts[index])*part.quantity,0):null;
 const records=parts.map((part,index)=>{
  const snapshot=snapshots[part.id];
  const cost=unitCosts[index];
  if(!snapshot||cost===null||snapshot.quantity<=0||
   Math.abs(Number(snapshot.total_cost)/snapshot.quantity-Number(cost))>0.000051)return null;
  return {ratio:part.quantity/snapshot.quantity,result:snapshot.parameters?.calculated_result,input:snapshot.parameters?.saved_input};
 });
 const hasFilament=records.length>0&&records.every(record=>record&&Number.isFinite(record.result?.modelGrams)&&Number.isFinite(record.result?.wasteGrams));
 const weight=hasFilament?records.reduce((sum,record)=>sum+(record!.result!.modelGrams!+record!.result!.wasteGrams!)*record!.ratio,0):null;
 const details=new Map<string,number>();
 if(hasFilament){
  for(const record of records){
   const result=record!.result!;
   for(const material of result.materialBreakdown??[]){
    const input=record!.input?.materials?.find(item=>item.id===material.id);
    const name=[material.name,input?.type,input?.brand].filter(Boolean).join(' · ');
    details.set(name,(details.get(name)??0)+material.totalGrams*record!.ratio);
   }
  }
 }
 const lines:ResultLine[]=[['Filamento consumido',weight===null?'Detalhe indisponível':number.format(weight)+' g']];
 for(const [key,label] of costCategories){
  if(records.length&&records.every(record=>Number.isFinite(record?.result?.[key]))){
   lines.push([label,brl.format(records.reduce((sum,record)=>sum+record!.result![key]!*record!.ratio,0))]);
  }
 }
 return {cost:total,partsCount:count,lines,filamentDetails:[...details].map(([label,grams])=>[label+' (consumo)',number.format(grams)+' g'])};
}

export function AssemblyComposer({workspaceId,active,identity,onSaved,onViewAssemblies,onResult,configuredSalePrice,pricing,selectedComposition,onRestorePricing}:{
 workspaceId:string;active:boolean;identity?:{name:string;sku:string;description:string;productId?:string};
 onSaved?:(name:string,productId:string)=>void;onViewAssemblies:()=>void;onResult?:(result:CompositionSummary)=>void;configuredSalePrice?:number;pricing?:CompositionPricing;selectedComposition?:AssemblyRecord;onRestorePricing?:(assembly:AssemblyRecord)=>void
}){
 const selectedHeading=useId(),catalogHeading=useId();
 const {requestConfirmation,confirmationDialog}=useConfirmation();
 const [library,setLibrary]=useState<ComponentLibraryItem[]>();
 const [snapshots,setSnapshots]=useState<Record<string,ComponentCostSnapshot|undefined>>({});
 const [parts,setParts]=useState<Part[]>([]);
 const [catalog,setCatalog]=useState<ProductRecord[]>([]);
 const [sourceProduct,setSourceProduct]=useState<ProductRecord>();
 const [query,setQuery]=useState('');
 const [viewing,setViewing]=useState<ProductRecord|null>(null);
 const [localName,setName]=useState('');
 const name=identity?.name??localName;
 const [salePrice,setSalePrice]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [saveError,setSaveError]=useState('');
 const [saved,setSaved]=useState(false);
 const initialized=useRef(false);
 useEffect(()=>{
  if(!active)return;
  let live=true;
  void Promise.all([listComponentLibrary(workspaceId),listProducts(workspaceId),
   identity?.productId&&!selectedComposition?listAssemblies(workspaceId):Promise.resolve([])
  ]).then(([rows,products,assemblies])=>{
   if(!live)return;
   setLibrary(rows);setCatalog(products.filter(product=>product.kind==='component'));
   setSourceProduct(products.find(product=>product.id===identity?.productId));
   if(!initialized.current){
    initialized.current=true;
    const existing=selectedComposition??assemblies.find(item=>item.id===identity?.productId);
    if(existing){
     const linked=existing.parts.flatMap(part=>part.product_id?[{id:part.product_id,quantity:Number(part.quantity),
      savedCost:part.unit_cost,snapshotId:part.source_snapshot_id}]:[]);
     setParts(linked);
     setSalePrice(existing.sale_price===null?'':String(existing.sale_price));
     onRestorePricing?.(existing);
     for(const part of linked)if(part.snapshotId)void getComponentCostSnapshot(workspaceId,part.id,part.snapshotId)
      .then(snapshot=>setSnapshots(previous=>({...previous,[part.id]:snapshot}))).catch(()=>{});
    }
   }
  }).catch(()=>{if(live){setLibrary(previous=>previous??[]);setError('Não foi possível consultar as peças da oficina.');}});
  return()=>{live=false;};
 },[workspaceId,active,identity?.productId,selectedComposition,onRestorePricing]);
 const filter=query.trim().toLocaleLowerCase('pt-BR');
 const choices=catalog.filter(item=>(item.name+' '+(item.sku??'')).toLocaleLowerCase('pt-BR').includes(filter));
 const price=identity?configuredSalePrice??null:salePrice===''?null:Number(salePrice);
 const priceValid=price===null||(Number.isFinite(price)&&price>=0&&price<=100000000);
 const quantitiesValid=parts.every(part=>Number.isSafeInteger(part.quantity)&&part.quantity>=1&&part.quantity<=100000);
 const summary=useMemo(()=>summarizeComposition(quantitiesValid?parts:[],library??[],snapshots),[quantitiesValid,parts,library,snapshots]);
 useEffect(()=>{onResult?.(summary);},[onResult,summary]);
 const canSave=parts.length>=2&&quantitiesValid
  &&name.trim().length>=2&&priceValid&&(!identity?.productId||Boolean(sourceProduct))&&parts.every(part=>catalog.some(item=>item.id===part.id));
 const add=(id:string)=>{
  if(busy||saved||!catalog.some(item=>item.id===id))return;
  setParts(previous=>previous.length>=30||previous.some(part=>part.id===id)?previous:[...previous,{id,quantity:1}]);
  void getComponentCostSnapshot(workspaceId,id)
   .then(snapshot=>setSnapshots(previous=>({...previous,[id]:snapshot})))
   .catch(()=>{});
 };
 const save=async(confirmed=false)=>{
  if(!canSave||busy||saved||!library)return;
  if(identity?.productId&&!confirmed){
   requestConfirmation({title:'Salvar composição neste produto',
    message:'Salvar a montagem por partes de “'+name.trim()+'” como uma nova revisão? A impressão direta continua disponível na mesma ficha.',
    actionLabel:'Salvar composição',onConfirm:()=>void save(true)});
   return;
  }
  setBusy(true);setSaveError('');
  const nameToSave=identity?.productId?name.trim():formatCatalogName(name);
  try{
   const componentParts=parts.map(part=>({product_id:part.id,name:catalog.find(item=>item.id===part.id)!.name,
    quantity:part.quantity,notes:'',grams:null,source_snapshot_id:part.snapshotId}));
   const draft={name:sourceProduct?.name??nameToSave,sku:sourceProduct?.sku??identity?.sku.trim()??'',
    description:sourceProduct?.description??(identity?.productId?'':identity?.description.trim()??''),
    salePrice:price??sourceProduct?.sale_price??null,parts:componentParts,pricing};
   const savedProductId=identity&&!identity.productId?await createComposedProduct(workspaceId,draft):
    await saveAssemblyWithComponents(workspaceId,identity?.productId??null,draft);
   setSaved(true);onSaved?.(nameToSave,savedProductId);
  }catch(cause){setSaveError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 return <div className={identity?"mc-assembly-composer":"workspace mc-assembly-composer"}>
  {confirmationDialog}
  <section className="panel mc-assembly-inputs" aria-label="Montar conjunto com peças salvas">
   <h2>Montar conjunto</h2>
   {!identity&&<label>Nome do conjunto<input value={name} maxLength={150} disabled={busy||saved} onChange={event=>setName(event.target.value)}/></label>}
   <div className="mc-assembly-columns">
    <section className="mc-assembly-column" aria-labelledby={selectedHeading}>
     <h3 id={selectedHeading}>Partes na composição</h3>
     {parts.length===0&&<p className="footnote">Adicione peças salvas para montar o conjunto.</p>}
     {parts.length>0&&<ul className="mc-assembly-parts">{parts.map(part=>{
      const item=library?.find(row=>row.id===part.id);
      const unitCost=part.savedCost===undefined?item?.unit_cost:part.savedCost;
      const partName=catalog.find(record=>record.id===part.id)?.name??'Peça indisponível';
      return <li key={part.id}>
       <div><strong>{partName}</strong><small>{unitCost==null?'Custo ainda não apurado':brl.format(Number(unitCost))+'/peça'}</small></div>
       <label>Qtd.<input aria-label={'Quantidade de '+partName} type="number" min="1" max="100000" step="1" value={Number.isNaN(part.quantity)?'':part.quantity}
        disabled={busy||saved} onChange={event=>{const quantity=event.target.valueAsNumber;setParts(previous=>previous.map(row=>row.id===part.id?{...row,quantity}:row));}}/></label>
       <button type="button" className="mc-light-action" disabled={busy||saved} onClick={()=>requestConfirmation({
         title:'Remover peça da composição',message:'Remover “'+partName+'” deste conjunto?',
         actionLabel:'Remover peça',onConfirm:()=>setParts(previous=>previous.filter(row=>row.id!==part.id))})}
        aria-label={'Remover '+partName}>×</button>
      </li>;
     })}</ul>}
    </section>
    <section className="mc-assembly-column" aria-labelledby={catalogHeading}>
     <h3 id={catalogHeading}>Peças disponíveis</h3>
     <label className="mc-assembly-search">Buscar peça salva<input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label>
     {!library&&!error&&<p role="status">Carregando peças…</p>}
     {library&&choices.length===0&&!error&&<p>{catalog.length===0?'Salve as peças na calculadora para usar aqui.':'Nenhuma peça encontrada.'}</p>}
     {choices.length>0&&<ul className="mc-assembly-catalog" aria-label="Peças salvas">
      {choices.map(item=>{
       const added=parts.some(part=>part.id===item.id);
       return <li key={item.id}>
        <div><strong>{item.name}</strong>{item.sku&&<small>{item.sku}</small>}</div>
        <div className="mc-assembly-card-actions">
         <button type="button" className="mc-light-action" onClick={()=>setViewing(item)}>Ver ficha</button>
         <button type="button" className="mc-light-action" disabled={busy||saved||added||parts.length>=30}
          aria-label={added?undefined:'Adicionar à composição'} onClick={()=>add(item.id)}>{added?'Adicionada':'Adicionar'}</button>
        </div>
       </li>;
      })}
     </ul>}
    </section>
   </div>
   {!identity&&<label>Preço de venda do conjunto (R$, opcional)<input type="number" min="0" step=".01" value={salePrice}
    disabled={busy||saved} onChange={event=>setSalePrice(event.target.value)}/></label>}
   {!quantitiesValid&&<p role="alert" className="error">Informe uma quantidade inteira válida para cada peça.</p>}
   {error&&<p role="alert" className="error">{error}</p>}
   <OperationFeedback pending={busy} pendingMessage="Aguardando o salvamento da composição…" error={saveError} failureMessage="Não foi possível salvar o conjunto."/>
   {saved&&<p role="status" className="product-success">Conjunto salvo na oficina.</p>}
   {active&&viewing&&<Modal title={viewing.name} onClose={()=>setViewing(null)}>
    <div className="modal-body">
     {viewing.sku&&<p>Referência {viewing.sku}</p>}
     {viewing.description&&<p>{viewing.description}</p>}
     {viewing.sale_price!==null&&<p>Preço de venda {brl.format(Number(viewing.sale_price))}</p>}
     <ProductPhotos workspaceId={workspaceId} productId={viewing.id} name={viewing.name} readOnly/>
     <div className="modal-actions">
      <button type="button" onClick={()=>setViewing(null)}>Fechar ficha</button>
      {!parts.some(part=>part.id===viewing.id)&&!saved&&parts.length<30&&
       <button type="button" className="primary-action" onClick={()=>{add(viewing.id);setViewing(null);}}>Adicionar à composição</button>}
     </div>
    </div>
   </Modal>}
  </section>
  {!identity&&<CalculationResultPanel composed quantity={1} title={name} showShare={false}
   result={priceValid?compositionNumbers(summary.cost,price??0):undefined} lines={summary.lines} filamentDetails={summary.filamentDetails}
   sourceNotice={summary.partsCount?number.format(summary.partsCount)+' partes na composição':'Selecione as partes para começar'}/>}
  {active&&<FormActionDock title={name.trim()||'Novo conjunto'} subtitle="Composição de peças salvas">
   <button type="button" className="secondary-action" disabled={busy} onClick={onViewAssemblies}>Ver conjuntos</button>
   <button type="button" className="primary-action" disabled={!canSave||busy||saved} onClick={()=>void save()}>{busy?'Salvando…':identity?.productId?'Salvar composição':'Salvar conjunto'}</button>
  </FormActionDock>}
 </div>;
}
