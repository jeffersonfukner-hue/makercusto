import { describe, expect, it } from 'vitest'
import type { CostInput } from './cost'
import { addSaved, parseSaved, summarize, MAX_SAVED } from './saved'

const input: CostInput = {
  grams: 100, pricePerKg: 100, hours: 10, watts: 200, tariff: 1, printerPrice: 3000, lifetimeHours: 3000,
  laborMinutes: 30, laborRate: 20, failurePct: 20, quantity: 4, marginPct: 50, soldPrice: 25,
}

describe('saved', () => {
  it('adiciona no topo, exige nome e entrada válida', () => {
    const a = addSaved([], ' Chaveiro ', input, '1', '2026-11-27T00:00:00Z')
    const b = addSaved(a, 'Suporte', input, '2', '2026-11-27T01:00:00Z')
    expect(b.map((x) => x.name)).toEqual(['Suporte', 'Chaveiro'])
    expect(() => addSaved([], '  ', input, '3', 'x')).toThrow()
    expect(() => addSaved([], 'x', { ...input, hours: 0 }, '3', 'x')).toThrow()
  })
  it('limita a quantidade guardada', () => {
    let l = [] as ReturnType<typeof addSaved>
    for (let i = 0; i < MAX_SAVED + 5; i++) l = addSaved(l, 'n' + i, input, String(i), 'd')
    expect(l).toHaveLength(MAX_SAVED)
  })
  it('lê o armazenamento ignorando lixo', () => {
    const l = addSaved([], 'A', input, '1', 'd')
    expect(parseSaved(JSON.stringify(l))).toEqual(l)
    expect(parseSaved('não é json')).toEqual([])
    expect(parseSaved('{"a":1}')).toEqual([])
    expect(parseSaved(JSON.stringify([{ id: '1', name: 'x', savedAt: 'd', input: { hours: 0 } }, ...l]))).toEqual(l)
    expect(parseSaved(null)).toEqual([])
  })
  it('resume o trabalho: receita, margem bruta e percentual', () => {
    const s = summarize(addSaved([], 'A', input, '1', 'd')[0])
    expect(s.revenue).toBe(10000)
    expect(s.gross).toBe(6000)
    expect(s.grossPct).toBeCloseTo(0.6)
  })
  it('sem preço praticado usa o sugerido', () => {
    const { soldPrice, ...rest } = input
    const s = summarize(addSaved([], 'A', rest, '1', 'd')[0])
    expect(s.result.priceIsSuggested).toBe(true)
    expect(s.revenue).toBe(8000)
  })
})

import { fromCloudRows, kindOf } from './saved'
describe('tipo do cálculo', () => {
  it('lê o tipo da nuvem e assume produto final quando não há tipo', () => {
    const base = { hours: 3, grams: 50, pricePerKg: 100, watts: 150, tariff: 1, printerPrice: 3500, lifetimeHours: 3000, laborMinutes: 10, laborRate: 20, failurePct: 10, quantity: 1, marginPct: 50 }
    const l = fromCloudRows([{ id: 'a', nome: 'A', criado_em: 'x', entrada: { ...base, tipo: 'parte' } }, { id: 'b', nome: 'B', criado_em: 'x', entrada: base }])
    expect(l.map(kindOf)).toEqual(['parte', 'produto'])
    expect('tipo' in l[0].input).toBe(false)
  })
})
