// Fornecedores: de onde vêm filamentos e insumos.
import { foldText, titleCase } from './texto'
export interface Supplier { id: string; name: string; contact: string; site: string; notes: string }
export type SupplierDraft = Omit<Supplier, 'id'>
export const MAX_SUPPLIERS = 50

export function validateSupplier(d: SupplierDraft): string[] {
  const e: string[] = []
  if (!d.name.trim()) e.push('Dê um nome ao fornecedor.')
  if (d.name.trim().length > 60) e.push('Nome com até 60 letras.')
  if (d.contact.length > 80) e.push('Contato com até 80 letras.')
  if (d.site.length > 120) e.push('Site com até 120 letras.')
  if (d.notes.length > 200) e.push('Observações com até 200 letras.')
  return e
}

export function addSupplier(list: Supplier[], d: SupplierDraft, id: string): Supplier[] {
  const e = validateSupplier(d)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_SUPPLIERS) throw new Error(`Limite de ${MAX_SUPPLIERS} fornecedores. Exclua algum.`)
  if (list.some((s) => foldText(s.name).trim() === foldText(d.name).trim())) throw new Error('Já existe um fornecedor com esse nome.')
  return [...list, { id, name: titleCase(d.name), contact: d.contact.trim(), site: d.site.trim(), notes: d.notes.trim() }]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

const isSupplier = (x: any): x is Supplier =>
  !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.contact === 'string' &&
  typeof x.site === 'string' && typeof x.notes === 'string' && validateSupplier(x).length === 0

export function parseSuppliers(raw: string | null): Supplier[] {
  if (!raw) return []
  try { const d = JSON.parse(raw); return Array.isArray(d) ? d.filter(isSupplier).slice(0, MAX_SUPPLIERS) : [] } catch { return [] }
}
