import {useEffect,useState} from 'react';
import {CalculatorHelp} from './CalculatorHelp';
import {FormActionDock} from './FormActionDock';
import {formatCatalogName} from '../domain/catalogName';
import {getComponentCostSnapshot,listComponentLibrary,saveAssemblyWithComponents,
 type ComponentCostSnapshot,type ComponentLibraryItem} from '../data/supabase';

type Part={id:string;quantity:number};
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const number=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:3});
const costCategories=[
 ['material','Filamento'],['energy','Energia'],['depreciation','Depreciação'],
 ['assembly','Montagem'],['accessories','Acessórios']
] as const;

function AssemblyResults({parts,library,snapshots,price}:{
 parts:Part[];library:ComponentLibraryItem[];snapshots:Record<string,ComponentCostSnapshot|undefined>;price:number|null
}){
 const count=parts.reduce((sum,part)=>sum+part.quantity,0);
 const unitCosts=parts.map(part=>library.find(item=>item.id===part.id)?.unit_cost??null);
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
 return <section className="panel result-panel" aria-labelledby="assembly-result-title">
  <div className="mc-result-heading"><h2 id="assembly-result-title">Resultado do conjunto</h2>
   <CalculatorHelp label="Custo do conjunto">Somamos o custo salvo por peça, multiplicado pela quantidade no conjunto. Esse cálculo reúne peças já custeadas separadamente.</CalculatorHelp>
  </div>
  <div className="hero-amount"><span>Custo estimado por conjunto</span>
   <strong>{total===null?'—':brl.format(total)}</strong>
   <small>{parts.length===0?'Selecione as peças para começar':number.format(count)+' peças na composição'}</small>
  </div>
  {parts.length>0&&<>
   {total===null&&<p>Há peças sem custo salvo. Abra a ficha da peça na calculadora para apurar o valor.</p>}
   <dl className="cost-list">
    <div><dt>Filamento consumido</dt><dd>{weight===null?'Detalhe indisponível':number.format(weight)+' g'}</dd></div>
    {total!==null&&price!==null&&<>
     <div><dt>Lucro bruto por conjunto</dt><dd>{brl.format(price-total)}</dd></div>
     <div><dt>Margem bruta</dt><dd>{price>0?number.format((price-total)/price*100)+'%':'—'}</dd></div>
    </>}
   </dl>
   {weight!==null&&<details className="breakdown"><summary>Composição dos custos e filamentos</summary>
    <dl className="cost-list">{costCategories.map(([key,label])=>records.every(record=>Number.isFinite(record?.result?.[key]))&&
     <div key={key}><dt>{label}</dt><dd>{brl.format(records.reduce((sum,record)=>sum+record!.result![key]!*record!.ratio,0))}</dd></div>)}
     {[...details].map(([name,grams])=><div key={name}><dt>{name}</dt><dd>{number.format(grams)} g</dd></div>)}
    </dl>
   </details>}
  </>}
 </section>;
}

