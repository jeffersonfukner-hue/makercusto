import { describe, expect, it, vi } from 'vitest'
import { createCloud } from './cloud'
import type { CostInput } from './domain/cost'

const input: CostInput = {
  grams: 50, pricePerKg: 100, hours: 3, watts: 150, tariff: 1.03, printerPrice: 3500, lifetimeHours: 3000,
  laborMinutes: 10, laborRate: 20, failurePct: 10, quantity: 1, marginPct: 50,
}

function fakeDb(result: { data?: unknown; error?: { message: string } | null }) {
  const insert = vi.fn(async () => ({ error: result.error ?? null }))
  const eq = vi.fn(async () => ({ error: result.error ?? null }))
  const order = vi.fn(async () => ({ data: result.data ?? [], error: result.error ?? null }))
  const from = vi.fn(() => ({ select: () => ({ order }), insert, delete: () => ({ eq }) }))
  return { db: { from }, insert, eq, order, from }
}

describe('cloud', () => {
  it('lista convertendo linhas e ignorando as inválidas', async () => {
    const f = fakeDb({ data: [
      { id: 'a', nome: 'Chaveiro', entrada: input, criado_em: '2026-11-27T10:00:00Z' },
      { id: 'b', nome: 'Quebrado', entrada: { hours: 0 }, criado_em: '2026-11-27T11:00:00Z' },
    ] })
    const list = await createCloud(f.db).list()
    expect(list.map((x) => [x.id, x.name])).toEqual([['a', 'Chaveiro']])
    expect(f.from).toHaveBeenCalledWith('calculos')
    expect(f.order).toHaveBeenCalledWith('criado_em', { ascending: false })
  })
  it('salva só nome e dados, sem user_id (o banco preenche)', async () => {
    const f = fakeDb({})
    await createCloud(f.db).save('  Chaveiro  ', input)
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Chaveiro', entrada: { ...input, tipo: 'produto' } })
  })
  it('grava o tipo parte e o devolve ao listar', async () => {
    const f = fakeDb({})
    await createCloud(f.db).save('Brasão', input, 'parte')
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Brasão', entrada: { ...input, tipo: 'parte' } })
  })
  it('valida antes de chamar a rede', async () => {
    const f = fakeDb({})
    await expect(createCloud(f.db).save('', input)).rejects.toThrow('nome')
    await expect(createCloud(f.db).save('x', { ...input, hours: 0 })).rejects.toThrow()
    expect(f.insert).not.toHaveBeenCalled()
  })
  it('traduz o erro de limite e os demais', async () => {
    await expect(createCloud(fakeDb({ error: { message: 'Limite de 50 cálculos por pessoa.' } }).db).save('x', input)).rejects.toThrow('Limite de 50')
    await expect(createCloud(fakeDb({ error: { message: 'boom' } }).db).save('x', input)).rejects.toThrow('Não foi possível salvar')
    await expect(createCloud(fakeDb({ error: { message: 'boom' } }).db).list()).rejects.toThrow('carregar')
  })
  it('exclui pelo id', async () => {
    const f = fakeDb({})
    await createCloud(f.db).remove('abc')
    expect(f.eq).toHaveBeenCalledWith('id', 'abc')
  })
})
