import { calculateProduct, type ProductInput } from './product'
// Cálculo puro. Valores monetários em centavos inteiros; arredonda cada componente uma vez.
// Item comprado pronto (argola, corrente, copo): custo por peça, fora da taxa de falhas. Usado pela Calculadora e pelo Produto.
export interface Bought { name: string; price: number; qty: number } // price em R$ por unidade
export const boughtCost = (l: Bought[] = []) => l.reduce((s, b) => s + Math.round(toCents(b.price) * b.qty), 0)
export function validateBought(l: Bought[] = []): string[] {
  const e: string[] = []
  l.forEach((b, n) => {
    if (!b.name.trim()) e.push(`Item comprado ${n + 1}: dê um nome.`)
    if (!(b.price >= 0)) e.push(`Item comprado ${n + 1}: preço deve ser zero ou mais.`)
    if (!Number.isInteger(b.qty) || b.qty < 1) e.push(`Item comprado ${n + 1}: quantidade deve ser um número inteiro, 1 ou mais.`)
  })
  return e
}

export interface CostInput {
  grams: number; pricePerKg: number; // R$/kg
  hours: number; watts: number; tariff: number; // R$/kWh
  printerPrice: number; lifetimeHours: number;
  laborMinutes: number; laborRate: number; // R$/h
  failurePct: number; quantity: number; marginPct: number;
  soldPrice?: number; // R$ por peça, opcional
  bought?: Bought[]; // itens comprados por peça (opcional)
}

export interface CostResult {
  parts: { material: number; energy: number; machine: number; labor: number; failure: number; bought?: number };
  total: number; unit: number; suggestedPrice: number;
  price: number; priceIsSuggested: boolean;
  profitPerUnit: number; margin: number; markup: number; profitPerHour: number;
}

// Adaptador: entrada da Calculadora (um lote) vira um produto de uma parte. O tempo de trabalho do lote é dividido pelas peças.
export const calcParaProduto = (i: CostInput): ProductInput => ({
  parts: [{ name: 'Lote', hours: i.hours, piecesPerPrint: i.quantity, perProduct: 1,
    lines: [{ color: '', pricePerKg: i.pricePerKg, modelG: i.grams, flushedG: 0, towerG: 0 }] }],
  bought: i.bought ?? [], watts: i.watts, tariff: i.tariff, printerPrice: i.printerPrice, lifetimeHours: i.lifetimeHours,
  laborMinutes: i.laborMinutes / i.quantity, laborRate: i.laborRate, failurePct: i.failurePct, marginPct: i.marginPct, soldPrice: i.soldPrice,
})

export const toCents = (reais: number) => Math.round(reais * 100);

export function validate(i: CostInput): string[] {
  const e: string[] = []
  const nonNeg: [keyof CostInput, string][] = [
    ['grams', 'Peso'], ['pricePerKg', 'Preço do filamento'], ['watts', 'Potência'], ['tariff', 'Tarifa'],
    ['printerPrice', 'Preço da impressora'], ['laborMinutes', 'Tempo de trabalho'], ['laborRate', 'Valor da hora'],
  ]
  for (const [k, label] of nonNeg) if (!(Number(i[k]) >= 0)) e.push(`${label} deve ser zero ou mais.`)
  if (!(i.hours > 0)) e.push('Tempo de impressão deve ser maior que zero.')
  if (!(i.lifetimeHours > 0)) e.push('Vida útil da impressora deve ser maior que zero.')
  if (!(i.failurePct >= 0 && i.failurePct < 100)) e.push('Falhas deve ficar entre 0 e 99%.')
  if (!(i.marginPct >= 0 && i.marginPct < 100)) e.push('Margem deve ficar entre 0 e 99%.')
  if (!Number.isInteger(i.quantity) || i.quantity < 1) e.push('Quantidade deve ser um número inteiro, 1 ou mais.')
  if (i.soldPrice !== undefined && !(i.soldPrice > 0)) e.push('Preço praticado deve ser maior que zero.')
  e.push(...validateBought(i.bought))
  return e
}

// Motor único: a Calculadora é um produto de uma parte só. O lote vira uma impressão com `quantity` peças,
// e cada peça é um produto. Todo o cálculo de custo está em product.ts.
export function calculateCost(i: CostInput): CostResult {
  const errors = validate(i)
  if (errors.length) throw new Error(errors.join(' '))
  const p = calculateProduct(calcParaProduto(i))
  const part = p.parts[0]
  const q = i.quantity
  return {
    // Valores do lote inteiro, na mesma conta de antes (cada peça × quantidade).
    parts: { material: part.material * q, energy: part.energy * q, machine: part.machine * q, labor: p.labor * q, failure: p.failure * q, ...(p.bought ? { bought: p.bought * q } : {}) },
    total: p.total * q, unit: p.total, suggestedPrice: p.suggestedPrice,
    price: p.price, priceIsSuggested: p.priceIsSuggested, profitPerUnit: p.profit,
    margin: p.margin, markup: p.markup, profitPerHour: r0((p.profit * q) / i.hours),
  }
}
const r0 = Math.round
