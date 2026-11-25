import {calculateOrderPlan,type OrderPlanInput} from '../domain/order-plan';
import type {CostResult} from '../domain/cost';

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const percent=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
const numberOrUndefined=(value:string)=>value===''?undefined:Number(value);
const pieceLabel=(count:number)=>count+(count===1?' peça':' peças');
const plateLabel=(count:number)=>count+(count===1?' mesa':' mesas');

export function OrderPlanning({piecesPerPlate,result,input,onChange}:{
 piecesPerPlate:number;result:CostResult;input:OrderPlanInput;onChange:(next:OrderPlanInput)=>void
}){
 const {quantity,partialPlateCost}=input;
 let plan:ReturnType<typeof calculateOrderPlan>|undefined;
 let error='';
 if(quantity!==undefined){
  try{plan=calculateOrderPlan(piecesPerPlate,result.lotCost,result.salePrice,quantity,partialPlateCost);}
  catch(cause){error=(cause as Error).message;}
 }
 const partialPieces=quantity===undefined?0:quantity%piecesPerPlate;
 return <details className="mc-calculation-share mc-order-plan" open={quantity!==undefined?true:undefined}>
  <summary>Planejamento do pedido</summary>
  <p>A mesa calculada produz {pieceLabel(piecesPerPlate)} por impressão.</p>
  <label>Quantidade do pedido (peças)
   <input type="number" min="1" step="1" value={quantity??''}
    onChange={event=>{
     const nextQuantity=numberOrUndefined(event.target.value);
     onChange({quantity:nextQuantity,
      partialPlateCost:nextQuantity!==undefined&&nextQuantity%piecesPerPlate===partialPieces?partialPlateCost:undefined});
    }}/>
  </label>
  {Number.isSafeInteger(quantity)&&partialPieces>0&&<label>Custo da última mesa (R$, opcional)
   <input type="number" min="0" step="0.01" value={partialPlateCost??''}
    onChange={event=>onChange({...input,partialPlateCost:numberOrUndefined(event.target.value)})}/>
   <small>Se deixar em branco, rateamos o custo da mesa cheia pela quantidade de peças. Se fatiar a última mesa separadamente, informe o custo calculado para ela.</small>
  </label>}
  {error&&<p role="alert" className="error">{error}</p>}
  {plan&&<>
   <p role="status">{plateLabel(plan.totalPlates)} no total · {plan.fullPlates} {plan.fullPlates===1?'completa':'completas'}{plan.partialPieces>0&&' + última mesa com '+pieceLabel(plan.partialPieces)}.</p>
   <dl className="cost-list">
    {plan.partialPieces>0&&<div><dt>{partialPlateCost===undefined?'Última mesa (rateio estimado)':'Última mesa (valor informado)'}</dt><dd>{money.format(plan.lastPlateCost)}</dd></div>}
    <div><dt>Custo do pedido</dt><dd>{money.format(plan.totalCost)}</dd></div>
    <div><dt>Faturamento do pedido</dt><dd>{money.format(plan.revenue)}</dd></div>
    <div><dt>Lucro bruto do pedido</dt><dd>{money.format(plan.grossProfit)}</dd></div>
    <div><dt>Margem bruta do pedido</dt><dd>{percent.format(plan.marginPercent)}%</dd></div>
   </dl>
  </>}
 </details>;
}
