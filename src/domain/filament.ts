// Cadastro de filamentos: cada rolo comprado é um registro, com o preço pago na época.
// Dinheiro em centavos inteiros. O preço por kg sai da conta (preço do rolo ÷ peso do rolo).
export const MATERIALS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Outro'] as const
export const MAX_FILAMENTS = 100

export interface Filament {
  id: string
  name: string
  supplier: string
  material: string
  color: string
  priceCents: number
  weightG: number
  boughtAt: string // AAAA-MM-DD
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
  return e
}

// Preço por kg em reais, com 2 casas (é o que a calculadora usa).
export const pricePerKg = (f: Pick<Filament, 'priceCents' | 'weightG'>) => Math.round((f.priceCents * 1000) / f.weightG) / 100

export function addFilament(list: Filament[], d: FilamentDraft, id: string): Filament[] {
  const e = validateFilament(d)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_FILAMENTS) throw new Error(`Limite de ${MAX_FILAMENTS} filamentos. Exclua algum.`)
  const f: Filament = {
    id, name: d.name.trim().slice(0, 60), supplier: d.supplier.trim().slice(0, 40), material: d.material.slice(0, 20),
    color: d.color.trim().slice(0, 30), priceCents: d.priceCents, weightG: d.weightG, boughtAt: d.boughtAt,
  }
  return sortFilaments([f, ...list])
}

// Compra mais recente primeiro.
export const sortFilaments = (l: Filament[]) => [...l].sort((a, b) => b.boughtAt.localeCompare(a.boughtAt))

export const removeFilament = (l: Filament[], id: string) => l.filter((f) => f.id !== id)

const isFilament = (x: any): x is Filament =>
  !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.supplier === 'string' &&
  typeof x.material === 'string' && typeof x.color === 'string' && typeof x.priceCents === 'number' &&
  typeof x.weightG === 'number' && typeof x.boughtAt === 'string' && validateFilament(x).length === 0

export function parseFilaments(raw: string | null): Filament[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? sortFilaments(data.filter(isFilament)).slice(0, MAX_FILAMENTS) : []
  } catch { return [] }
}

// Texto da lista de escolha: "PLA preto 001 · PLA preto · R$ 68,00/kg"
export const filamentLabel = (f: Filament) =>
  `${f.name} · ${[f.material, f.color].filter(Boolean).join(' ')} · ${pricePerKg(f).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/kg`
