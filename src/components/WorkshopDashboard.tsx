import {useEffect,useState} from 'react';
import {listProducts,listAssemblies,type ProductRecord,type AssemblyRecord} from '../data/supabase';
import type {OverviewTab,SystemSection} from './SystemNavigation';

type View=SystemSection;
type Props={tab:OverviewTab;workspaceId:string|null;workspaceName:string;printersCount:number;busy:boolean;onNavigate:(view:View)=>void};
export function WorkshopDashboard({tab,workspaceId,workspaceName,busy,onNavigate}:Props){
 const [products,setProducts]=useState<ProductRecord[]>([]);
 const [kits,setKits]=useState<AssemblyRecord[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [refresh,setRefresh]=useState(0);
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
 const productCount=products.filter(p=>p.kind==='product').length;
 const recent=products.slice().sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
 const pendingKits=kits.filter(k=>k.total_cost===null || k.sale_price===null);
 const pendingProducts=products.filter(p=>p.kind!=='kit' && p.sale_price===null);
 const date=(iso:string)=>{const n=new Date(iso);return Number.isFinite(n.getTime())?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeZone:'America/Sao_Paulo'}).format(n):'Data indisponível';};
 return <section className="dashboard-home" aria-label="Painel da oficina">
  <div className="dashboard-welcome">
   <div><p className="eyebrow">PAINEL DA OFICINA</p><h1>{workspaceName}</h1>
    <p>Gerencie seus cadastros e acompanhe o que já está salvo na nuvem.</p></div>
   <button type="button" onClick={()=>setRefresh(n=>n+1)} disabled={loading||busy||!workspaceId}>Atualizar dados</button>
  </div>
  {busy&&<p role="status" className="footnote">Conectando à sua oficina…</p>}
  {error&&<p className="error" role="alert">{error}</p>}
  {tab==='general'&&<><div className="dashboard-metrics" aria-label="Indicadores da oficina">
   <div className="dashboard-metric"><span>Produtos</span><strong>{loading||busy||error||!workspaceId?'—':productCount}</strong><small>Produtos simples cadastrados</small></div>
   <div className="dashboard-metric"><span>Impressões</span><strong>—</strong><small>Indicador a integrar</small></div>
   <div className="dashboard-metric"><span>Custos</span><strong>R$ —</strong><small>Dados financeiros a integrar</small></div>
   <div className="dashboard-metric"><span>Resultados</span><strong>R$ —</strong><small>Dados financeiros a integrar</small></div>
  </div>
  <section className="panel dashboard-card dashboard-chart"><h2>Evolução dos custos</h2><div className="dashboard-chart-empty"><span>Sem série financeira disponível</span></div><p>O gráfico será preenchido com custos comprovados da oficina.</p></section>
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
  <p className="dashboard-note">Os indicadores refletem cadastros, não produção ou faturamento confirmados. Dados ausentes não são tratados como zero.</p>
 </section>;
}
