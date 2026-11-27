// Produto com partes. Cada parte é uma impressão (uma placa do fatiador) com uma ou mais cores.
// O fatiador separa o peso de cada cor em peça (model), purga (flushed) e torre (tower): tudo isso é filamento gasto.
// Itens comprados (ex.: copo de alumínio) entram só como custo, fora da taxa de falhas.
// Valores monetários em centavos inteiros; cada componente é arredondado uma vez por parte.
import { toCents } from './cost'

export interface ColorLine {
  color: string
  pricePerKg: number // R$/kg
  modelG: number // peso da peça
  flushedG: number // purga
  towerG: number // torre de limpeza
}
export interface Part {
  name: string
  hours: number // tempo total da impressão
  piecesPerPrint: number // quantas peças saem de uma impressão (ex.: 4 brasões na mesma placa)
  perProduct: number // quantas dessas peças cada produto usa
  lines: ColorLine[]
}
export interface Bought { name: string; price: number; qty: number } // price em R$ por unidade
export interface ProductInput {
  parts: Part[]
  bought: Bought[]
  watts: number; tariff: number; printerPrice: number; lifetimeHours: number
  laborMinutes: number; laborRate: number; failurePct: number; marginPct: number
  soldPrice?: number
}
export interface PartCost { name: string; material: number; waste: number; energy: number; machine: number; subtotal: number }
export interface ProductResult {
  parts: PartCost[]
  bought: number; labor: number; failure: number
  total: number; suggestedPrice: number; price: number; priceIsSuggested: boolean
  profit: number; margin: number; markup: number; profitPerHour: number
  grams: { model: number; waste: number } // por produto
  wastePct: number // purga + torre ÷ total gasto
  machineHours: number // por produto
}

export const lineGrams = (l: ColorLine) => l.modelG + l.flushedG + l.towerG

export function validateProduct(i: ProductInput): string[] {
  const e: string[] = []
  if (!i.parts.length) e.push('Inclua pelo menos uma parte impressa.')
  i.parts.forEach((p, n) => {
    const w = `Parte ${n + 1}${p.name.trim() ? ` (${p.name.trim()})` : ''}`
    if (!p.name.trim()) e.push(`${w}: dê um nome.`)
    if (!(p.hours > 0)) e.push(`${w}: o tempo de impressão deve ser maior que zero.`)
    if (!Number.isInteger(p.piecesPerPrint) || p.piecesPerPrint < 1) e.push(`${w}: peças por impressão deve ser um número inteiro, 1 ou mais.`)
    if (!Number.isInteger(p.perProduct) || p.perProduct < 1) e.push(`${w}: peças por produto deve ser um número inteiro, 1 ou mais.`)
    if (!p.lines.length) e.push(`${w}: inclua pelo menos uma cor.`)
    for (const l of p.lines) {
      if (![l.pricePerKg, l.modelG, l.flushedG, l.towerG].every((x) => x >= 0)) e.push(`${w}: pesos e preço devem ser zero ou mais.`)
    }
    if (p.lines.length && p.lines.every((l) => lineGrams(l) <= 0)) e.push(`${w}: informe o peso de pelo menos uma cor.`)
  })
  i.bought.forEach((b, n) => {
    if (!b.name.trim()) e.push(`Item comprado ${n + 1}: dê um nome.`)
    if (!(b.price >= 0)) e.push(`Item comprado ${n + 1}: preço deve ser zero ou mais.`)
    if (!Number.isInteger(b.qty) || b.qty < 1) e.push(`Item comprado ${n + 1}: quantidade deve ser um número inteiro, 1 ou mais.`)
  })
  for (const [v, label] of [[i.watts, 'Potência'], [i.tariff, 'Tarifa'], [i.printerPrice, 'Preço da impressora'], [i.laborMinutes, 'Tempo de trabalho'], [i.laborRate, 'Valor da hora']] as const) {
    if (!(v >= 0)) e.push(`${label} deve ser zero ou mais.`)
  }
  if (!(i.lifetimeHours > 0)) e.push('Vida útil da impressora deve ser maior que zero.')
  if (!(i.failurePct >= 0 && i.failurePct < 100)) e.push('Falhas deve ficar entre 0 e 99%.')
  if (!(i.marginPct >= 0 && i.marginPct < 100)) e.push('Margem deve ficar entre 0 e 99%.')
  if (i.soldPrice !== undefined && !(i.soldPrice > 0)) e.push('Preço praticado deve ser maior que zero.')
  return e
}

