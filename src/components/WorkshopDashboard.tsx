import {useEffect,useState,type ReactNode} from 'react';
import {
 listAssemblies,listLatestProductCalculations,listPrints,listProducts,
 type PrintRecord,type SavedCalculation
} from '../data/supabase';
import type {OverviewTab} from './SystemNavigation';

type ProductTarget={id:string;section:'products'|'assemblies';part?:boolean};
type Props={
 tab:OverviewTab;workspaceId:string|null;onTab:(tab:OverviewTab)=>void;
 onCalculation:(saved:SavedCalculation)=>void;onPrint:(id?:string)=>void;
 onProduct:(target:ProductTarget)=>void;
};
type Query<T>={key:string;state:'ready';data:T}|{key:string;state:'error'};
const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeZone:'America/Sao_Paulo'});
const formatDate=(iso:string)=>Number.isFinite(Date.parse(iso))?date.format(new Date(iso)):'Data indisponível';
const printLabels:Partial<Record<PrintRecord['status'],string>>={
 running:'Em execução',partial:'Confirmação parcial',failed:'Com falha'
};

function useDashboardQuery<T>(workspaceId:string|null,load:(id:string)=>Promise<T>){
 const [attempt,setAttempt]=useState(0);
 const [result,setResult]=useState<Query<T>>();
 const key=workspaceId?workspaceId+'/'+attempt:null;
 useEffect(()=>{
  if(!workspaceId||!key)return;
  let active=true;
  void load(workspaceId).then(data=>{
   if(active)setResult({key,state:'ready',data});
  }).catch(()=>{
   if(active)setResult({key,state:'error'});
  });
  return()=>{active=false;};
 },[workspaceId,key,load]);
 return {result:key&&result?.key===key?result:undefined,retry:()=>setAttempt(n=>n+1)};
}

function DataBlock<T>({workspaceId,load,children}:{
 workspaceId:string|null;load:(id:string)=>Promise<T>;children:(data:T)=>ReactNode
}){
 const {result,retry}=useDashboardQuery(workspaceId,load);
 if(!workspaceId)return <p>Aguardando acesso à oficina.</p>;
 if(!result)return <p role="status">Carregando…</p>;
 if(result.state==='error')return <div className="dashboard-data-error">
  <p role="alert">Não foi possível carregar estes dados.</p>
  <button type="button" className="secondary-action" onClick={retry}>Tentar novamente</button>
 </div>;
 return children(result.data);
}

async function listPending(workspaceId:string){
 const [products,assemblies]=await Promise.all([listProducts(workspaceId),listAssemblies(workspaceId)]);
 const entries=assemblies.flatMap<{target:ProductTarget;name:string;reasons:string[]}>(assembly=>{
  const reasons=[
   assembly.total_cost===null?'Custo não apurado':'',
   assembly.sale_price===null?'Preço de venda não informado':''
  ].filter(Boolean);
  return reasons.length?[{target:{id:assembly.id,section:'assemblies'},name:assembly.name,reasons}]:[];
 });
 const assemblyIds=new Set(assemblies.map(assembly=>assembly.id));
 for(const product of products){
  if(product.kind==='kit'||assemblyIds.has(product.id)||product.sale_price!==null)continue;
  entries.push({
   target:{id:product.id,section:'products',part:product.kind==='component'},
   name:product.name,reasons:['Preço de venda não informado']
  });
 }
 return entries;
}

function RecordButton({name,detail,state,featured,onClick}:{
 name:string;detail:string;state?:string;featured?:boolean;onClick:()=>void
}){
 return <button type="button" className="dashboard-record" data-featured={featured||undefined} onClick={onClick}>
  <span className="dashboard-record-copy"><strong>{name}</strong><small>{detail}</small></span>
  {state&&<span className="dashboard-record-state" data-failed={state===printLabels.failed}>{state}</span>}
  <span aria-hidden="true" className="dashboard-record-chevron">›</span>
 </button>;
}

