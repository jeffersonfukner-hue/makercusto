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

export function calculateCost(i: CostInput): CostResult {
  const errors = validate(i)
  if (errors.length) throw new Error(errors.join(' '))
  const r = Math.round
  const material = r((i.grams / 1000) * toCents(i.pricePerKg))
  const energy = r((i.watts / 1000) * i.hours * toCents(i.tariff))
  const machine = r((toCents(i.printerPrice) / i.lifetimeHours) * i.hours)
  const labor = r((i.laborMinutes / 60) * toCents(i.laborRate))
  const base = material + energy + machine + labor
  // Falha: o custo das peças boas absorve as perdas. total = base / (1 - taxa).
  const withFailure = r(base / (1 - i.failurePct / 100))
  // Itens comprados entram por peça e ficam fora da taxa de falhas.
  const bought = boughtCost(i.bought)
  const total = withFailure + bought * i.quantity
  const unit = r(withFailure / i.quantity) + bought
  const suggestedPrice = Math.ceil(unit / (1 - i.marginPct / 100) - 1e-9)
  const priceIsSuggested = i.soldPrice === undefined
  const price = priceIsSuggested ? suggestedPrice : toCents(i.soldPrice as number)
  const profitPerUnit = price - unit
  return {
    parts: { material, energy, machine, labor, failure: withFailure - base, ...(bought ? { bought: bought * i.quantity } : {}) },
    total, unit, suggestedPrice, price, priceIsSuggested, profitPerUnit,
    margin: price > 0 ? profitPerUnit / price : 0, // lucro ÷ preço
    markup: unit > 0 ? profitPerUnit / unit : 0, // lucro ÷ custo
    profitPerHour: r((profitPerUnit * i.quantity) / i.hours),
  }
}
