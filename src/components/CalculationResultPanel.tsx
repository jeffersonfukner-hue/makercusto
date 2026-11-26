import {MetricGrid} from './MetricGrid';
import type {ReactNode} from 'react';
import type {CostResult} from '../domain/cost';
import {CalculatorHelp} from './CalculatorHelp';
import {CalculationShare} from './CalculationShare';
import {CustomerQuote} from './CustomerQuote';
import {OrderPlanning} from './OrderPlanning';

export type ResultNumbers=Pick<CostResult,'unitCost'|'lotCost'|'salePrice'|'grossProfit'|'marginPercent'|'markupPercent'|'lotRevenue'>;
export type ResultLine=readonly [label:string,value:string];
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const percent=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
const money=(value:number)=>brl.format(value);
const pct=(value:number)=>percent.format(value)+'%';

export function resultShareLines(result:ResultNumbers,quantity:number,lines:readonly ResultLine[],composed=false):ResultLine[]{
 return [
  ['Quantidade',String(quantity)],...lines,
  ['Custo por unidade',money(result.unitCost)],['Custo total',money(result.lotCost)],
  ['Preço de venda por unidade',money(result.salePrice)],['Margem em R$/un.',money(result.salePrice-result.unitCost)],
  ['Margem bruta',pct(result.marginPercent)],['Markup',pct(result.markupPercent)],
  [composed?'Venda por conjunto':'Faturamento do lote',money(result.lotRevenue)],
  [composed?'Lucro bruto por conjunto':'Lucro bruto do lote',money(result.grossProfit)]
 ];
}

export function CalculationResultPanel({result,composed=false,quantity,lines,filamentDetails=[],title,pricing,source,sourceNotice,expanded,
 order,product,quoteKey,foot,showShare=true}:{result?:ResultNumbers;composed?:boolean;quantity:number;lines:readonly ResultLine[];
 filamentDetails?:readonly ResultLine[];title:string;pricing?:ReactNode;source?:ReactNode;sourceNotice?:ReactNode;expanded?:boolean;
 order?:Omit<Parameters<typeof OrderPlanning>[0],'piecesPerPlate'|'result'|'composed'>;
 product?:{workspaceId:string;id:string};quoteKey?:string|number;foot?:ReactNode;showShare?:boolean}){
 const overviewLines=composed?lines.filter(([label])=>label==='Filamento consumido'):[];
 const breakdownLines=lines.filter(line=>!overviewLines.includes(line));
 return <section className="panel result-panel mc-shared-result" aria-labelledby="calculation-result">
  <div className="mc-result-heading">
   <h2 id="calculation-result">{composed?'Resultado do conjunto':'Resultado do cálculo'}</h2>
   <CalculatorHelp label="Indicadores do resultado">Margem por unidade é o preço de venda menos o custo unitário. Margem bruta é essa diferença em relação ao preço. Markup é essa diferença em relação ao custo.</CalculatorHelp>
  </div>
  {source}
  <div className="hero-amount" aria-live="polite">
   <span>{composed?'Custo estimado por conjunto':'Custo estimado por unidade'}</span>
   <strong data-testid="unitCost">{result?money(result.unitCost):'—'}</strong>
   {result&&!composed&&<small>Total do lote: {money(result.lotCost)}</small>}
   {sourceNotice&&<small>{sourceNotice}</small>}
  </div>
  {overviewLines.length>0&&<dl className="cost-list">{overviewLines.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
  {pricing}
  {result&&<>
   <MetricGrid className="mc-result-metrics" metrics={[
    {label:'Margem em R$/un.',value:money(result.salePrice-result.unitCost),testId:'unitProfit',className:result.grossProfit<0?'negative':'positive'},
    {label:'Margem bruta',value:pct(result.marginPercent),testId:'margin',className:result.marginPercent<0?'negative':undefined},
    {label:'Markup',value:pct(result.markupPercent),className:result.markupPercent<0?'negative':undefined},
   ]}/>
   <details className="breakdown" open={expanded}>
    <summary>{composed?'Composição dos custos e filamentos':'Composição dos custos'}</summary>
    <div className="breakdown-inner">
     <dl className="cost-list">{[...breakdownLines,...filamentDetails].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
     <div className="summary">
      <div><span>{composed?'Venda por conjunto':'Faturamento do lote'}</span><strong>{money(result.lotRevenue)}</strong></div>
      <div><span>{composed?'Lucro bruto por conjunto':'Lucro bruto do lote'}</span><strong data-testid="grossProfit" className={result.grossProfit<0?'negative':'positive'}>{money(result.grossProfit)}</strong></div>
     </div>
     <div className="mc-result-help"><CalculatorHelp label="Escopo dos custos">Estimativa sem embalagem, frete, taxas de marketplace, tributos e despesas administrativas. O lucro exibido é bruto.</CalculatorHelp></div>
    </div>
   </details>
   {order&&<OrderPlanning {...order} piecesPerPlate={quantity} result={result} composed={composed}/>}
   {showShare&&<>
    <CalculationShare title={title||'Resultado do cálculo'} lines={resultShareLines(result,quantity,lines,composed)}/>
    <CustomerQuote key={quoteKey} name={title||undefined} quantity={quantity} salePrice={result.salePrice} product={product}/>
   </>}
   {foot}
  </>}
 </section>;
}
