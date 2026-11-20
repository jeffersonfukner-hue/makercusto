import {describe,it,expect} from 'vitest';
import {calculateCost,referenceCase} from './cost';
describe('motor de custos',()=>{
 it('calcula o caso piloto por lote de 20',()=>{const r=calculateCost(referenceCase);expect(r.material).toBeCloseTo(15.158,3);expect(r.energy).toBeCloseTo(1.7357,3);expect(r.lotCost).toBeCloseTo(50.336,1);expect(r.unitCost).toBeCloseTo(2.517,2);expect(r.grossProfit).toBeCloseTo(107.664,1);});
 it('separa margem de markup',()=>{const r=calculateCost({...referenceCase,salePrice:10});expect(r.marginPercent).toBeCloseTo((10-r.unitCost)/10*100,6);expect(r.markupPercent).toBeCloseTo((10-r.unitCost)/r.unitCost*100,6);});
 it('não perde custo fixo ao alterar tamanho do lote',()=>{const a=calculateCost(referenceCase),b=calculateCost({...referenceCase,quantity:10});expect(a.material).toBe(b.material);expect(a.depreciation).toBe(b.depreciation);expect(a.accessories).toBe(2*b.accessories);});
 it('valida entradas inválidas',()=>{expect(()=>calculateCost({...referenceCase,quantity:0})).toThrow();expect(()=>calculateCost({...referenceCase,grams:-1})).toThrow();expect(()=>calculateCost({...referenceCase,lifetimeHours:0})).toThrow();});
 it('permite venda abaixo do custo',()=>{expect(calculateCost({...referenceCase,salePrice:1}).grossProfit).toBeLessThan(0);});
});
