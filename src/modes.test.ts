import { describe, expect, it } from 'vitest'
import { calculateCost, type CostInput } from './domain/cost'
import { ESSENTIAL, inputForMode } from './modes'

const input: CostInput = {
  grams: 100, pricePerKg: 100, hours: 10, watts: 200, tariff: 1, printerPrice: 3000, lifetimeHours: 3000,
  laborMinutes: 30, laborRate: 20, failurePct: 20, quantity: 4, marginPct: 50, soldPrice: 25,
}

describe('modos', () => {
  it('básico ignora o preço praticado e usa o sugerido', () => {
    const r = calculateCost(inputForMode(input, 'basico'))
    expect(r.priceIsSuggested).toBe(true)
    expect(r.price).toBe(2000)
  })
  it('avançado mantém o preço praticado', () => {
    expect(calculateCost(inputForMode(input, 'avancado')).price).toBe(2500)
  })
  it('o custo é igual nos dois modos', () => {
    expect(calculateCost(inputForMode(input, 'basico')).unit).toBe(calculateCost(inputForMode(input, 'avancado')).unit)
  })
  it('campos essenciais existem e não incluem o preço praticado', () => {
    for (const k of ESSENTIAL) expect(k in input).toBe(true)
    expect((ESSENTIAL as readonly string[]).includes('soldPrice')).toBe(false)
  })
})
