import { describe, expect, it } from 'vitest'
import { addSupplier, MAX_SUPPLIERS, parseSuppliers, validateSupplier } from './supplier'

const d = { name: 'Masterprint', contact: '(43) 99999-0000', site: 'https://exemplo.com', notes: '' }

describe('fornecedores', () => {
  it('cadastra em ordem alfabética e recusa nome repetido', () => {
    const l = addSupplier(addSupplier([], { ...d, name: 'Voolt3D' }, 'b'), d, 'a')
    expect(l.map((s) => s.name)).toEqual(['Masterprint', 'Voolt3D'])
    expect(() => addSupplier(l, { ...d, name: ' masterprint ' }, 'c')).toThrow(/já existe/i)
  })
  it('valida e limita', () => {
    expect(validateSupplier({ ...d, name: '' })).toHaveLength(1)
    expect(validateSupplier({ ...d, notes: 'x'.repeat(201) })).toHaveLength(1)
    let l = [] as ReturnType<typeof addSupplier>
    for (let i = 0; i < MAX_SUPPLIERS; i++) l = addSupplier(l, { ...d, name: `f${i}` }, String(i))
    expect(() => addSupplier(l, { ...d, name: 'extra' }, 'x')).toThrow(/Limite/)
  })
  it('lê do armazenamento ignorando lixo', () => {
    expect(parseSuppliers(JSON.stringify([...addSupplier([], d, 'a'), { id: 1 }]))).toHaveLength(1)
    expect(parseSuppliers('x')).toEqual([])
  })
})
