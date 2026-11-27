import { describe, expect, it } from 'vitest'
import { addSupply, isLow, MAX_SUPPLIES, parseSupplies, stockValueCents, validateSupply, withQty, type SupplyDraft } from './supply'

const d: SupplyDraft = { name: 'Copo de alumínio', category: 'Canecas', qty: 10, min: 5, costCents: 1250, supplier: 'Loja X' }

describe('estoque de insumos', () => {
  it('cadastra e ordena por nome', () => {
    const l = addSupply(addSupply([], { ...d, name: 'Ímã' }, 'b'), d, 'a')
    expect(l.map((s) => s.name)).toEqual(['Copo de Alumínio', 'Ímã'])
  })
  it('entrada e saída nunca passam de zero para baixo', () => {
    const [s] = addSupply([], d, 'a')
    expect(withQty(s, s.qty + 5).qty).toBe(15)
    expect(withQty(s, s.qty - 3).qty).toBe(7)
    expect(withQty(s, -4).qty).toBe(0)
  })
  it('avisa estoque baixo só quando há mínimo definido', () => {
    const [s] = addSupply([], d, 'a')
    expect(isLow(s)).toBe(false)
    expect(isLow(withQty(s, 5))).toBe(true)
    expect(isLow({ ...withQty(s, 0), min: 0 })).toBe(false)
  })
  it('soma o valor em estoque em centavos', () => {
    const l = addSupply(addSupply([], d, 'a'), { ...d, name: 'LED', qty: 100, costCents: 35 }, 'b')
    expect(stockValueCents(l)).toBe(10 * 1250 + 100 * 35)
  })
  it('valida e limita', () => {
    expect(validateSupply(d)).toEqual([])
    expect(validateSupply({ ...d, name: '' })).toHaveLength(1)
    expect(validateSupply({ ...d, qty: 1.5 })).toHaveLength(1)
    expect(validateSupply({ ...d, qty: -1 })).toHaveLength(1)
    expect(validateSupply({ ...d, costCents: 0.5 })).toHaveLength(1)
    let l = [] as ReturnType<typeof addSupply>
    for (let i = 0; i < MAX_SUPPLIES; i++) l = addSupply(l, d, String(i))
    expect(() => addSupply(l, d, 'x')).toThrow(/Limite/)
  })
  it('lê do armazenamento ignorando lixo', () => {
    expect(parseSupplies(JSON.stringify([...addSupply([], d, 'a'), null, { id: 'z' }]))).toHaveLength(1)
  })
})
