export interface MaterialLine {
  id: string;
  name: string;
  grams: number;
  wasteGrams: number;
  towerGrams?: number;
  measuredWasteGrams?: number;
  slicerMeters?: { model?: number; flushed?: number; tower?: number; total?: number };
  pricePerKg: number;
  type?: string;
  brand?: string;
  packageQuantity?: number;
  packageUnit?: 'g' | 'kg';
  packagePrice?: number;
}
export interface CostInput {
  grams: number;
  pricePerKg: number;
  materials?: MaterialLine[];
  hours: number;
  slicerSummary?: { preparation?: number; printing?: number; changes?: number; cost?: number };
  averageWatts: number;
  pricePerKwh: number;
  printerPrice: number;
  lifetimeHours: number;
  quantity: number;
  accessoryPerUnit: number;
  assemblyMinutesPerUnit: number;
  laborPerHour: number;
  salePrice: number;
}
export interface MaterialResult {
  id: string;
  name: string;
  modelGrams: number;
  wasteGrams: number;
  totalGrams: number;
  cost: number;
  pricePerKg: number;
}
export interface CostResult {
  material: number;
  materialBreakdown: MaterialResult[];
  modelGrams: number;
  wasteGrams: number;
  energy: number;
  depreciation: number;
  accessories: number;
  assembly: number;
  lotCost: number;
  unitCost: number;
  lotRevenue: number;
  grossProfit: number;
  marginPercent: number;
  markupPercent: number;
}
const validNonNegative = (value: number): boolean => Number.isFinite(value) && value >= 0;
export function materialWasteGrams(item: MaterialLine): number {
  return item.measuredWasteGrams ?? (item.wasteGrams + (item.towerGrams ?? 0));
}
export function materialTotalGrams(item: MaterialLine): number {
  return item.grams + materialWasteGrams(item);
}
export function calculateCost(input: CostInput): CostResult {
  const baseNumbers = [
    input.hours, input.averageWatts, input.pricePerKwh, input.printerPrice,
    input.lifetimeHours, input.quantity, input.accessoryPerUnit,
    input.assemblyMinutesPerUnit, input.laborPerHour, input.salePrice
  ];
  if (baseNumbers.some(value => !validNonNegative(value)) ||
      !Number.isSafeInteger(input.quantity) || input.quantity < 1 ||
      input.lifetimeHours <= 0) {
    throw new Error('Confira os parâmetros: valores não negativos, quantidade inteira e vida útil maior que zero.');
  }
  // A lista de materiais substitui o campo legado de filamento único.
  // Nunca somar ambos: evita custo de filamento contabilizado duas vezes.
  const materials: MaterialLine[] = input.materials === undefined
    ? [{ id: 'single', name: 'Filamento', grams: input.grams, wasteGrams: 0, pricePerKg: input.pricePerKg }]
    : input.materials;
  if (!materials.length || new Set(materials.map(item => item.id)).size !== materials.length ||
      materials.some(item =>
        !item.id.trim() || !item.name.trim() ||
        !validNonNegative(item.grams) || !Number.isFinite(item.wasteGrams) ||
        item.grams + item.wasteGrams + (item.towerGrams ?? 0) < 0 ||
        !validNonNegative(item.measuredWasteGrams ?? 0) ||
        !validNonNegative(item.towerGrams ?? 0) || !validNonNegative(item.pricePerKg) ||
        ((item.packageQuantity !== undefined || item.packageUnit !== undefined || item.packagePrice !== undefined) &&
          (!Number.isFinite(item.packageQuantity) || (item.packageQuantity ?? 0) <= 0 ||
           !validNonNegative(item.packagePrice ?? NaN) ||
           (item.packageUnit !== 'g' && item.packageUnit !== 'kg'))))) {
    throw new Error('Verifique os materiais: nome, peso e preço válidos; ao menos uma cor e IDs únicos.');
  }
  const materialBreakdown = materials.map(item => {
    const pricePerKg = item.packageQuantity !== undefined && item.packagePrice !== undefined
      ? item.packagePrice / (item.packageQuantity * (item.packageUnit === 'kg' ? 1000 : 1)) * 1000
      : item.pricePerKg;
    const totalGrams = materialTotalGrams(item);
    return {
    id: item.id,
    name: item.name,
    modelGrams: item.grams,
    wasteGrams: materialWasteGrams(item),
    totalGrams,
    cost: totalGrams * pricePerKg / 1000,
    pricePerKg
  }; });
  const material = materialBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const modelGrams = materialBreakdown.reduce((sum, item) => sum + item.modelGrams, 0);
  const wasteGrams = materialBreakdown.reduce((sum, item) => sum + item.wasteGrams, 0);
  const energy = input.averageWatts / 1000 * input.hours * input.pricePerKwh;
  const depreciation = input.printerPrice / input.lifetimeHours * input.hours;
  const accessories = input.accessoryPerUnit * input.quantity;
  const assembly = input.assemblyMinutesPerUnit / 60 * input.laborPerHour * input.quantity;
  const lotCost = material + energy + depreciation + accessories + assembly;
  const unitCost = lotCost / input.quantity;
  const lotRevenue = input.salePrice * input.quantity;
  const grossProfit = lotRevenue - lotCost;
  return {
    material, materialBreakdown, modelGrams, wasteGrams, energy, depreciation,
    accessories, assembly, lotCost, unitCost, lotRevenue, grossProfit,
    marginPercent: lotRevenue ? grossProfit / lotRevenue * 100 : 0,
    markupPercent: lotCost ? grossProfit / lotCost * 100 : 0
  };
}
export const referenceCase: CostInput = {
  grams: 151.58, pricePerKg: 100,
  materials: [
    { id: 'blue', name: 'Azul', grams: 83.26, wasteGrams: 0, pricePerKg: 100 },
    { id: 'white', name: 'Branco', grams: 47.76, wasteGrams: 0, pricePerKg: 100 },
    { id: 'gold', name: 'Dourado', grams: 20.56, wasteGrams: 0, pricePerKg: 100 }
  ],
  hours: 11 + 14 / 60, averageWatts: 150, pricePerKwh: 1.03,
  printerPrice: 3500, lifetimeHours: 3000, quantity: 20,
  accessoryPerUnit: .35, assemblyMinutesPerUnit: 2, laborPerHour: 20, salePrice: 7.9
};
