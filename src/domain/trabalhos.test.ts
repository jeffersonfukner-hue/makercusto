import { describe, expect, it } from 'vitest'
import { addSaved } from './saved'
import { addSavedProduct, emptyPart } from './product'
import { linhaDeCalc, linhaDeProduto, todasAsLinhas } from './trabalhos'

const calc = { grams: 100, pricePerKg: 100, hours: 10, watts: 200, tariff: 1, printerPrice: 3000, lifetimeHours: 3000, laborMinutes: 30, laborRate: 20, failurePct: 20, quantity: 4, marginPct: 50 }
const prodInput = {
  parts: [{ ...emptyPart(), name: 'Base', hours: 2, lines: [{ color: 'Preto', pricePerKg: 80, modelG: 50, flushedG: 5, towerG: 5 }] }],
  bought: [{ name: 'Argola', price: 1.5, qty: 1 }], watts: 150, tariff: 1, printerPrice: 3500, lifetimeHours: 3000, laborMinutes: 10, laborRate: 20, failurePct: 10, marginPct: 50,
}

describe('cadastro único de trabalhos', () => {
  it('o que vem da Calculadora vira linha com custo por peça e total do lote', () => {
    const l = linhaDeCalc(addSaved([], 'Chaveiro', calc, 'c1', '2026-11-20T10:00:00Z')[0])
    expect(l.origem).toBe('calculo'); expect(l.pieces).toBe(4)
    expect(l.total).toBeGreaterThan(l.unit)
  })
  it('o que vem do Produto com partes mostra itens comprados na composição', () => {
    const l = linhaDeProduto(addSavedProduct([], 'Chaveiro Flamengo', prodInput, 'p1', '2026-11-21T10:00:00Z')[0])
    expect(l.origem).toBe('produto'); expect(l.comp.bought).toBe(150); expect(l.unit).toBe(l.total)
  })
  it('junta as duas origens, mais nova primeiro', () => {
    const c = addSaved([], 'A', calc, 'c1', '2026-11-20T10:00:00Z')
    const p = addSavedProduct([], 'B', prodInput, 'p1', '2026-11-21T10:00:00Z')
    expect(todasAsLinhas(c, p).map((x) => x.id)).toEqual(['p1', 'c1'])
  })
})
