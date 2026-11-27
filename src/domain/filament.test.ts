import { describe, expect, it } from 'vitest'
import { addFilament, filamentLabel, MAX_FILAMENTS, parseFilaments, pricePerKg, removeFilament, validateFilament, type FilamentDraft } from './filament'

const base: FilamentDraft = { name: 'PLA preto 001', supplier: 'Fornecedor X', material: 'PLA', color: 'preto', priceCents: 6800, weightG: 1000, boughtAt: '2026-10-01' }

describe('filamentos', () => {
  it('calcula o preço por kg a partir do rolo', () => {
    expect(pricePerKg({ priceCents: 6800, weightG: 1000 })).toBe(68)
    expect(pricePerKg({ priceCents: 7500, weightG: 1000 })).toBe(75)
    expect(pricePerKg({ priceCents: 4000, weightG: 500 })).toBe(80)
    expect(pricePerKg({ priceCents: 6990, weightG: 750 })).toBe(93.2)
  })
  it('mesmo fornecedor e mesma cor com preços diferentes ficam como registros separados', () => {
    const a = addFilament([], base, 'a')
    const b = addFilament(a, { ...base, name: 'PLA preto 002', priceCents: 7500, boughtAt: '2026-11-20' }, 'b')
    expect(b.map((f) => pricePerKg(f))).toEqual([75, 68])
    expect(b[0].id).toBe('b')
  })
  it('valida campos', () => {
    expect(validateFilament(base)).toEqual([])
    expect(validateFilament({ ...base, name: ' ' })).toHaveLength(1)
    expect(validateFilament({ ...base, priceCents: 0 })).toHaveLength(1)
    expect(validateFilament({ ...base, priceCents: 12.5 })).toHaveLength(1)
    expect(validateFilament({ ...base, weightG: 0 })).toHaveLength(1)
    expect(validateFilament({ ...base, boughtAt: '' })).toHaveLength(1)
    expect(() => addFilament([], { ...base, name: '' }, 'x')).toThrow(/nome/i)
  })
  it('limita a quantidade', () => {
    let l = [] as ReturnType<typeof addFilament>
    for (let i = 0; i < MAX_FILAMENTS; i++) l = addFilament(l, base, String(i))
    expect(() => addFilament(l, base, 'extra')).toThrow(/Limite/)
  })
  it('remove por id', () => {
    const l = addFilament(addFilament([], base, 'a'), { ...base, name: 'outro' }, 'b')
    expect(removeFilament(l, 'a').map((f) => f.id)).toEqual(['b'])
  })
  it('lê do armazenamento ignorando lixo', () => {
    const ok = addFilament([], base, 'a')
    expect(parseFilaments(JSON.stringify([...ok, { id: 1 }, null]))).toHaveLength(1)
    expect(parseFilaments('não é json')).toEqual([])
    expect(parseFilaments(null)).toEqual([])
  })
  it('monta o texto da lista', () => {
    const [f] = addFilament([], base, 'a')
    expect(filamentLabel(f)).toMatch(/^PLA preto 001 · PLA preto · R\$\s68,00\/kg$/)
  })
})
