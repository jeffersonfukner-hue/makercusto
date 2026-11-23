import {multiplyDivide,parseExactDecimal,roundPositiveCentsHalfUp} from './decimal-exact';

/** Origem L4 congelada no momento da confirmação, não preço unitário posterior. */
export type ExactOrigin={
 consumption_id:string;lot_id:string;
 status:'known'|'estimated'|'unknown';
 original_total_cost_brl:string|null;original_quantity_g:string;
 model_g:string;purge_g:string;loss_g:string;
};
export type ExactOriginResult={
 consumptionId:string;lotId:string;status:ExactOrigin['status'];
 categories: {category:'model'|'purge'|'loss';grams:string;
  numerator:string|null;denominator:string|null;closedCents:string|null}[];
};
/** O resultado é indicativo enquanto não ocorrer fechamento auditado completo. */
export function calculateExactOriginCategories(origin:ExactOrigin):ExactOriginResult{
 if(!origin.consumption_id||!origin.lot_id)throw new Error('Origem sem referência auditável.');
 const basis=parseExactDecimal(origin.original_quantity_g);
 if(basis.numerator<=0n)throw new Error('Quantidade original do lote inválida.');
 const amount=origin.original_total_cost_brl===null?null:parseExactDecimal(origin.original_total_cost_brl);
 if((origin.status==='unknown')!==(amount===null)){
  throw new Error('Custo desconhecido não deve virar valor zero ou preço estimado.');
 }
 const categories=([
  ['model',origin.model_g],['purge',origin.purge_g],['loss',origin.loss_g]
 ] as const).map(([category,grams])=>{
  const quantity=parseExactDecimal(grams);
  const ratio=amount===null?null:multiplyDivide(amount,quantity,basis);
  return {category,grams,
   numerator:ratio?.numerator.toString()??null,
   denominator:ratio?.denominator.toString()??null,
   closedCents:ratio===null?null:roundPositiveCentsHalfUp(ratio).toString()};
 });
 return {consumptionId:origin.consumption_id,lotId:origin.lot_id,
  status:origin.status,categories};
}
