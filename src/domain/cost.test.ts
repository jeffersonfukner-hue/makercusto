import { describe, it, expect } from 'vitest';
import { calculateCost, referenceCase } from './cost';

describe('motor de custos e materiais', () => {
  it('calcula o cenário piloto real por lote de 20 e três cores', () => {
    const r = calculateCost(referenceCase);
    expect(r.modelGrams).toBeCloseTo(151.58, 2);
    expect(r.materialBreakdown).toHaveLength(3);
    expect(r.material).toBeCloseTo(15.158, 3);
    expect(r.energy).toBeCloseTo(1.7357, 3);
    expect(r.lotCost).toBeCloseTo(50.336, 1);
    expect(r.unitCost).toBeCloseTo(2.517, 2);
    expect(r.grossProfit).toBeCloseTo(107.664, 1);
  });
  it('permite preço diferente para cada material', () => {
    const materials = referenceCase.materials!.map(item => ({ ...item }));
    materials[2].pricePerKg = 200;
    const r = calculateCost({ ...referenceCase, materials });
    expect(r.material).toBeCloseTo(17.214, 3);
    expect(r.materialBreakdown[2].cost).toBeCloseTo(4.112, 3);
  });
  it('contabiliza a purga uma única vez na cor correspondente', () => {
    const materials = referenceCase.materials!.map(item => ({ ...item }));
    materials[0].wasteGrams = 10;
    const r = calculateCost({ ...referenceCase, materials });
    expect(r.modelGrams).toBeCloseTo(151.58, 2);
    expect(r.wasteGrams).toBe(10);
    expect(r.material).toBeCloseTo(16.158, 3);
    expect(r.lotCost - calculateCost(referenceCase).lotCost).toBeCloseTo(1, 5);
  });
  it('não soma o filamento legado com os materiais detalhados', () => {
    const r = calculateCost({ ...referenceCase, grams: 90000, pricePerKg: 90000 });
    expect(r.material).toBeCloseTo(15.158, 3);
  });
  it('mantém compatibilidade com cálculo de um único filamento', () => {
    const r = calculateCost({ ...referenceCase, materials: undefined });
    expect(r.material).toBeCloseTo(15.158, 3);
    expect(r.materialBreakdown[0].name).toBe('Filamento');
  });
  it('separa margem de markup', () => {
    const r = calculateCost({ ...referenceCase, salePrice: 10 });
    expect(r.marginPercent).toBeCloseTo((10 - r.unitCost) / 10 * 100, 6);
    expect(r.markupPercent).toBeCloseTo((10 - r.unitCost) / r.unitCost * 100, 6);
  });
  it('rateia custos de impressão e multiplica acessórios por unidades', () => {
    const a = calculateCost(referenceCase);
    const b = calculateCost({ ...referenceCase, quantity: 10 });
    expect(a.material).toBe(b.material);
    expect(a.depreciation).toBe(b.depreciation);
    expect(a.accessories).toBe(2 * b.accessories);
  });
  it('rejeita quantidade e custo inválidos', () => {
    expect(() => calculateCost({ ...referenceCase, quantity: 0 })).toThrow();
    expect(() => calculateCost({ ...referenceCase, averageWatts: -1 })).toThrow();
    expect(() => calculateCost({ ...referenceCase, lifetimeHours: 0 })).toThrow();
    expect(() => calculateCost({ ...referenceCase, materials: [] })).toThrow();
    expect(() => calculateCost({ ...referenceCase, materials: [{ id: 'x', name: 'Azul', grams: NaN, wasteGrams: 0, pricePerKg: 100 }] })).toThrow();
  });
  it('permite venda abaixo do custo', () => {
    expect(calculateCost({ ...referenceCase, salePrice: 1 }).grossProfit).toBeLessThan(0);
  });
});
