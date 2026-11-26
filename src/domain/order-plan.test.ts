import {describe,expect,it} from 'vitest';
import {calculateOrderPlan} from './order-plan';

describe('planejamento de pedido',()=>{
 it('rateia a mesa parcial e aceita o custo calculado para ela',()=>{
  expect(calculateOrderPlan(2,10,8,15)).toMatchObject({fullPlates:7,partialPieces:1,totalPlates:8,lastPlateCost:5,totalCost:75,revenue:120,grossProfit:45,marginPercent:37.5});
  expect(calculateOrderPlan(3,12,8,14,10)).toMatchObject({fullPlates:4,partialPieces:2,totalPlates:5,lastPlateCost:10,totalCost:58});
 });
 it('trata mesas unitárias, lotes exatos e pedidos menores que uma mesa',()=>{
  expect(calculateOrderPlan(1,10,12,2)).toMatchObject({fullPlates:2,partialPieces:0,totalCost:20});
  expect(calculateOrderPlan(3,12,8,12,90)).toMatchObject({fullPlates:4,partialPieces:0,totalCost:48});
  expect(calculateOrderPlan(12,24,8,2)).toMatchObject({fullPlates:0,partialPieces:2,totalPlates:1,totalCost:4});
  expect(() => calculateOrderPlan(3,12,8,0)).toThrow();
 });
});
