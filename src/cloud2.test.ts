import { describe, expect, it, vi } from 'vitest'
import { createCloud } from './cloud'
import { emptyPart } from './domain/product'

const fil = { name: ' PLA preto 001 ', supplier: ' Forn ', material: 'PLA', color: ' preto ', priceCents: 6800, weightG: 1000, boughtAt: '2026-11-20' }

function fake(result: { data?: unknown; error?: { message: string } | null } = {}) {
  const insert = vi.fn(async () => ({ error: result.error ?? null }))
  const eq = vi.fn(async () => ({ error: result.error ?? null }))
  const order = vi.fn(async () => ({ data: result.data ?? [], error: result.error ?? null }))
  const select = vi.fn(() => ({ order }))
  const from = vi.fn(() => ({ select, insert, delete: () => ({ eq }) }))
  return { db: { from }, insert, eq, order, select, from }
}

describe('nuvem: filamentos', () => {
  it('salva com os nomes das colunas e sem user_id', async () => {
    const f = fake(); await createCloud(f.db).filaments.save(fil)
    expect(f.from).toHaveBeenCalledWith('filamentos')
    expect(f.insert).toHaveBeenCalledWith({ nome: 'PLA preto 001', fornecedor: 'Forn', material: 'PLA', cor: 'preto', preco_centavos: 6800, peso_g: 1000, comprado_em: '2026-11-20' })
  })
  it('valida antes de chamar a rede', async () => {
    const f = fake()
    await expect(createCloud(f.db).filaments.save({ ...fil, priceCents: 0 })).rejects.toThrow('preço')
    expect(f.insert).not.toHaveBeenCalled()
  })
  it('lista convertendo as colunas e ignorando linhas inválidas', async () => {
    const f = fake({ data: [
      { id: 'a', nome: 'PLA preto 002', fornecedor: '', material: 'PLA', cor: 'preto', preco_centavos: 7500, peso_g: 1000, comprado_em: '2026-11-20' },
      { id: 'b', nome: '', fornecedor: '', material: 'PLA', cor: '', preco_centavos: 1, peso_g: 1, comprado_em: '2026-11-20' },
    ] })
    const l = await createCloud(f.db).filaments.list()
    expect(l.map((x) => [x.id, x.priceCents])).toEqual([['a', 7500]])
  })
  it('traduz limite e outros erros', async () => {
    await expect(createCloud(fake({ error: { message: 'Limite de 100 registros por pessoa.' } }).db).filaments.save(fil)).rejects.toThrow('Limite de 100')
    await expect(createCloud(fake({ error: { message: 'x' } }).db).filaments.remove('a')).rejects.toThrow('excluir')
  })
})

describe('nuvem: impressoras', () => {
  it('salva e lista', async () => {
    const f = fake({ data: [{ id: 'p', nome: 'Kobra X', dados: { watts: 150, priceCents: 300000, lifetimeHours: 3000 } }, { id: 'q', nome: 'ruim', dados: {} }] })
    const c = createCloud(f.db).printers
    await c.save({ name: ' Kobra X ', watts: 150, priceCents: 300000, lifetimeHours: 3000 })
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Kobra X', dados: { watts: 150, priceCents: 300000, lifetimeHours: 3000 } })
    expect((await c.list()).map((p) => p.id)).toEqual(['p'])
  })
})

describe('nuvem: produtos', () => {
  const input = {
    parts: [{ ...emptyPart(), name: 'Brasão', hours: 0.6, lines: [{ color: 'vermelho', pricePerKg: 68, modelG: 1, flushedG: 1, towerG: 0 }] }], bought: [],
    watts: 150, tariff: 1.03, printerPrice: 3500, lifetimeHours: 3000, laborMinutes: 10, laborRate: 20, failurePct: 10, marginPct: 50,
  }
  it('salva nome e entrada, valida antes', async () => {
    const f = fake(); const c = createCloud(f.db).products
    await c.save({ name: ' Caneca ', input })
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Caneca', entrada: input })
    await expect(c.save({ name: '', input })).rejects.toThrow('nome')
    await expect(c.save({ name: 'x', input: { ...input, parts: [] } })).rejects.toThrow()
  })
  it('lista ignorando entradas inválidas', async () => {
    const f = fake({ data: [{ id: 'a', nome: 'Caneca', entrada: input, criado_em: '2026-11-27T10:00:00Z' }, { id: 'b', nome: 'Ruim', entrada: { parts: [] }, criado_em: '2026-11-27T10:00:00Z' }] })
    expect((await createCloud(f.db).products.list()).map((p) => p.id)).toEqual(['a'])
  })
})
