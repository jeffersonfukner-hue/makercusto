import {multiplyDivide,parseExactDecimal,reduceRational,roundPositiveCentsHalfUp,type Rational} from './decimal-exact';
import type {AllocationOutput} from './print-allocation';
import type {ExactOrigin} from './l4-exact-origin';

/**
 * L4-G04: rascunho reconciliado POR CATEGORIA a partir da razão monetária
 * original P06. Não é snapshot financeiro final e nunca realiza escrita.
 * Mesma categoria pode conter vários lotes/consumos; fecha uma única vez.
 */
export type MaterialCategory='model'|'purge'|'loss';
export type DestinationBasis={outputId:string;weight:string};
export type SourceAssignment={
 consumptionId:string;category:MaterialCategory;
 method:'direct'|'shared';destinations:DestinationBasis[];rationale:string;
};
export type ReconciliationProblem={
 code:'UNKNOWN_COST'|'ESTIMATED_COST'|'MISSING_ASSIGNMENT'|'MISSING_PURCHASE_EVIDENCE';
 sourceId:string;category?:MaterialCategory;
};
export type CategoryAllocation={
 category:MaterialCategory; exactNumerator:string;exactDenominator:string;
 closedCents:string;destinations:{outputId:string;cents:string;residualCent:boolean}[];
 sources:{consumptionId:string;lotId:string;exactNumerator:string;exactDenominator:string}[];
};
export type MaterialReconciliationDraft={
 schemaVersion:'l4-material-category-v1';status:'pending_financial_close';
 executionId:string;currency:'BRL';financialSnapshot:null;
 coveredAssignments:number;expectedAssignments:number;issues:ReconciliationProblem[];
 categories:CategoryAllocation[];outputTotals:{outputId:string;cents:string}[];
 totalCents:string|null;
};
const zero:Rational={numerator:0n,denominator:1n};
const add=(a:Rational,b:Rational)=>reduceRational({
 numerator:a.numerator*b.denominator+b.numerator*a.denominator,
 denominator:a.denominator*b.denominator
});
const multiply=(a:Rational,b:Rational)=>reduceRational({
 numerator:a.numerator*b.numerator,denominator:a.denominator*b.denominator
});
const divide=(a:Rational,b:Rational)=>{
 if(b.numerator<=0n)throw new Error('Base compartilhada vazia.');
 return reduceRational({numerator:a.numerator*b.denominator,denominator:a.denominator*b.numerator});
};
const idsUnique=(ids:string[],label:string)=>{
 if(ids.some(x=>!x||x.trim()!==x)||new Set(ids).size!==ids.length)
  throw new Error(label+': identificadores inválidos ou repetidos.');
};
const key=(id:string,category:MaterialCategory)=>id+':'+category;
const categories=['model','purge','loss'] as const;

/**
 * Linhas com massa positiva precisam de atribuição explícita. Valores de
 * fonte desconhecida não são somados como zero. Sem todas as fontes,
 * o valor financeiro total permanece null (e não um custo final fictício).
 */
