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
  it('concilia o resumo do fatiador e substitui o descarte estimado pelo pesado por cor', () => {
    const red = { id: 'red', name: 'Vermelho', grams: 1.31, wasteGrams: -0.08, pricePerKg: 100 };
    const white = { id: 'white', name: 'Branco', grams: 0.26, wasteGrams: 0.63, towerGrams: 0.51, pricePerKg: 100 };
    const estimated = calculateCost({ ...referenceCase, materials: [red, white] });
    expect(estimated.materialBreakdown[0].totalGrams).toBeCloseTo(1.23);
    expect(estimated.materialBreakdown[1].totalGrams).toBeCloseTo(1.40);
    expect(estimated.material).toBeCloseTo(0.263);
    const measured = calculateCost({ ...referenceCase, materials: [{ ...red, measuredWasteGrams: 0.19 }, white] });
    expect(measured.material).toBeCloseTo(0.29);
    const zeroWaste = calculateCost({ ...referenceCase, materials: [red, { ...white, measuredWasteGrams: 0 }] });
    expect(zeroWaste.materialBreakdown[1].totalGrams).toBeCloseTo(0.26);
    expect(() => calculateCost({ ...referenceCase, materials: [{ ...red, wasteGrams: -2 }] })).toThrow();
  });
  it('define o preço por margem bruta e arredonda para cima em centavos', () => {
    const input = { ...referenceCase, targetMarginPercent: 50 };
    const result = calculateCost(input);
    expect(result.salePrice).toBe(5.04);
    expect(result.marginPercent).toBeGreaterThanOrEqual(50);
    expect(result.lotRevenue).toBeCloseTo(100.80);
    const thirty = calculateCost({ ...input, targetMarginPercent: 30 });
    expect(thirty.salePrice).toBe(3.60);
    expect(thirty.marginPercent).toBeGreaterThanOrEqual(30);
    expect(() => calculateCost({ ...input, targetMarginPercent: 100 })).toThrow(/margem desejada/);
    expect(calculateCost(referenceCase).salePrice).toBe(7.9);
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
  it('calcula custo proporcional com embalagens de 250g e 1,3kg', () => {
    const materials = [
      { id: 'one', name: 'Azul', grams: 50, wasteGrams: 0, pricePerKg: 0, packageQuantity: 250, packageUnit: 'g' as const, packagePrice: 25 },
      { id: 'two', name: 'Branco', grams: 130, wasteGrams: 0, pricePerKg: 0, packageQuantity: 1.3, packageUnit: 'kg' as const, packagePrice: 130 }
    ];
    const result = calculateCost({ ...referenceCase, materials });
    expect(result.material).toBeCloseTo(18, 6);
    expect(result.materialBreakdown[0].pricePerKg).toBeCloseTo(100, 6);
    expect(result.materialBreakdown[1].pricePerKg).toBeCloseTo(100, 6);
  });
  it('rejeita preço e peso de embalagem inválidos', () => {
    const m = { id: 'x', name: 'Azul', grams: 10, wasteGrams: 0, pricePerKg: 0, packageQuantity: 0, packageUnit: 'g' as const, packagePrice: 20 };
    expect(() => calculateCost({ ...referenceCase, materials: [m] })).toThrow();
    expect(() => calculateCost({ ...referenceCase, materials: [{ ...m, packageQuantity: 250, packagePrice: -1 }] })).toThrow();
  });
  it('permite venda abaixo do custo', () => {
    expect(calculateCost({ ...referenceCase, salePrice: 1 }).grossProfit).toBeLessThan(0);
  });
});
