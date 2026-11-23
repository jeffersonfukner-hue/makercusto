import {useEffect,useRef,useState} from 'react';
import {getL4CloseReadiness,type L4CloseReadiness} from '../data/supabase';

type Props={workspaceId:string|null;executionId:string};

const reasonLabels:Record<string,string>={
 NO_REVIEW:'Nenhuma revisão financeira foi registrada.',
 NO_CONFIRMED_OUTPUTS:'Ainda não existem peças confirmadas nesta impressão.',
 NO_CONFIRMED_CONSUMPTION:'Ainda não existe consumo de material confirmado.',
 MISSING_EXACT_ORIGINS:'Existem consumos sem captura de origem financeira exata.',
 UNKNOWN_SOURCE_COST:'Existem bobinas com custo desconhecido.',
 ESTIMATED_SOURCE_COST:'Existem custos estimados que precisam de comprovação.',
 SOURCE_WITHOUT_PURCHASE_REFERENCE:'Há custo declarado conhecido sem referência de compra.',
 ACTIVE_RESERVATIONS:'Existem reservas de material ainda ativas.',
 REVERSED_CONFIRMATIONS_NEED_RECONCILIATION:'Confirmações estornadas exigem conciliação.',
 UNREVIEWED_COST_CATEGORIES:'Categorias de custo continuam sem revisão.',
 FINAL_ALLOCATION_NOT_IMPLEMENTED:'A conciliação financeira integral ainda não foi implementada.',
 P09_REVERSAL_NOT_IMPLEMENTED:'A compensação financeira histórica P09 ainda não foi implementada.'
};

/** Dossiê de origem no servidor. Botão explicitamente read-only, sem POST financeiro. */
export function PrintReadinessPanel({workspaceId,executionId}:Props){
 const [result,setResult]=useState<L4CloseReadiness|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const requestRef=useRef(0);
 useEffect(()=>{
  ++requestRef.current;
  setResult(null);setBusy(false);setError('');
 },[workspaceId,executionId]);
 const refresh=()=>{
  if(!workspaceId||!executionId)return;
  const current=++requestRef.current;
  setBusy(true);setError('');setResult(null);
  void getL4CloseReadiness(workspaceId,executionId).then(data=>{
   if(current!==requestRef.current)return;
   if(data.schema_version!=='l4-readiness-v1'||data.workspace_id!==workspaceId||
      data.execution_id!==executionId||data.status!=='pending'||
      data.posting_allowed!==false||data.financially_final!==false||
      data.computed_live!==true||!Array.isArray(data.blockers)||!Array.isArray(data.sources)){
    throw new Error('Resposta do dossiê inválida ou sem garantias de segurança.');
   }
   setResult(data);
  }).catch(e=>{
   if(current===requestRef.current)setError('Não foi possível consultar o dossiê: '+(e as Error).message);
  }).finally(()=>{if(current===requestRef.current)setBusy(false);});
 };
 return <section className="panel" aria-label="Dossiê de prontidão financeira L4">
  <h4>Dossiê de prontidão financeira</h4>
  <p className="footnote">Consulta atual dos impedimentos no servidor, sem alterar custos, estoque ou produção. Não substitui a prévia de rateio nem autoriza fechamento.</p>
  <button type="button" disabled={!workspaceId||busy} onClick={refresh}>
   {busy?'Consultando impedimentos…':result?'Atualizar dossiê':'Consultar impedimentos'}
  </button>
  {error&&<p role="alert" className="error">{error}</p>}
  {result&&<div role="status" aria-label="Resultado do dossiê financeiro L4">
   <p><strong>Fechamento financeiro: PENDENTE.</strong> Lançamento bloqueado. Nenhum snapshot financeiro é publicado por esta consulta.</p>
   <p>Revisão registrada: {result.review_id?'Sim':'Não'} · Consumos confirmados: {result.consumption_rows} · Saídas confirmadas: {result.confirmed_output_groups}</p>
   <p>Origens exatas ausentes: {result.exact_origin_missing} · Custos desconhecidos: {result.cost_unknown} · Custos estimados: {result.cost_estimated} · Sem comprovante de compra: {result.cost_known_without_purchase_reference}</p>
   <p>Reservas ativas: {result.active_reservations} · Confirmações estornadas: {result.reversed_confirmations} · Categorias pendentes: {result.categories_pending}</p>
   <h5>Impedimentos identificados ({result.blockers.length})</h5>
   <ul>{result.blockers.map((reason,index)=><li key={reason+'-'+index}>{reasonLabels[reason]??('Verificar impedimento do servidor: '+reason)}</li>)}</ul>
   <small>Dados recalculados pelo servidor nesta consulta. Revisões anteriores são históricas e não comprovam a situação atual.</small>
  </div>}
 </section>;
}