export function calculateProduct(i: ProductInput): ProductResult {
  const errors = validateProduct(i)
  if (errors.length) throw new Error(errors.join(' '))
  const r = Math.round
  let modelG = 0, wasteG = 0, machineHours = 0

  const parts: PartCost[] = i.parts.map((p) => {
    // Custos de UMA impressão; a parte do produto é perProduct ÷ piecesPerPrint dela.
    const share = p.perProduct / p.piecesPerPrint
    let modelC = 0, wasteC = 0
    for (const l of p.lines) {
      const kg = toCents(l.pricePerKg) / 1000
      modelC += l.modelG * kg
      wasteC += (l.flushedG + l.towerG) * kg
      modelG += l.modelG * share
      wasteG += (l.flushedG + l.towerG) * share
    }
    machineHours += p.hours * share
    const material = r(modelC * share)
    const waste = r(wasteC * share)
    const energy = r((i.watts / 1000) * p.hours * toCents(i.tariff) * share)
    const machine = r((toCents(i.printerPrice) / i.lifetimeHours) * p.hours * share)
    return { name: p.name.trim(), material, waste, energy, machine, subtotal: material + waste + energy + machine }
  })

  const bought = i.bought.reduce((s, b) => s + r(toCents(b.price) * b.qty), 0)
  const labor = r((i.laborMinutes / 60) * toCents(i.laborRate))
  const printed = parts.reduce((s, p) => s + p.subtotal, 0)
  const base = printed + labor
  // Falha: as peças boas absorvem as perdas das impressões e do trabalho. Itens comprados ficam de fora.
  const withFailure = r(base / (1 - i.failurePct / 100))
  const total = withFailure + bought
  const suggestedPrice = Math.ceil(total / (1 - i.marginPct / 100) - 1e-9)
  const priceIsSuggested = i.soldPrice === undefined
  const price = priceIsSuggested ? suggestedPrice : toCents(i.soldPrice as number)
  const profit = price - total
  const spent = modelG + wasteG
  return {
    parts, bought, labor, failure: withFailure - base,
    total, suggestedPrice, price, priceIsSuggested, profit,
    margin: price > 0 ? profit / price : 0,
    markup: total > 0 ? profit / total : 0,
    profitPerHour: machineHours > 0 ? r(profit / machineHours) : 0,
    grams: { model: modelG, waste: wasteG },
    wastePct: spent > 0 ? wasteG / spent : 0,
    machineHours,
  }
}

// Valores de partida (exemplo do brasão do print do fatiador): 3 cores, purga e torre separadas.
export const emptyLine = (): ColorLine => ({ color: '', pricePerKg: 0, modelG: 0, flushedG: 0, towerG: 0 })
export const emptyPart = (): Part => ({ name: '', hours: 0, piecesPerPrint: 1, perProduct: 1, lines: [emptyLine()] })

// Produtos salvos (local e nuvem).
export interface SavedProduct { id: string; name: string; savedAt: string; input: ProductInput }
export const MAX_PRODUCTS = 50

export function addSavedProduct(list: SavedProduct[], name: string, input: ProductInput, id: string, savedAt: string): SavedProduct[] {
  const n = name.trim()
  if (!n) throw new Error('Dê um nome ao produto.')
  if (validateProduct(input).length) throw new Error('Corrija os campos antes de salvar.')
  if (list.length >= MAX_PRODUCTS) throw new Error(`Limite de ${MAX_PRODUCTS} produtos. Exclua algum.`)
  return [{ id, name: n.slice(0, 60), savedAt, input }, ...list]
}

const isSavedProduct = (x: any): x is SavedProduct =>
  !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.savedAt === 'string' &&
  !!x.input && typeof x.input === 'object' && Array.isArray(x.input.parts) && Array.isArray(x.input.bought) &&
  validateProduct(x.input).length === 0

export function parseProducts(raw: string | null): SavedProduct[] {
  if (!raw) return []
  try { const d = JSON.parse(raw); return Array.isArray(d) ? d.filter(isSavedProduct).slice(0, MAX_PRODUCTS) : [] } catch { return [] }
}
export interface ProductRow { id: string; nome: string; entrada: unknown; criado_em: string }
export const productsFromRows = (rows: ProductRow[]): SavedProduct[] =>
  rows.map((r) => ({ id: r.id, name: r.nome, savedAt: r.criado_em, input: r.entrada as ProductInput })).filter(isSavedProduct)