export function WorkshopDashboard({tab,workspaceId,onTab,onCalculation,onPrint,onProduct}:Props){
 return <section className="dashboard-home" aria-label="Painel da oficina">
  {tab==='general'&&<>
   <div className="dashboard-work-grid">
    <section className="panel dashboard-card dashboard-calculations" aria-labelledby="dashboard-calculations">
     <h2 id="dashboard-calculations">Cálculos recentes</h2>
     <DataBlock workspaceId={workspaceId} load={listLatestProductCalculations}>{calculations=>
      calculations.length===0?<p>Seus cálculos salvos aparecerão aqui.</p>:
      <ul className="dashboard-record-list">{calculations.slice(0,3).map((saved,index)=><li key={saved.snapshot_id}>
       <RecordButton featured={index===0} name={saved.name} detail={'Salvo em '+formatDate(saved.saved_at)} onClick={()=>onCalculation(saved)}/>
      </li>)}</ul>
     }</DataBlock>
    </section>
    <section className="panel dashboard-card dashboard-prints" aria-labelledby="dashboard-current-prints">
     <h2 id="dashboard-current-prints">Impressões para acompanhar</h2>
     <DataBlock workspaceId={workspaceId} load={listPrints}>{prints=>{
      const current=prints.filter(print=>printLabels[print.status]).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
      return <>
       {current.length===0?<p>Nenhuma impressão em execução, parcialmente confirmada ou com falha.</p>:
        <ul className="dashboard-record-list">{current.slice(0,3).map(print=><li key={print.id}>
         <RecordButton name={print.outputs.map(output=>output.name).join(' + ')||'Impressão sem peças'}
          detail={print.printer_name||'Impressora sem nome'} state={printLabels[print.status]} onClick={()=>onPrint(print.id)}/>
        </li>)}</ul>}
       <button type="button" className="secondary-action" onClick={()=>onPrint()}>Ver impressões</button>
      </>;
     }}</DataBlock>
    </section>
   </div>
   <div className="dashboard-pending-summary">
    <DataBlock workspaceId={workspaceId} load={listPending}>{pending=>
     pending.length===0?<p>Nenhuma pendência de custo ou preço nos cadastros.</p>:
     <button type="button" className="dashboard-pending-button" onClick={()=>onTab('pending')}>
      <span>Ver pendências</span>
      <span className="dashboard-pending-count">{pending.length} {pending.length===1?'cadastro':'cadastros'}</span>
      <span aria-hidden="true" className="dashboard-record-chevron">›</span>
     </button>
    }</DataBlock>
   </div>
  </>}
  {tab==='activities'&&<section className="panel dashboard-card" aria-labelledby="dashboard-activities">
   <h2 id="dashboard-activities">Cadastros recentes</h2>
   <DataBlock workspaceId={workspaceId} load={listProducts}>{products=>
    products.length===0?<p>Nenhum cadastro de produto encontrado.</p>:
    <ul className="dashboard-record-list">{products.slice(0,20).map(product=><li key={product.id}>
     <RecordButton name={product.name} detail={'Cadastro em '+formatDate(product.created_at)} onClick={()=>onProduct({
      id:product.id,section:product.kind==='kit'?'assemblies':'products',part:product.kind==='component'
     })}/>
    </li>)}</ul>
   }</DataBlock>
  </section>}
  {tab==='pending'&&<section className="panel dashboard-card" aria-labelledby="dashboard-pending">
   <h2 id="dashboard-pending">Informações a completar</h2>
   <DataBlock workspaceId={workspaceId} load={listPending}>{pending=>
    pending.length===0?<p>Nenhuma pendência de custo ou preço nos cadastros.</p>:
    <ul className="dashboard-record-list">{pending.map(entry=><li key={entry.target.id}>
     <RecordButton name={entry.name} detail={entry.reasons.join(' · ')} onClick={()=>onProduct(entry.target)}/>
    </li>)}</ul>
   }</DataBlock>
  </section>}
 </section>;
}
