import { titleCase } from './texto'
import { calculateCost, validate, type CostInput, type CostResult } from './cost'

export interface SavedCalc { id: string; name: string; savedAt: string; input: CostInput }
export interface JobSummary extends SavedCalc { result: CostResult; revenue: number; gross: number; grossPct: number }
export const MAX_SAVED = 50

export function addSaved(list: SavedCalc[], name: string, input: CostInput, id: string, savedAt: string): SavedCalc[] {
  const n = titleCase(name)
  if (!n) throw new Error('Dê um nome ao trabalho.')
  if (validate(input).length) throw new Error('Corrija os campos antes de salvar.')
  return [{ id, name: n.slice(0, 60), savedAt, input }, ...list].slice(0, MAX_SAVED)
}

const isSaved = (x: any): x is SavedCalc =>
  !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.savedAt === 'string' &&
  !!x.input && typeof x.input === 'object' && validate(x.input).length === 0

export function parseSaved(raw: string | null): SavedCalc[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data.filter(isSaved).slice(0, MAX_SAVED) : []
  } catch { return [] }
}

// Receita usa o preço praticado; sem ele, usa o sugerido. Margem bruta = receita − custo total do lote.
export function summarize(s: SavedCalc): JobSummary {
  const result = calculateCost(s.input)
  const revenue = result.price * s.input.quantity
  const gross = revenue - result.total
  return { ...s, result, revenue, gross, grossPct: revenue > 0 ? gross / revenue : 0 }
}

// Linha da tabela `calculos` do Supabase para o formato do app. Linhas inválidas são ignoradas.
export interface CloudRow { id: string; nome: string; entrada: unknown; criado_em: string }
export function fromCloudRows(rows: CloudRow[]): SavedCalc[] {
  return rows
    .map((r) => ({ id: r.id, name: r.nome, savedAt: r.criado_em, input: r.entrada as CostInput }))
    .filter(isSaved)
}
