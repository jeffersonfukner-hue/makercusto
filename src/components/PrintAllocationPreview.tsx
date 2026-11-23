import {useRef,useState} from 'react';
import type {PrintRecord} from '../data/supabase';
import {reconcilePrintAllocation,type AllocationLine,type AllocationCategory,type AllocationSnapshot} from '../domain/print-allocation';
import {FormActionDock} from './FormActionDock';

type Props={prints:PrintRecord[];active:boolean;onActivate:()=>void};
type OutputOption={id:string;name:string;outcome:'good'|'rejected';quantity:number};
const formatCents=(cents:string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(BigInt(cents))/100);
const categories: {id:AllocationCategory;label:string}[]=[
 {id:'model',label:'Filamento do modelo'},{id:'purge',label:'Purga separada'},
 {id:'energy',label:'Energia'},{id:'machine',label:'Máquina'},
 {id:'labor',label:'Mão de obra'},{id:'accessory',label:'Acessórios'},
 {id:'loss',label:'Perda separada'},{id:'rework',label:'Retrabalho'},
 {id:'other',label:'Outro custo'}
];

/** Apenas estudo local de distribuição: nunca salva custo, snapshot ou estoque. */
export function PrintAllocationPreview({prints,active,onActivate}:Props){
 const [printId,setPrintId]=useState('');
 const [category,setCategory]=useState<AllocationCategory>('model');
 const [method,setMethod]=useState<'direct'|'shared'>('direct');
 const [amount,setAmount]=useState('');
 const [source,setSource]=useState('');
 const [rationale,setRationale]=useState('');
 const [separate,setSeparate]=useState(false);
 const [basis,setBasis]=useState<Record<string,string>>({});
 const [lines,setLines]=useState<AllocationLine[]>([]);
 const sequence=useRef(0);
 const [preview,setPreview]=useState<AllocationSnapshot|null>(null);
 const [error,setError]=useState('');
 const print=prints.find(x=>x.id===printId);
 const destinations:OutputOption[]=print?.outputs.flatMap(o=>[
  ...(Number(o.good)>0?[{id:o.id+':good',name:o.name+' — boas',quantity:Number(o.good),outcome:'good' as const}]:[]),
  ...(Number(o.failed)>0?[{id:o.id+':rejected',name:o.name+' — rejeitadas',quantity:Number(o.failed),outcome:'rejected' as const}]:[])
 ])??[];
 const changePrint=(id:string)=>{
  setPrintId(id);setLines([]);setPreview(null);setError('');setBasis({});
 };
 const addLine=()=>{
  setError('');setPreview(null);
  if(!print||!destinations.length){setError('Selecione uma impressão com peças confirmadas.');return;}
  const selected=destinations.filter(o=>basis[o.id]&&basis[o.id].trim()!==''&&basis[o.id].trim()!=='0')
   .map(o=>({outputId:o.id,basis:basis[o.id]}));
  const next:AllocationLine={id:'categoria-'+(++sequence.current),category,amountBrl:amount,source,
   sourceVersion:'entrada-local-1',method,rationale,
   separatelyMeasured:category!=='purge'&&category!=='loss'?false:separate,destinations:selected};
  try{
   reconcilePrintAllocation({executionId:print.id,outputs:destinations,lines:[next]});
   setLines(v=>[...v,next]);setAmount('');setSource('');setRationale('');setSeparate(false);setBasis({});
  }catch(e){setError((e as Error).message);}
 };
 const reconcile=()=>{
  setError('');setPreview(null);
  if(!print||!destinations.length||!lines.length){setError('Selecione uma impressão com saídas confirmadas e inclua categorias de custo.');return;}
  try{setPreview(reconcilePrintAllocation({executionId:print.id,outputs:destinations,lines}));}
  catch(e){setError((e as Error).message);}
 };
 return <section className="panel materials-form" aria-label="Prévia L4 de rateio" onFocusCapture={onActivate} onClickCapture={onActivate}>
  <h3>Prévia de rateio L4 — mesa compartilhada</h3>
  <p className="footnote"><strong>SIMULAÇÃO NÃO SALVA.</strong> Os valores são informados manualmente, não representam preços reais automaticamente recuperados das bobinas. Nenhuma baixa, lançamento financeiro, snapshot ou encerramento é realizado. Custos desconhecidos e categorias ausentes permanecem pendentes.</p>
  <div className="product-save-fields">
   <label>Impressão registrada<select aria-label="Impressão para prévia de rateio" value={printId} onChange={e=>{onActivate();changePrint(e.target.value);}}>
    <option value="">Selecione</option>{prints.map(p=><option key={p.id} value={p.id}>{p.outputs.map(o=>o.name).join(' + ')} — {p.status}</option>)}
   </select><small>Somente saídas com quantidades já confirmadas aparecem como destinos.</small></label>
  </div>
  {print&&<div>
   {destinations.length===0?<p>Nenhuma peça boa ou rejeitada foi confirmada nesta impressão; não há destinos conciliáveis.</p>:<>
    <h4>Adicionar uma categoria de custo explícita</h4>
    <div className="product-save-fields">
     <label>Categoria<select aria-label="Categoria de custo L4" value={category} onChange={e=>{setCategory(e.target.value as AllocationCategory);setPreview(null);}}>
      {categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
     <label>Custo total da categoria (R$)<input aria-label="Valor da categoria L4" placeholder="Ex.: 1.235" value={amount} onChange={e=>setAmount(e.target.value)} />
      <small>Use ponto decimal; a categoria é fechada em centavos apenas uma vez.</small></label>
     <label>Fonte do custo<input aria-label="Fonte do custo L4" value={source} onChange={e=>setSource(e.target.value)} placeholder="Ex.: lote e pesagem, tarifa e medidor" />
      <small>Não presuma preço da bobina ou energia. Informe a origem real ou estimada.</small></label>
     <label>Critério<select aria-label="Método de rateio L4" value={method} onChange={e=>setMethod(e.target.value as 'direct'|'shared')}>
      <option value="direct">Atribuição direta (um destino)</option><option value="shared">Compartilhado (base explícita)</option>
     </select></label>
     <label>Justificativa e unidade da base<input aria-label="Justificativa do rateio L4" value={rationale} onChange={e=>setRationale(e.target.value)} placeholder="Ex.: massa medida em gramas ou tempo atribuível" />
      <small>Na distribuição compartilhada, explique a base e se é medição ou estimativa.</small></label>
    </div>
    {(category==='purge'||category==='loss')&&<label><input type="checkbox" checked={separate} onChange={e=>setSeparate(e.target.checked)} />
     Esta purga/perda foi medida separadamente e NÃO está incluída no custo do modelo.</label>}
    <div className="materials-spool-grid">{destinations.map(o=><label key={o.id}>
     {o.name} ({o.quantity})
     <input aria-label={'Base de rateio '+o.name} value={basis[o.id]??''}
      placeholder={method==='direct'?'1 para atribuir aqui':'Peso proporcional positivo'}
      onChange={e=>setBasis(v=>({...v,[o.id]:e.target.value}))}/>
    </label>)}</div>
    <p className="footnote">Direto: preencha somente um destino com base 1. Compartilhado: preencha pelo menos dois destinos com pesos positivos. Não envie custo de peças rejeitadas automaticamente às boas.</p>
    <button type="button" onClick={addLine}>+ Incluir categoria na prévia</button>
    <h4>Categorias informadas ({lines.length})</h4>
    {lines.length===0?<p>Nenhuma categoria informada. Não é possível conciliar a mesa sem custos de origem.</p>:<ul>
     {lines.map(l=><li key={l.id}>{categories.find(c=>c.id===l.category)?.label}: R$ {l.amountBrl} — {l.method==='direct'?'direto':'compartilhado'} — {l.source}
      <button type="button" aria-label={'Remover categoria '+l.id} onClick={()=>{setLines(v=>v.filter(x=>x.id!==l.id));setPreview(null);}}>Remover</button>
     </li>)}
    </ul>}
   </>}
  </div>}
  {error&&<p role="alert" className="error">{error}</p>}
  {preview&&<div className="panel" role="status" aria-label="Resultado da prévia de rateio">
   <h4>Prévia conciliada das categorias informadas: {formatCents(preview.totalCents)}</h4>
   <p>Esta conciliação vale apenas para as categorias fornecidas. Não confirma custo final de produção.</p>
   <ul>{preview.outputTotals.map(o=><li key={o.outputId}>{destinations.find(d=>d.id===o.outputId)?.name}: {formatCents(o.totalCents)}</li>)}</ul>
   <small>P05/P06: half-up por categoria, maiores restos e desempate por ID. Sem gravação no banco.</small>
  </div>}
  {active&&<FormActionDock title="Prévia L4" subtitle="Cálculo local, não registra custo nem movimenta estoque">
   <button type="button" className="primary-action" disabled={!print||!destinations.length||!lines.length} onClick={reconcile}>Calcular prévia de rateio</button>
  </FormActionDock>}
 </section>;
}
