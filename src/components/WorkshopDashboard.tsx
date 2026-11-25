import {useEffect,useState} from 'react';
import {listProducts,listAssemblies,listPrints,type ProductRecord,type AssemblyRecord,type PrintRecord} from '../data/supabase';
import type {OverviewTab,SystemSection} from './SystemNavigation';

type View=SystemSection;
type Props={tab:OverviewTab;workspaceId:string|null;workspaceName:string;printersCount:number;busy:boolean;onNavigate:(view:View)=>void};
const printStages:{label:string;statuses:PrintRecord['status'][];color:string}[]=[
 {label:'Rascunhos e reservas',statuses:['draft','reserved'],color:'blue'},
 {label:'Em andamento',statuses:['running','partial'],color:'blue'},
 {label:'Concluídas',statuses:['completed'],color:'green'},
 {label:'Com falha',statuses:['failed'],color:'amber'},
 {label:'Canceladas',statuses:['cancelled'],color:'gray'}
];

type Bar={label:string;value:number;color:string};
function DashboardBars({bars}: {bars:Bar[]}){
 const max=Math.max(1,...bars.map(bar=>bar.value));
 return <dl className="dashboard-bars">{bars.map(bar=><div key={bar.label}>
  <dt>{bar.label}</dt><dd>{bar.value.toLocaleString('pt-BR')}</dd>
  <div className="dashboard-bar-track" aria-hidden="true"><span data-color={bar.color} style={{width:(bar.value/max*100)+'%'}}/></div>
 </div>)}</dl>;
}

