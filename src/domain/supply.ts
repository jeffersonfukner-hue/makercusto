// Estoque de insumos: o que você compra pronto para montar o produto (chaveiros, copos, LEDs, ímãs...).
// Dinheiro em centavos inteiros. Quantidade em unidades inteiras.
import { titleCase } from './texto'
export interface Supply {
  id: string
  name: string
  category: string
  qty: number // em estoque
  min: number // aviso de estoque baixo
  costCents: number // custo de cada unidade
  supplier: string
}
export type SupplyDraft = Omit<Supply, 'id'>
export const MAX_SUPPLIES = 200

export function validateSupply(d: SupplyDraft): string[] {
  const e: string[] = []
  if (!d.name.trim()) e.push('Dê um nome ao item.')
  if (d.name.trim().length > 60) e.push('Nome com até 60 letras.')
  if (d.category.length > 30) e.push('Categoria com até 30 letras.')
  if (d.supplier.length > 60) e.push('Fornecedor com até 60 letras.')
  if (!Number.isInteger(d.qty) || d.qty < 0 || d.qty > 1_000_000) e.push('Quantidade em estoque: número inteiro, zero ou mais.')
  if (!Number.isInteger(d.min) || d.min < 0 || d.min > 1_000_000) e.push('Estoque mínimo: número inteiro, zero ou mais.')
  if (!Number.isInteger(d.costCents) || d.costCents < 0 || d.costCents > 10_000_000) e.push('Custo de cada unidade: zero ou mais.')
  return e
}

export const normalizeSupply = (d: SupplyDraft): SupplyDraft => ({ ...d, name: titleCase(d.name), category: titleCase(d.category), supplier: titleCase(d.supplier) })

export function addSupply(list: Supply[], d: SupplyDraft, id: string): Supply[] {
  const e = validateSupply(d)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_SUPPLIES) throw new Error(`Limite de ${MAX_SUPPLIES} itens. Exclua algum.`)
  return sortSupplies([...list, { id, ...normalizeSupply(d) }])
}

export const sortSupplies = (l: Supply[]) => [...l].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

// Entrada (+) ou saída (-) de estoque. Nunca fica abaixo de zero.
export const withQty = (s: Supply, qty: number): Supply => ({ ...s, qty: Math.max(0, Math.min(1_000_000, Math.round(qty))) })
export const isLow = (s: Supply) => s.min > 0 && s.qty <= s.min
export const stockValueCents = (l: Supply[]) => l.reduce((t, s) => t + s.qty * s.costCents, 0)

const isSupply = (x: any): x is Supply =>
  !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.category === 'string' && typeof x.supplier === 'string' &&
  typeof x.qty === 'number' && typeof x.min === 'number' && typeof x.costCents === 'number' && validateSupply(x).length === 0

export function parseSupplies(raw: string | null): Supply[] {
  if (!raw) return []
  try { const d = JSON.parse(raw); return Array.isArray(d) ? sortSupplies(d.filter(isSupply)).slice(0, MAX_SUPPLIES) : [] } catch { return [] }
}
