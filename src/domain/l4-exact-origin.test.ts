import {describe,expect,it} from 'vitest';
import {calculateExactOriginCategories} from './l4-exact-origin';
import {multiplyDivide,parseExactDecimal,roundPositiveCentsHalfUp} from './decimal-exact';

describe('L4 — P06 custo de origem com razão exata, sem fechamento financeiro',()=>{
 it('preserva preço periódico 1/3 e arredonda só no fechamento',()=>{
  const a=calculateExactOriginCategories({
   consumption_id:'c1',lot_id:'l1',status:'known',
   original_total_cost_brl:'1.00',original_quantity_g:'3.000',
   model_g:'1.000',purge_g:'1.000',loss_g:'0'
  });
  expect(a.categories.map(x=>[x.numerator,x.denominator,x.closedCents]))
   .toEqual([['1','3','33'],['1','3','33'],['0','1','0']]);
  expect(a.status).toBe('known');
 });
 it('preserva precisão inferior a um centavo e não arredonda por grama',()=>{
  const a=calculateExactOriginCategories({
   consumption_id:'c2',lot_id:'l2',status:'known',
   original_total_cost_brl:'68.00',original_quantity_g:'1000',
   model_g:'0.35',purge_g:'0',loss_g:'0'
  });
  expect(a.categories[0]).toMatchObject({numerator:'119',denominator:'5000',closedCents:'2'});
  const total=multiplyDivide(parseExactDecimal('68'),parseExactDecimal('35'),parseExactDecimal('1000'));
  expect(roundPositiveCentsHalfUp(total)).toBe(238n);
 });
 it('mantém desconhecido null e estimativa com status próprio',()=>{
  const x={consumption_id:'c3',lot_id:'l3',original_quantity_g:'1000',
   model_g:'1',purge_g:'0',loss_g:'0'};
  const missing=calculateExactOriginCategories({...x,status:'unknown',original_total_cost_brl:null});
  expect(missing.categories[0].closedCents).toBeNull();
  const estimated=calculateExactOriginCategories({...x,status:'estimated',original_total_cost_brl:'70'});
  expect(estimated.categories[0].closedCents).toBe('7');
  expect(estimated.status).toBe('estimated');
  expect(()=>calculateExactOriginCategories({...x,status:'unknown',original_total_cost_brl:'0'})).toThrow(/desconhecido/);
 });
 it('rejeita zero como quantidade original e valores decimais inválidos',()=>{
  const origin={consumption_id:'x',lot_id:'l',status:'known' as const,
   original_total_cost_brl:'1',original_quantity_g:'0',model_g:'1',purge_g:'0',loss_g:'0'};
  expect(()=>calculateExactOriginCategories(origin)).toThrow(/Quantidade original/);
  expect(()=>calculateExactOriginCategories({...origin,original_quantity_g:'2',model_g:'NaN'})).toThrow(/decimal/);
 });
});
