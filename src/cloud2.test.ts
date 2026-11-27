import { describe, expect, it, vi } from 'vitest'
import { createCloud } from './cloud'
import { emptyPart } from './domain/product'

const fil = { name: ' PLA preto 001 ', supplier: ' Forn ', brand: ' Masterprint ', material: 'PLA', color: ' preto ', priceCents: 6800, weightG: 1000, boughtAt: '2026-11-20' }

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
    expect(f.insert).toHaveBeenCalledWith({ nome: 'PLA Preto 001', fornecedor: 'Forn', marca: 'Masterprint', material: 'PLA', cor: 'Preto', preco_centavos: 6800, peso_g: 1000, comprado_em: '2026-11-20', temp_bico: null, temp_mesa: null })
  })
  it('valida antes de chamar a rede', async () => {
    const f = fake()
    await expect(createCloud(f.db).filaments.save({ ...fil, priceCents: 0 })).rejects.toThrow('preço')
    expect(f.insert).not.toHaveBeenCalled()
  })
  it('lista convertendo as colunas e ignorando linhas inválidas', async () => {
    const f = fake({ data: [
      { id: 'a', nome: 'PLA preto 002', fornecedor: '', marca: '', material: 'PLA', cor: 'preto', preco_centavos: 7500, peso_g: 1000, comprado_em: '2026-11-20' },
      { id: 'b', nome: '', fornecedor: '', marca: '', material: 'PLA', cor: '', preco_centavos: 1, peso_g: 1, comprado_em: '2026-11-20' },
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
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Caneca', entrada: { ...input, tipo: 'produto' } })
    await c.save({ name: 'Base', input, kind: 'parte' })
    expect(f.insert).toHaveBeenLastCalledWith({ nome: 'Base', entrada: { ...input, tipo: 'parte' } })
    await expect(c.save({ name: '', input })).rejects.toThrow('nome')
    await expect(c.save({ name: 'x', input: { ...input, parts: [] } })).rejects.toThrow()
  })
  it('lista ignorando entradas inválidas', async () => {
    const f = fake({ data: [{ id: 'a', nome: 'Caneca', entrada: input, criado_em: '2026-11-27T10:00:00Z' }, { id: 'b', nome: 'Ruim', entrada: { parts: [] }, criado_em: '2026-11-27T10:00:00Z' }] })
    expect((await createCloud(f.db).products.list()).map((p) => p.id)).toEqual(['a'])
  })
})

describe('nuvem: fornecedores, estoque e lista de espera', () => {
  it('fornecedores: salva com colunas em português e lista', async () => {
    const f = fake({ data: [{ id: 'a', nome: 'Masterprint', contato: '', site: '', obs: '' }, { id: 'b', nome: '', contato: '', site: '', obs: '' }] })
    const c = createCloud(f.db).suppliers
    await c.save({ name: ' Masterprint ', contact: '', site: '', notes: '' })
    expect(f.from).toHaveBeenCalledWith('fornecedores')
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Masterprint', contato: '', site: '', obs: '' })
    expect((await c.list()).map((x) => x.id)).toEqual(['a'])
    await expect(c.save({ name: '', contact: '', site: '', notes: '' })).rejects.toThrow('nome')
  })
  it('estoque: salva, lista e atualiza a quantidade', async () => {
    const update = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }))
    const f = fake({ data: [{ id: 'a', nome: 'Copo', categoria: '', fornecedor: '', qtd: 10, minimo: 2, custo_centavos: 1250 }] })
    const db = { from: vi.fn(() => ({ select: f.select, insert: f.insert, update, delete: () => ({ eq: f.eq }) })) }
    const c = createCloud(db).supplies
    await c.save({ name: 'Copo', category: '', supplier: '', qty: 10, min: 2, costCents: 1250 })
    expect(f.insert).toHaveBeenCalledWith({ nome: 'Copo', categoria: '', fornecedor: '', qtd: 10, minimo: 2, custo_centavos: 1250 })
    const [item] = await c.list()
    expect(item).toEqual({ id: 'a', name: 'Copo', category: '', supplier: '', qty: 10, min: 2, costCents: 1250 })
    await c.update('a', { ...item, qty: 9 })
    expect(update).toHaveBeenCalledWith({ nome: 'Copo', categoria: '', fornecedor: '', qtd: 9, minimo: 2, custo_centavos: 1250 })
    await expect(c.save({ name: 'x', category: '', supplier: '', qty: -1, min: 0, costCents: 1 })).rejects.toThrow()
  })
  it('lista de espera: valida o e-mail, normaliza e trata repetido como sucesso', async () => {
    const f = fake(); const w = createCloud(f.db).waitlist
    await expect(w.join('sem-arroba')).rejects.toThrow('e-mail')
    expect(f.insert).not.toHaveBeenCalled()
    await w.join('  Pessoa@Exemplo.com ')
    expect(f.insert).toHaveBeenCalledWith({ email: 'pessoa@exemplo.com' })
    const dup = { ...fake().db, from: () => ({ insert: async () => ({ error: { code: '23505', message: 'duplicate' } }) }) }
    await expect(createCloud(dup).waitlist.join('a@b.co')).resolves.toBeUndefined()
    const bad = { from: () => ({ insert: async () => ({ error: { code: '500', message: 'x' } }) }) }
    await expect(createCloud(bad).waitlist.join('a@b.co')).rejects.toThrow('Não foi possível')
  })
})