export function reconcileExactMaterialCategories(input:{
 executionId:string;outputs:AllocationOutput[];
 origins:(ExactOrigin&{purchase_line_id?:string|null})[];
 assignments:SourceAssignment[];
}):MaterialReconciliationDraft{
 if(!input.executionId.trim()||!input.outputs.length)throw new Error('Execução e saídas obrigatórias.');
 idsUnique(input.outputs.map(x=>x.id),'Saídas');
 if(input.outputs.some(x=>!x.name.trim()||!Number.isSafeInteger(x.quantity)||x.quantity<=0||
  !['good','rejected','rework'].includes(x.outcome)))throw new Error('Saída inválida.');
 idsUnique(input.origins.map(x=>x.consumption_id),'Consumos');
 idsUnique(input.assignments.map(x=>key(x.consumptionId,x.category)),'Atribuições');
 const outputMap=new Map(input.outputs.map(x=>[x.id,x]));
 const assignmentMap=new Map(input.assignments.map(x=>[key(x.consumptionId,x.category),x]));
 const expected=new Set<string>(),issues:ReconciliationProblem[]=[];
 const accum=new Map<MaterialCategory,{
  total:Rational;destinations:Map<string,Rational>;
  sources:CategoryAllocation['sources'];
 }>();
 let unknown=false;
 for(const origin of input.origins){
  if(!origin.lot_id)throw new Error('Consumo sem identificação de lote.');
  const base=parseExactDecimal(origin.original_quantity_g);
  if(base.numerator<=0n)throw new Error('Quantidade original inválida.');
  const amount=origin.original_total_cost_brl===null?null:parseExactDecimal(origin.original_total_cost_brl);
  if((amount===null)!==(origin.status==='unknown'))throw new Error('Status e custo de origem inconsistentes.');
  for(const category of categories){
   const mass=parseExactDecimal(category==='model'?origin.model_g:category==='purge'?origin.purge_g:origin.loss_g);
   if(mass.numerator===0n)continue;
   const sourceId=key(origin.consumption_id,category);
   expected.add(sourceId);
   const assignment=assignmentMap.get(sourceId);
   if(!assignment){
    issues.push({code:'MISSING_ASSIGNMENT',sourceId,category});
   }
   if(amount===null){
    unknown=true;issues.push({code:'UNKNOWN_COST',sourceId,category});
   }else if(origin.status==='estimated'){
    issues.push({code:'ESTIMATED_COST',sourceId,category});
   }else if(!origin.purchase_line_id){
    issues.push({code:'MISSING_PURCHASE_EVIDENCE',sourceId,category});
   }
   if(!assignment||amount===null)continue;
   if(assignment.method!=='direct'&&assignment.method!=='shared')throw new Error('Método de rateio inválido.');
   if(!assignment.destinations.length||(
    assignment.method==='direct'&&assignment.destinations.length!==1
   )||(assignment.method==='shared'&&assignment.destinations.length<2))
    throw new Error('Quantidade de destinos incompatível com o método.');
   idsUnique(assignment.destinations.map(d=>d.outputId),'Destinos');
   if(assignment.method==='shared'&&!assignment.rationale.trim())throw new Error('Base compartilhada sem justificativa.');
   if(assignment.destinations.some(d=>!outputMap.has(d.outputId)))throw new Error('Destino fora da execução.');
   if(category==='loss'&&assignment.destinations.some(d=>outputMap.get(d.outputId)?.outcome==='good'))
    throw new Error('Perda não pode ser atribuída automaticamente a peças boas.');
   const weights=assignment.destinations.map(d=>parseExactDecimal(d.weight));
   if(weights.some(w=>w.numerator<=0n))throw new Error('Base de rateio deve ser positiva.');
   const sum=weights.reduce(add,zero);
   const exact=multiplyDivide(amount,mass,base);
   const current=accum.get(category)??{total:zero,destinations:new Map<string,Rational>(),sources:[]};
   current.total=add(current.total,exact);
   current.sources.push({consumptionId:origin.consumption_id,lotId:origin.lot_id,
    exactNumerator:exact.numerator.toString(),exactDenominator:exact.denominator.toString()});
   assignment.destinations.forEach((d,i)=>{
    const part=multiply(exact,divide(weights[i],sum));
    current.destinations.set(d.outputId,add(current.destinations.get(d.outputId)??zero,part));
   });
   accum.set(category,current);
  }
 }
 for(const assignment of input.assignments){
  if(!expected.has(key(assignment.consumptionId,assignment.category)))
   throw new Error('Atribuição não corresponde a massa confirmada.');
 }
 const covered=[...expected].filter(k=>assignmentMap.has(k)).length;
 const outputTotals=new Map(input.outputs.map(o=>[o.id,0n]));
 const result:CategoryAllocation[]=[];
 let total=0n;
 for(const category of categories){
  const current=accum.get(category);if(!current)continue;
  const cents=roundPositiveCentsHalfUp(current.total);
  const bases=[...current.destinations].map(([id,amount])=>({id,amount}));
  const sum=bases.reduce((s,d)=>add(s,d.amount),zero);
  if(sum.numerator!==current.total.numerator||sum.denominator!==current.total.denominator)
   throw new Error('Falha de conservação racional dos custos.');
  const quotas=bases.map(d=>{
   const fraction=current.total.numerator===0n?zero:divide(d.amount,current.total);
   const q=multiply(fraction,{numerator:cents,denominator:1n});
   const floor=q.numerator/q.denominator;
   return {id:d.id,floor,remainder:q.numerator%q.denominator,denominator:q.denominator};
  });
  let remaining=cents-quotas.reduce((s,q)=>s+q.floor,0n);
  const order=quotas.map((q,i)=>({i,id:q.id,rem:q.remainder,den:q.denominator})).sort((a,b)=>{
   const left=a.rem*b.den,right=b.rem*a.den;
   if(left===right)return a.id<b.id?-1:a.id>b.id?1:0;
   return left>right?-1:1;
  });
  const extra=new Set<number>();
  for(const q of order){if(remaining<=0n)break;extra.add(q.i);remaining--;}
  if(remaining!==0n)throw new Error('Centavos residuais não conciliados.');
  const destinations=quotas.map((q,i)=>{
   const value=q.floor+(extra.has(i)?1n:0n);
   outputTotals.set(q.id,(outputTotals.get(q.id)??0n)+value);
   return {outputId:q.id,cents:value.toString(),residualCent:extra.has(i)};
  });
  if(destinations.reduce((n,d)=>n+BigInt(d.cents),0n)!==cents)throw new Error('Categoria não conciliada.');
  result.push({category,exactNumerator:current.total.numerator.toString(),
   exactDenominator:current.total.denominator.toString(),closedCents:cents.toString(),
   destinations,sources:current.sources});
  total+=cents;
 }
 if([...outputTotals.values()].reduce((a,b)=>a+b,0n)!==total)throw new Error('Execução não conciliada.');
 return {schemaVersion:'l4-material-category-v1',status:'pending_financial_close',
  executionId:input.executionId,currency:'BRL',financialSnapshot:null,
  coveredAssignments:covered,expectedAssignments:expected.size,issues,categories:result,
  outputTotals:[...outputTotals].map(([outputId,cents])=>({outputId,cents:cents.toString()})),
  totalCents:unknown||covered!==expected.size?null:total.toString()};
}
