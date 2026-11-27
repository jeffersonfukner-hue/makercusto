import { describe, expect, it } from 'vitest'
import { calculateCost, validate, type CostInput } from './cost'

const base: CostInput = {
  grams: 100, pricePerKg: 100, hours: 10, watts: 200, tariff: 1,
  printerPrice: 3000, lifetimeHours: 3000, laborMinutes: 30, laborRate: 20,
  failurePct: 20, quantity: 4, marginPct: 50,
}

describe('calculateCost', () => {
  it('soma os componentes em centavos e aplica falhas por 1/(1-taxa)', () => {
    const r = calculateCost(base)
    expect(r.parts).toEqual({ material: 1000, energy: 200, machine: 1000, labor: 1000, failure: 800 })
    expect(r.total).toBe(4000)
    expect(r.unit).toBe(1000)
  })
  it('sugere preço por margem (lucro ÷ preço)', () => {
    const r = calculateCost(base)
    expect(r.suggestedPrice).toBe(2000)
    expect(r.priceIsSuggested).toBe(true)
    expect(r.margin).toBe(0.5)
    expect(r.markup).toBe(1)
  })
  it('usa o preço praticado para lucro, margem, markup e lucro por hora', () => {
    const r = calculateCost({ ...base, soldPrice: 25 })
    expect(r.profitPerUnit).toBe(1500)
    expect(r.margin).toBeCloseTo(0.6)
    expect(r.markup).toBeCloseTo(1.5)
    expect(r.profitPerHour).toBe(600)
  })
  it('arredonda o preço sugerido para cima', () => {
    const r = calculateCost({ ...base, failurePct: 0, quantity: 3, marginPct: 30 })
    expect(r.unit).toBe(1067)
    expect(r.suggestedPrice).toBe(1525)
  })
})

describe('validate', () => {
  it('aceita o caso base', () => expect(validate(base)).toEqual([]))
  it('rejeita valores inválidos', () => {
    expect(validate({ ...base, grams: -1 })).toHaveLength(1)
    expect(validate({ ...base, hours: 0 })).toHaveLength(1)
    expect(validate({ ...base, failurePct: 100 })).toHaveLength(1)
    expect(validate({ ...base, quantity: 1.5 })).toHaveLength(1)
    expect(validate({ ...base, soldPrice: 0 })).toHaveLength(1)
  })
  it('calculateCost lança erro com entrada inválida', () => {
    expect(() => calculateCost({ ...base, marginPct: 100 })).toThrow()
  })
})

describe('itens comprados na calculadora', () => {
  const base = { grams: 100, pricePerKg: 100, hours: 10, watts: 200, tariff: 1, printerPrice: 3000, lifetimeHours: 3000, laborMinutes: 30, laborRate: 20, failurePct: 20, quantity: 4, marginPct: 50 }
  it('sem itens o resultado não muda', () => {
    expect(calculateCost({ ...base, bought: [] })).toEqual(calculateCost(base))
  })
  it('item entra por peça e fica fora da taxa de falhas', () => {
    const a = calculateCost(base)
    const b = calculateCost({ ...base, bought: [{ name: 'Argola', price: 1.5, qty: 2 }] })
    expect(b.unit).toBe(a.unit + 300)
    expect(b.total).toBe(a.total + 300 * 4)
    expect(b.parts.bought).toBe(1200)
  })
  it('valida o item', () => {
    expect(validate({ ...base, bought: [{ name: ' ', price: 1, qty: 1 }] })[0]).toMatch(/Item comprado 1: dê um nome/)
  })
})
