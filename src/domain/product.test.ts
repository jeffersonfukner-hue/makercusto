import { describe, expect, it } from 'vitest'
import { calculateProduct, validateProduct, type ProductInput } from './product'
import { calculateCost } from './cost'

const shop = { watts: 150, tariff: 1.03, printerPrice: 3500, lifetimeHours: 3000, laborMinutes: 10, laborRate: 20, failurePct: 10, marginPct: 50 }
const line = { color: 'preto', pricePerKg: 100, modelG: 50, flushedG: 0, towerG: 0 }
const one: ProductInput = { ...shop, bought: [], parts: [{ name: 'Peça', hours: 3, piecesPerPrint: 1, perProduct: 1, lines: [line] }] }

describe('produto com partes', () => {
  it('uma parte, sem compras e sem purga, dá o mesmo custo da calculadora simples', () => {
    const p = calculateProduct(one)
    const c = calculateCost({ grams: 50, pricePerKg: 100, hours: 3, ...shop, quantity: 1 })
    expect(p.total).toBe(c.total)
    expect(p.suggestedPrice).toBe(c.suggestedPrice)
  })
  it('purga e torre entram como desperdício e custam filamento', () => {
    const withWaste: ProductInput = { ...one, parts: [{ ...one.parts[0], lines: [{ ...line, modelG: 3.76, flushedG: 3.21, towerG: 0.73 }] }] }
    const p = calculateProduct(withWaste)
    expect(p.grams.model).toBeCloseTo(3.76, 5)
    expect(p.grams.waste).toBeCloseTo(3.94, 5)
    expect(p.wastePct).toBeCloseTo(3.94 / 7.7, 3)
    expect(p.parts[0].waste).toBe(39) // 3,94 g a R$ 100/kg = R$ 0,394
    expect(p.parts[0].material).toBe(38) // 3,76 g = R$ 0,376
  })
  it('várias cores somam, cada uma com seu preço por kg', () => {
    const p = calculateProduct({ ...one, parts: [{ ...one.parts[0], lines: [
      { color: 'preto', pricePerKg: 68, modelG: 100, flushedG: 0, towerG: 0 },
      { color: 'vermelho', pricePerKg: 75, modelG: 100, flushedG: 0, towerG: 0 }] }] })
    expect(p.parts[0].material).toBe(680 + 750)
  })
  it('peças por impressão e por produto dividem o custo da placa', () => {
    const plate = { ...one.parts[0] }
    const four = calculateProduct({ ...one, parts: [{ ...plate, piecesPerPrint: 4 }] })
    const single = calculateProduct(one)
    expect(four.parts[0].material).toBeCloseTo(single.parts[0].material / 4, 0)
    expect(four.machineHours).toBeCloseTo(0.75, 5)
    const two = calculateProduct({ ...one, parts: [{ ...plate, perProduct: 2 }] })
    expect(two.parts[0].material).toBe(single.parts[0].material * 2)
  })
  it('itens comprados somam ao custo e ficam fora da taxa de falhas', () => {
    const base = calculateProduct(one)
    const comp = calculateProduct({ ...one, bought: [{ name: 'Copo de alumínio', price: 12.5, qty: 2 }] })
    expect(comp.bought).toBe(2500)
    expect(comp.total).toBe(base.total + 2500)
    expect(comp.failure).toBe(base.failure)
  })
  it('mão de obra e falhas', () => {
    const p = calculateProduct(one)
    expect(p.labor).toBe(333)
    expect(p.total).toBe(p.parts[0].subtotal + p.labor + p.failure)
  })
  it('preço praticado calcula lucro, margem e markup', () => {
    const p = calculateProduct({ ...one, soldPrice: 40 })
    expect(p.priceIsSuggested).toBe(false)
    expect(p.profit).toBe(4000 - p.total)
    expect(p.margin).toBeCloseTo(p.profit / 4000, 10)
    expect(p.markup).toBeCloseTo(p.profit / p.total, 10)
  })
  it('valida e acusa o que falta', () => {
    expect(validateProduct(one)).toEqual([])
    expect(validateProduct({ ...one, parts: [] })[0]).toMatch(/pelo menos uma parte/)
    expect(validateProduct({ ...one, parts: [{ ...one.parts[0], name: '' }] })[0]).toMatch(/nome/)
    expect(validateProduct({ ...one, parts: [{ ...one.parts[0], hours: 0 }] })[0]).toMatch(/tempo/)
    expect(validateProduct({ ...one, parts: [{ ...one.parts[0], piecesPerPrint: 1.5 }] })[0]).toMatch(/inteiro/)
    expect(validateProduct({ ...one, parts: [{ ...one.parts[0], lines: [{ ...line, modelG: 0 }] }] })[0]).toMatch(/peso/)
    expect(validateProduct({ ...one, bought: [{ name: '', price: 1, qty: 1 }] })[0]).toMatch(/nome/)
    expect(() => calculateProduct({ ...one, failurePct: 100 })).toThrow()
  })
})
