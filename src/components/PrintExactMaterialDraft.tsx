import {CalculatorHelp} from './CalculatorHelp';
import {useEffect,useRef,useState} from 'react';
import {getL4ExactOrigins,type ExactConsumptionOrigins} from '../data/supabase';
import {reconcileExactMaterialCategories,type MaterialCategory,type MaterialReconciliationDraft,type SourceAssignment} from '../domain/l4-category-reconciliation';
import type {AllocationLine,AllocationOutput} from '../domain/print-allocation';

type Props={workspaceId:string|null;executionId:string;outputs:AllocationOutput[];lines:AllocationLine[]};
const cents=(value:string)=>'R$ '+new Intl.NumberFormat('pt-BR').format(BigInt(value)/100n)+
 ','+(BigInt(value)%100n).toString().padStart(2,'0');
const issueLabels:Record<string,string>={
 UNKNOWN_COST:'Custo de origem desconhecido.',
 ESTIMATED_COST:'Custo de origem estimado, ainda sem comprovação.',
 MISSING_ASSIGNMENT:'Consumo confirmado sem atribuição de base e destino.',
 MISSING_PURCHASE_EVIDENCE:'Origem conhecida sem referência de compra.'
};
/**
 * Conferência de material P05/P06 em memória: usa preço total e massa
 * originais congelados; NÃO cria snapshot, fechamento ou lançamentos.
 */
export function PrintExactMaterialDraft({workspaceId,executionId,outputs,lines}:Props){
 const [data,setData]=useState<ExactConsumptionOrigins|null>(null);
 const [draft,setDraft]=useState<MaterialReconciliationDraft|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const request=useRef(0);
 useEffect(()=>{
  ++request.current;setData(null);setDraft(null);setBusy(false);setError('');
 },[executionId,workspaceId,lines]);
 const inspect=()=>{
  if(!workspaceId||!executionId)return;
  const id=++request.current;
  setBusy(true);setError('');setData(null);setDraft(null);
  void getL4ExactOrigins(workspaceId,executionId).then(raw=>{
   if(id!==request.current)return;
   if(raw.execution_id!==executionId||raw.read_only!==true||
      raw.financially_final!==false||raw.exact_source_version!=='l4-exact-origin-v1'||
      !Number.isSafeInteger(raw.historical_rows_without_capture)||
      raw.historical_rows_without_capture<0||!Array.isArray(raw.origins)){
    throw new Error('Contrato da consulta de origens exatas inválido.');
   }
   const assignments:SourceAssignment[]=lines.flatMap(line=>{
    const match=/^historico:([^:]+):(model|purge|loss)$/.exec(line.sourceVersion);
    if(!match)return [];
    if(line.category!==match[2])throw new Error('Categoria histórica incompatível com a fonte.');
    return [{
     consumptionId:match[1],category:match[2] as MaterialCategory,
     method:line.method,destinations:line.destinations.map(d=>({outputId:d.outputId,weight:d.basis})),
     rationale:line.rationale
    }];
   });
   const output=reconcileExactMaterialCategories({
    executionId,outputs,
    origins:raw.origins.map(o=>({
     consumption_id:o.consumption_id,lot_id:o.lot_id,status:o.status,
     original_quantity_g:o.original_quantity_g,
     original_total_cost_brl:o.original_total_cost_brl,
     purchase_line_id:o.purchase_line_id,model_g:o.model_g,purge_g:o.purge_g,loss_g:o.loss_g
    })),assignments
   });
   setData(raw);setDraft(output);
  }).catch(e=>{if(id===request.current)setError('Não foi possível conciliar fontes exatas: '+(e as Error).message);})
  .finally(()=>{if(id===request.current)setBusy(false);});
 };
 const complete=data&&draft&&data.historical_rows_without_capture===0&&data.origins.length>0&&
  draft.expectedAssignments>0&&draft.totalCents!==null&&draft.issues.length===0;
 return <section className="panel" aria-label="Conciliação exata de material L4">
  <div className="mc-help-heading"><h4>Conciliação exata de filamento por categoria</h4><CalculatorHelp label="Conciliação exata de filamento por categoria">Conferência local dos dados P06 congelados por bobina. Agrupa todas as fontes da mesma categoria e arredonda uma única vez. O resultado permanece provisório mesmo quando a distribuição de material está completa.</CalculatorHelp></div>
  <button type="button" onClick={inspect} disabled={busy||!workspaceId||!executionId}>
   {busy?'Consultando origem exata…':'Conferir valores exatos do material'}
  </button>
  {error&&<p role="alert" className="error">{error}</p>}
  {data&&draft&&<div role="status" aria-label="Diagnóstico de material exato L4">
   <p><strong>Fechamento financeiro: PENDENTE.</strong> Sem gravação, postagem, estorno ou snapshot final.</p>
   <p>Fontes congeladas: {data.origins.length} · Consumos antigos sem origem exata: {data.historical_rows_without_capture} · Atribuições verificadas: {draft.coveredAssignments} de {draft.expectedAssignments}.</p>
   {data.origins.length===0&&<p>Nenhuma fonte exata disponível. Não é possível calcular custo final de material.</p>}
   {data.historical_rows_without_capture>0&&<p>Existem confirmações antigas sem captura P06; não reconstruir o preço usando valores atuais.</p>}
   <ul>{draft.categories.map(c=><li key={c.category}>
    {c.category==='model'?'Modelo':c.category==='purge'?'Purga':'Perda'}:
    {' '+cents(c.closedCents)} (total desta categoria antes do rateio)
    <ul>{c.destinations.map(d=><li key={d.outputId}>
     {outputs.find(o=>o.id===d.outputId)?.name||d.outputId}: {cents(d.cents)}
     {d.residualCent?' · centavo residual atribuído':''}
    </li>)}</ul>
   </li>)}</ul>
   {draft.issues.length>0&&<ul aria-label="Pendências de material exato">{draft.issues.map((issue,i)=>
    <li key={issue.sourceId+'-'+issue.code+'-'+i}>{issueLabels[issue.code]||issue.code} ({issue.sourceId})</li>
   )}</ul>}
   <p>{complete?'Rateio do material conciliado; demais custos e estornos ainda pendentes.':
    'Material ainda não integralmente conciliado. Custos desconhecidos não são considerados zero.'}</p>
   <small>Não confundir o subtotal do filamento com custo industrial definitivo. P07/P09 e snapshots imutáveis finais permanecem pendentes.</small>
  </div>}
 </section>;
}