export function AssemblyComposer({workspaceId,active,onViewAssemblies}:{workspaceId:string;active:boolean;onViewAssemblies:()=>void}){
 const [library,setLibrary]=useState<ComponentLibraryItem[]>();
 const [snapshots,setSnapshots]=useState<Record<string,ComponentCostSnapshot|undefined>>({});
 const [parts,setParts]=useState<Part[]>([]);
 const [selection,setSelection]=useState('');
 const [name,setName]=useState('');
 const [salePrice,setSalePrice]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [saved,setSaved]=useState(false);
 useEffect(()=>{
  if(!active)return;
  let live=true;
  void listComponentLibrary(workspaceId).then(rows=>{if(live)setLibrary(rows);})
   .catch(()=>{if(live){setLibrary(previous=>previous??[]);setError('Não foi possível consultar as peças da oficina.');}});
  return()=>{live=false;};
 },[workspaceId,active]);
 const choices=(library??[]).filter(item=>!parts.some(part=>part.id===item.id));
 const price=salePrice===''?null:Number(salePrice);
 const priceValid=price===null||(Number.isFinite(price)&&price>=0&&price<=100000000);
 const quantitiesValid=parts.every(part=>Number.isSafeInteger(part.quantity)&&part.quantity>=1&&part.quantity<=100000);
 const canSave=parts.length>=2&&quantitiesValid
  &&name.trim().length>=2&&priceValid&&parts.every(part=>library?.some(item=>item.id===part.id));
 const add=()=>{
  if(!selection||parts.some(part=>part.id===selection)||parts.length>=30)return;
  const id=selection;
  setParts(previous=>[...previous,{id,quantity:1}]);setSelection('');
  void getComponentCostSnapshot(workspaceId,id)
   .then(snapshot=>setSnapshots(previous=>({...previous,[id]:snapshot})))
   .catch(()=>{});
 };
 const save=async()=>{
  if(!canSave||busy||saved||!library)return;
  setBusy(true);setError('');
  try{
   await saveAssemblyWithComponents(workspaceId,null,{name:formatCatalogName(name),sku:'',description:'',salePrice:price,
    parts:parts.map(part=>({product_id:part.id,name:library!.find(item=>item.id===part.id)!.name,
     quantity:part.quantity,notes:'',grams:null}))});
   setSaved(true);
  }catch(cause){setError('Não foi possível salvar o conjunto. '+(cause as Error).message);}
  finally{setBusy(false);}
 };
 return <div className="workspace mc-assembly-composer">
  <section className="panel mc-assembly-inputs" aria-label="Montar conjunto com peças salvas">
   <h2>Montar conjunto</h2>
   <label>Nome do conjunto<input value={name} maxLength={150} disabled={busy||saved} onChange={event=>setName(event.target.value)}/></label>
   <div className="mc-assembly-select">
    <label>Peça salva<select value={selection} disabled={busy||saved||!library||parts.length>=30} onChange={event=>setSelection(event.target.value)}>
     <option value="">{library?'Selecione uma peça':'Carregando peças…'}</option>
     {choices.map(item=><option key={item.id} value={item.id}>{item.name}{item.sku?' · '+item.sku:''}</option>)}
    </select></label>
    <button type="button" className="details-button" disabled={busy||saved||!selection} onClick={add}>Adicionar peça</button>
   </div>
   {library?.length===0&&!error&&<p>Salve as peças na calculadora para usar aqui.</p>}
   {parts.length>0&&<ul className="mc-assembly-parts">{parts.map(part=>{
    const item=library?.find(row=>row.id===part.id);
    return <li key={part.id}>
     <div><strong>{item?.name??'Peça indisponível'}</strong><small>{item?.unit_cost==null?'Custo ainda não apurado':brl.format(Number(item.unit_cost))+'/peça'}</small></div>
     <label>Qtd.<input aria-label={'Quantidade de '+(item?.name??'peça indisponível')} type="number" min="1" max="100000" step="1" value={Number.isNaN(part.quantity)?'':part.quantity}
      disabled={busy||saved} onChange={event=>{const quantity=event.target.valueAsNumber;setParts(previous=>previous.map(row=>row.id===part.id?{...row,quantity}:row));}}/></label>
     <button type="button" className="details-button" disabled={busy||saved} onClick={()=>setParts(previous=>previous.filter(row=>row.id!==part.id))}
      aria-label={'Remover '+(item?.name??'peça indisponível')}>×</button>
    </li>;
   })}</ul>}
   <label>Preço de venda do conjunto (R$, opcional)<input type="number" min="0" step=".01" value={salePrice}
    disabled={busy||saved} onChange={event=>setSalePrice(event.target.value)}/></label>
   {!quantitiesValid&&<p role="alert" className="error">Informe uma quantidade inteira válida para cada peça.</p>}
   {error&&<p role="alert" className="error">{error}</p>}
   {saved&&<p role="status" className="product-success">Conjunto salvo na oficina.</p>}
  </section>
  <AssemblyResults parts={quantitiesValid?parts:[]} library={library??[]} snapshots={snapshots} price={priceValid?price:null}/>
  {active&&<FormActionDock title={name.trim()||'Novo conjunto'} subtitle="Composição de peças salvas">
   <button type="button" className="secondary-action" disabled={busy} onClick={onViewAssemblies}>Ver conjuntos</button>
   <button type="button" className="primary-action" disabled={!canSave||busy||saved} onClick={()=>void save()}>{busy?'Salvando…':'Salvar conjunto'}</button>
  </FormActionDock>}
 </div>;
}
