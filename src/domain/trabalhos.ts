// Cadastro único de trabalhos salvos. O que vem da Calculadora (cálculo por lote) e o que vem do Produto com partes
// aparecem juntos, com os mesmos números em Produtos e no Painel.
import { calculateProduct, type SavedProduct } from './product'
import { kindOf, summarize, type Kind, type SavedCalc } from './saved'

export type Origem = 'calculo' | 'produto'
export interface Composicao { material: number; energy: number; machine: number; labor: number; failure: number; waste?: number; bought?: number }

// Uma linha do cadastro, já com os números de exibição. Valores em centavos.
export interface Linha {
  id: string; name: string; savedAt: string; kind: Kind; origem: Origem
  unit: number // custo de uma peça (ou de um produto)
  total: number // custo de tudo que foi calculado (lote, ou produto)
  price: number; suggested: number; priceIsSuggested: boolean
  profitPerUnit: number; profitPerHour: number
  revenue: number; gross: number; grossPct: number
  hours: number // horas de máquina do lote ou do produto
  pieces: number // peças no lote (1 para produto)
  comp: Composicao
}

export function linhaDeCalc(c: SavedCalc): Linha {
  const s = summarize(c)
  const r = s.result
  return {
    id: c.id, name: c.name, savedAt: c.savedAt, kind: kindOf(c), origem: 'calculo',
    unit: r.unit, total: r.total, price: r.price, suggested: r.suggestedPrice, priceIsSuggested: r.priceIsSuggested,
    profitPerUnit: r.profitPerUnit, profitPerHour: r.profitPerHour, revenue: s.revenue, gross: s.gross, grossPct: s.grossPct,
    hours: c.input.hours, pieces: c.input.quantity, comp: r.parts,
  }
}

export function linhaDeProduto(p: SavedProduct): Linha {
  const r = calculateProduct(p.input)
  const sum = (k: 'material' | 'waste' | 'energy' | 'machine') => r.parts.reduce((s, x) => s + x[k], 0)
  return {
    id: p.id, name: p.name, savedAt: p.savedAt, kind: p.kind === 'parte' ? 'parte' : 'produto', origem: 'produto',
    unit: r.total, total: r.total, price: r.price, suggested: r.suggestedPrice, priceIsSuggested: r.priceIsSuggested,
    profitPerUnit: r.profit, profitPerHour: r.profitPerHour, revenue: r.price, gross: r.profit, grossPct: r.price > 0 ? r.profit / r.price : 0,
    hours: r.machineHours, pieces: 1,
    comp: { material: sum('material'), waste: sum('waste'), energy: sum('energy'), machine: sum('machine'), labor: r.labor, failure: r.failure, bought: r.bought },
  }
}

// Junta as duas origens, da mais nova para a mais antiga. Item que não calcula mais (dado antigo) é ignorado.
export function todasAsLinhas(calcs: SavedCalc[], produtos: SavedProduct[]): Linha[] {
  const out: Linha[] = []
  for (const c of calcs) { try { out.push(linhaDeCalc(c)) } catch { /* ignora */ } }
  for (const p of produtos) { try { out.push(linhaDeProduto(p)) } catch { /* ignora */ } }
  return out.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
}
