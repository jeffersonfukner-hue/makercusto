// Cadastro de filamentos: cada rolo comprado é um registro, com o preço pago na época.
// Dinheiro em centavos inteiros. O preço por kg sai da conta (preço do rolo ÷ peso do rolo).
import { foldText, titleCase } from './texto'
export const MATERIALS = ['PLA', 'PLA+', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC', 'PVA', 'HIPS', 'Outro'] as const
export const MAX_FILAMENTS = 100

export interface Filament {
  id: string
  name: string
  supplier: string
  brand: string // marca do filamento (pode diferir do fornecedor)
  material: string
  color: string
  priceCents: number
  weightG: number
  boughtAt: string // AAAA-MM-DD
  nozzleC?: number // temperatura do bico recomendada pela marca
  bedC?: number // temperatura da mesa
}
export type FilamentDraft = Omit<Filament, 'id'>

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))

export function validateFilament(d: FilamentDraft): string[] {
  const e: string[] = []
  if (!d.name.trim()) e.push('Dê um nome ao filamento. Ex.: PLA preto 001.')
  if (!Number.isInteger(d.priceCents) || d.priceCents <= 0) e.push('Informe o preço pago no rolo, maior que zero.')
  else if (d.priceCents > 1_000_000) e.push('Preço do rolo acima de R$ 10.000. Confira o valor.')
  if (!Number.isInteger(d.weightG) || d.weightG <= 0) e.push('Informe o peso do rolo em gramas (número inteiro), maior que zero.')
  else if (d.weightG > 20000) e.push('Peso do rolo acima de 20 kg. Confira o valor.')
  if (!isDate(d.boughtAt)) e.push('Informe a data da compra.')
  for (const [v, max, label] of [[d.nozzleC, 500, 'bico'], [d.bedC, 200, 'mesa']] as const) {
    if (v !== undefined && !(Number.isInteger(v) && v >= 0 && v <= max)) e.push(`Temperatura da ${label} deve ser um número inteiro entre 0 e ${max}.`)
  }
  return e
}

// Preço por kg em reais, com 2 casas (é o que a calculadora usa).
export const pricePerKg = (f: Pick<Filament, 'priceCents' | 'weightG'>) => Math.round((f.priceCents * 1000) / f.weightG) / 100

// Padrão de escrita: nome, fornecedor, marca e cor sempre em "Título" (ver texto.ts).
export const normalizeFilament = (d: FilamentDraft): FilamentDraft => ({
  ...d, name: titleCase(d.name).slice(0, 60), supplier: titleCase(d.supplier).slice(0, 40), brand: titleCase(d.brand).slice(0, 30),
  material: d.material.slice(0, 20), color: titleCase(d.color).slice(0, 30),
})

export function addFilament(list: Filament[], draft: FilamentDraft, id: string): Filament[] {
  const e = validateFilament(draft)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_FILAMENTS) throw new Error(`Limite de ${MAX_FILAMENTS} filamentos. Exclua algum.`)
  const d = normalizeFilament(draft)
  const f: Filament = {
    id, name: d.name, supplier: d.supplier, brand: d.brand,
    material: d.material, color: d.color, priceCents: d.priceCents, weightG: d.weightG, boughtAt: d.boughtAt,
    ...(d.nozzleC !== undefined ? { nozzleC: d.nozzleC } : {}), ...(d.bedC !== undefined ? { bedC: d.bedC } : {}),
  }
  return sortFilaments([f, ...list])
}

// Compra mais recente primeiro.
export const sortFilaments = (l: Filament[]) => [...l].sort((a, b) => b.boughtAt.localeCompare(a.boughtAt))

export const removeFilament = (l: Filament[], id: string) => l.filter((f) => f.id !== id)

// Cadastros antigos não tinham marca: entram com marca vazia.
const normalize = (x: any) => (x && typeof x === 'object' && x.brand === undefined ? { ...x, brand: '' } : x)

const isFilament = (x: any): x is Filament =>
  !!x && typeof x.id === 'string' && typeof x.brand === 'string' && typeof x.name === 'string' && typeof x.supplier === 'string' &&
  typeof x.material === 'string' && typeof x.color === 'string' && typeof x.priceCents === 'number' &&
  typeof x.weightG === 'number' && typeof x.boughtAt === 'string' && validateFilament(x).length === 0

export function parseFilaments(raw: string | null): Filament[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? sortFilaments(data.map(normalize).filter(isFilament)).slice(0, MAX_FILAMENTS) : []
  } catch { return [] }
}

// Texto da lista de escolha: "PLA preto 001 · PLA preto · R$ 68,00/kg"
export const filamentLabel = (f: Filament) =>
  `${f.name} · ${[f.material, f.color].filter(Boolean).join(' ')} · ${pricePerKg(f).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/kg`

// Nome gerado pelas escolhas: material + cor + marca + código ("PLA Preto Fosco Masterprint 001").
// O código sobe a cada rolo novo da mesma combinação, para os rolos não se confundirem.
export function filamentBase(p: { material: string; color: string; brand: string }): string {
  const base = [p.material === 'Outro' ? '' : p.material, titleCase(p.color), titleCase(p.brand)].filter(Boolean).join(' ')
  return (base || 'Filamento').slice(0, 52)
}
export function nextCode(list: Pick<Filament, 'name'>[], base: string): string {
  let max = 0
  for (const f of list) {
    if (!f.name.startsWith(`${base} `)) continue
    const m = /^(\d{3,})$/.exec(f.name.slice(base.length + 1))
    if (m) max = Math.max(max, Number(m[1]))
  }
  return String(max + 1).padStart(3, '0')
}
export const generateName = (list: Pick<Filament, 'name'>[], p: { material: string; color: string; brand: string }) => {
  const base = filamentBase(p)
  return `${base} ${nextCode(list, base)}`
}

// Última compra daquele fornecedor, da mais parecida (mesma marca, material e cor) para a menos parecida.
export function lastPurchase(list: Filament[], s: { supplier: string; brand: string; material: string; color: string }): Filament | undefined {
  const sup = foldText(s.supplier).trim()
  if (!sup) return undefined
  const mine = sortFilaments(list).filter((f) => foldText(f.supplier).trim() === sup)
  const eq = (a: string, b: string) => foldText(a).trim() === foldText(b).trim()
  return mine.find((f) => eq(f.brand, s.brand) && f.material === s.material && eq(f.color, s.color))
    ?? mine.find((f) => eq(f.brand, s.brand) && f.material === s.material)
    ?? mine.find((f) => f.material === s.material)
    ?? mine[0]
}

// Temperaturas já usadas com a mesma marca e material, para a pessoa não digitar de novo.
export function lastTemps(list: Filament[], s: { brand: string; material: string }): { nozzleC?: number; bedC?: number } | undefined {
  const f = sortFilaments(list).find((x) => foldText(x.brand) === foldText(s.brand) && x.material === s.material && (x.nozzleC !== undefined || x.bedC !== undefined))
  return f ? { nozzleC: f.nozzleC, bedC: f.bedC } : undefined
}

// Rolo mais recente (maior data de compra) cuja cor combina com o nome da cor do fatiador ("Preto" acha "Preto Fosco").
// É o rolo que se usa hoje; rolos antigos com outro preço ficam no cadastro mas não são sugeridos.
export function latestRollFor(list: Filament[], colorName: string): Filament | undefined {
  const c = foldText(colorName.trim())
  if (!c) return undefined
  return sortFilaments(list).find((f) => f.color && foldText(f.color).startsWith(c))
}
