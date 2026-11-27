import { describe, expect, it } from 'vitest'
import { foldText, titleCase } from './texto'

describe('padrão de escrita (titleCase)', () => {
  it('as variações da mesma cor viram uma só', () => {
    for (const s of ['preto fosco', 'Preto fosco', 'PRETO FOSCO', 'preto Fosco', '  preto   fosco  ']) expect(titleCase(s)).toBe('Preto Fosco')
  })
  it('siglas de material ficam em maiúsculas', () => {
    expect(titleCase('pla preto 001')).toBe('PLA Preto 001')
    expect(titleCase('petg-cf azul')).toBe('PETG-CF Azul')
    expect(titleCase('pla+ branco')).toBe('PLA+ Branco')
  })
  it('de, da, e... ficam em minúscula, menos no começo', () => {
    expect(titleCase('cor de rosa')).toBe('Cor de Rosa')
    expect(titleCase('AZUL E ROXO DUAL COLOR')).toBe('Azul e Roxo Dual Color')
    expect(titleCase('e azul')).toBe('E Azul')
  })
  it('respeita nomes com maiúscula no meio e modelos com letra e número', () => {
    expect(titleCase('eSun')).toBe('eSun')
    expect(titleCase('GTMax3D')).toBe('GTMax3D')
    expect(titleCase('ender-3 V3 SE')).toBe('Ender-3 V3 SE')
    expect(titleCase('kobra x')).toBe('Kobra X')
    expect(titleCase('3D Lab')).toBe('3D Lab')
  })
  it('acentos e hífen', () => {
    expect(titleCase('azul bebê')).toBe('Azul Bebê')
    expect(titleCase('arco-íris')).toBe('Arco-Íris')
    expect(titleCase('ímã de geladeira')).toBe('Ímã de Geladeira')
  })
  it('vazio continua vazio', () => { expect(titleCase('   ')).toBe(''); expect(titleCase('')).toBe('') })
  it('foldText ignora acento e maiúscula', () => { expect(foldText('Azul Bebê')).toBe('azul bebe') })
})
