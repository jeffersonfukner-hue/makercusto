import { describe, expect, it } from 'vitest'
import { BRANDS, COLORS, canonical, mergeOptions, searchOptions } from './catalogo'
import { titleCase } from './texto'

describe('listas de sugestão', () => {
  it('todo nome já está no padrão de escrita e não repete', () => {
    for (const c of COLORS) expect(titleCase(c)).toBe(c)
    for (const b of BRANDS) expect(titleCase(b)).toBe(b)
    expect(new Set(COLORS).size).toBe(COLORS.length)
  })
  it('tem cor simples, acabamento e dual color', () => {
    expect(COLORS).toContain('Preto Fosco'); expect(COLORS).toContain('Azul Bebê'); expect(COLORS).toContain('Azul e Roxo Dual Color'); expect(COLORS).toContain('Dourado Silk')
    expect(COLORS).not.toContain('Transparente Fosco')
  })
  it('busca sem acento e sem maiúscula, quem começa igual vem primeiro', () => {
    expect(searchOptions(COLORS, 'preto fo')[0]).toBe('Preto Fosco')
    expect(searchOptions(COLORS, 'azul bebe')[0]).toBe('Azul Bebê')
    expect(searchOptions(COLORS, 'PRETO')[0]).toBe('Preto')
    expect(searchOptions(COLORS, 'dual roxo').every((c) => c.includes('Roxo') && c.includes('Dual'))).toBe(true)
    expect(searchOptions(COLORS, 'zzzz')).toEqual([])
  })
  it('busca vazia mostra o começo da lista e respeita o limite', () => {
    expect(searchOptions(COLORS, '', 5)).toHaveLength(5)
    expect(searchOptions(COLORS, 'a', 3)).toHaveLength(3)
  })
  it('canonical usa a escrita da lista ou o padrão "Título"', () => {
    expect(canonical(BRANDS, 'ESUN')).toBe('eSun')
    expect(canonical(BRANDS, 'voolt3d')).toBe('Voolt3D')
    expect(canonical(BRANDS, 'minha marca nova')).toBe('Minha Marca Nova')
    expect(canonical(COLORS, '  ')).toBe('')
  })
  it('mergeOptions junta sem repetir e em ordem alfabética', () => {
    expect(mergeOptions(['Zeta', 'Alfa'], ['alfa', 'Beta'])).toEqual(['Alfa', 'Beta', 'Zeta'])
  })
})