export function WorkshopDashboard({tab,workspaceId,workspaceName,busy,onNavigate}:Props){
 const [products,setProducts]=useState<ProductRecord[]>([]);
 const [kits,setKits]=useState<AssemblyRecord[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [refresh,setRefresh]=useState(0);
 const [prints,setPrints]=useState<PrintRecord[]|null>(null);
 const [printsLoading,setPrintsLoading]=useState(false);
 const [printsError,setPrintsError]=useState(false);
 useEffect(()=>{
  let alive=true;
  setProducts([]);setKits([]);setError('');
  if(!workspaceId)return;
  setLoading(true);
  void Promise.all([listProducts(workspaceId),listAssemblies(workspaceId)])
   .then(([p,k])=>{if(alive){setProducts(p);setKits(k);}})
   .catch(e=>{if(alive)setError('Não foi possível atualizar os indicadores da oficina: '+(e as Error).message);})
   .finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[workspaceId,refresh]);
 useEffect(()=>{
  let active=true;
  setPrints(null);setPrintsError(false);setPrintsLoading(false);
  if(!workspaceId||tab!=='general')return;
  setPrintsLoading(true);
  void listPrints(workspaceId)
   .then(rows=>{if(active)setPrints(rows);})
   .catch(()=>{if(active)setPrintsError(true);})
   .finally(()=>{if(active)setPrintsLoading(false);});
  return()=>{active=false;};
 },[workspaceId,tab,refresh]);
 const printCounts=printStages.map(({label,statuses,color})=>({
  label,color,value:prints?.filter(print=>statuses.includes(print.status)).length??0
 }));
 const confirmedPieces=(prints??[]).reduce((counts,print)=>{
  for(const output of print.outputs){
   counts.good+=output.good;
   counts.failed+=output.failed;
  }
  return counts;
 },{good:0,failed:0});
 const productCount=products.filter(p=>p.kind==='product').length;
 const recent=products.slice().sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
 const pendingKits=kits.filter(k=>k.total_cost===null || k.sale_price===null);
 const pendingProducts=products.filter(p=>p.kind!=='kit' && p.sale_price===null);
 const date=(iso:string)=>{const n=new Date(iso);return Number.isFinite(n.getTime())?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeZone:'America/Sao_Paulo'}).format(n):'Data indisponível';};
 return <section className="dashboard-home" aria-label="Painel da oficina">
  <div className="dashboard-welcome">
   <div><p className="eyebrow">PAINEL DA OFICINA</p><h1>{workspaceName}</h1>
    <p>Gerencie seus cadastros e acompanhe o que já está salvo na nuvem.</p></div>
   <button type="button" onClick={()=>setRefresh(n=>n+1)} disabled={loading||printsLoading||busy||!workspaceId}>Atualizar dados</button>
  </div>
  {busy&&<p role="status" className="footnote">Conectando à sua oficina…</p>}
  {error&&<p className="error" role="alert">{error}</p>}
  {tab==='general'&&<><div className="dashboard-metrics" aria-label="Indicadores da oficina">
   <div className="dashboard-metric"><span>Produtos</span><strong>{loading||busy||error||!workspaceId?'—':productCount}</strong><small>Produtos simples cadastrados</small></div>
   <div className="dashboard-metric"><span>Impressões</span><strong>{prints?.length??'—'}</strong><small>Execuções disponíveis</small></div>
   <div className="dashboard-metric"><span>Custos</span><strong>R$ —</strong><small>Aguardando custos finais apurados</small></div>
   <div className="dashboard-metric"><span>Resultados</span><strong>R$ —</strong><small>Aguardando vendas registradas</small></div>
  </div>
  {printsLoading&&<p role="status">Consultando impressões…</p>}
  {printsError&&<p role="status" className="footnote">Impressões indisponíveis no momento.</p>}
  {prints?.length===0&&<p className="footnote">Nenhuma execução disponível nesta oficina.</p>}
  {prints&&prints.length>0&&<div className="dashboard-columns dashboard-production">
   <section className="panel dashboard-card" aria-labelledby="dashboard-print-status">
    <h2 id="dashboard-print-status">Impressões por etapa</h2>
    <DashboardBars bars={printCounts}/>
   </section>
   <section className="panel dashboard-card" aria-labelledby="dashboard-piece-results">
    <h2 id="dashboard-piece-results">Peças confirmadas</h2>
    {confirmedPieces.good+confirmedPieces.failed>0?<DashboardBars bars={[
     {label:'Boas',value:confirmedPieces.good,color:'green'},
     {label:'Rejeitadas',value:confirmedPieces.failed,color:'amber'}
    ]}/>:<p>Nenhuma peça confirmada nas execuções disponíveis.</p>}
   </section>
  </div>}
  </>}
  {tab==='activities'&&<section className="panel dashboard-card dashboard-tab-panel" aria-label="Atividades da oficina">
   <h2>Cadastros recentes</h2><p>Registros de produtos cadastrados na oficina, ordenados pela data de criação. Esta lista não é um log de alterações ou impressões.</p>
   {loading?<p role="status">Carregando atividades…</p>:recent.length===0?<p>Nenhum cadastro de produto encontrado.</p>:
   <ul className="dashboard-activity-list">{recent.slice(0,20).map(p=><li key={p.id}><div><strong>{p.name}</strong><small>{p.kind==='kit'?'Conjunto':p.kind==='component'?'Peça':'Produto'} cadastrado · {date(p.created_at)}</small></div><button type="button" onClick={()=>onNavigate(p.kind==='kit'?'assemblies':'products')}>Consultar</button></li>)}</ul>}
   {recent.length>20&&<p className="footnote">Exibindo os 20 cadastros mais recentes.</p>}
  </section>}
  {tab==='pending'&&<section className="panel dashboard-card dashboard-tab-panel" aria-label="Pendências da oficina">
   <h2>Informações a completar</h2><p>Dados incompletos identificados nos cadastros. Não representam tarefas com prazo nem ordens de produção.</p>
   {loading?<p role="status">Carregando pendências…</p>:pendingKits.length===0&&pendingProducts.length===0?<p>Não há pendências de preço ou custo identificadas nos cadastros consultados.</p>:
   <ul className="dashboard-activity-list">
    {pendingKits.map(kit=><li key={kit.id}><div><strong>{kit.name}</strong><small>{[kit.total_cost===null?'Custo não apurado':null,kit.sale_price===null?'Preço de venda não informado':null].filter(Boolean).join(' · ')}</small></div><button type="button" onClick={()=>onNavigate('assemblies')}>Abrir conjunto</button></li>)}
    {pendingProducts.map(p=><li key={p.id}><div><strong>{p.name}</strong><small>Preço de venda não informado</small></div><button type="button" onClick={()=>onNavigate('products')}>Ver produto</button></li>)}
   </ul>}
  </section>}
 </section>;
}
