import { describe, expect, it } from 'vitest'
import { addBrand, addColor, parseBrands, parseColors } from './marca'

describe('marcas próprias', () => {
  it('cadastra no padrão de escrita, em ordem, e recusa repetida', () => {
    const l = addBrand(addBrand([], { name: 'zeta filamentos', site: '' }, 'a'), { name: 'alfa 3d', site: ' alfa.com.br ', nozzleC: 210, bedC: 60 }, 'b')
    expect(l.map((b) => b.name)).toEqual(['Alfa 3D', 'Zeta Filamentos'])
    expect(l[0]).toMatchObject({ site: 'alfa.com.br', nozzleC: 210, bedC: 60 })
    expect(() => addBrand(l, { name: 'ALFA 3D', site: '' }, 'c')).toThrow('já cadastrou')
  })
  it('valida nome e temperaturas', () => {
    expect(() => addBrand([], { name: ' ', site: '' }, 'a')).toThrow('nome')
    expect(() => addBrand([], { name: 'x'.repeat(31), site: '' }, 'a')).toThrow('30')
    expect(() => addBrand([], { name: 'ok', site: '', nozzleC: 900 }, 'a')).toThrow('bico')
    expect(() => addBrand([], { name: 'ok', site: '', bedC: 1.5 }, 'a')).toThrow('mesa')
  })
  it('limite de 100', () => {
    let l = [] as ReturnType<typeof addBrand>
    for (let i = 0; i < 100; i++) l = addBrand(l, { name: `m${i}`, site: '' }, String(i))
    expect(() => addBrand(l, { name: 'extra', site: '' }, 'x')).toThrow('Limite')
  })
  it('lê dado salvo e ignora lixo', () => {
    expect(parseBrands(null)).toEqual([]); expect(parseBrands('{')).toEqual([]); expect(parseBrands('[1,{"id":"a"}]')).toEqual([])
    expect(parseBrands('[{"id":"a","name":"Ok","site":""}]')).toHaveLength(1)
  })
})

describe('cores próprias', () => {
  it('cadastra no padrão, recusa repetida (ignora acento e maiúscula) e valida', () => {
    const l = addColor([], { name: 'azul bebê' }, 'a')
    expect(l[0].name).toBe('Azul Bebê')
    expect(() => addColor(l, { name: 'AZUL BEBE' }, 'b')).toThrow('já cadastrou')
    expect(() => addColor([], { name: '' }, 'a')).toThrow('nome')
    expect(parseColors('[{"id":"a","name":"Rosa"},{"id":"b"}]')).toHaveLength(1)
  })
})
