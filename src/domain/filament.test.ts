import { describe, expect, it } from 'vitest'
import { addFilament, filamentLabel, MAX_FILAMENTS, parseFilaments, pricePerKg, removeFilament, validateFilament, type FilamentDraft } from './filament'

const base: FilamentDraft = { name: 'PLA preto 001', supplier: 'Fornecedor X', brand: 'Masterprint', material: 'PLA', color: 'preto', priceCents: 6800, weightG: 1000, boughtAt: '2026-10-01' }

describe('filamentos: marca e temperatura', () => {
  it('guarda marca e temperaturas opcionais', () => {
    const [f] = addFilament([], { ...base, nozzleC: 210, bedC: 60 }, 'a')
    expect([f.brand, f.nozzleC, f.bedC]).toEqual(['Masterprint', 210, 60])
    expect('nozzleC' in addFilament([], base, 'b')[0]).toBe(false)
  })
  it('valida temperatura', () => {
    expect(validateFilament({ ...base, nozzleC: 600 })).toHaveLength(1)
    expect(validateFilament({ ...base, bedC: -1 })).toHaveLength(1)
    expect(validateFilament({ ...base, nozzleC: 210.5 })).toHaveLength(1)
  })
  it('cadastro antigo, sem marca, ainda é lido', () => {
    const old = { id: 'a', name: 'PLA', supplier: '', material: 'PLA', color: '', priceCents: 6800, weightG: 1000, boughtAt: '2026-10-01' }
    expect(parseFilaments(JSON.stringify([old]))[0].brand).toBe('')
  })
})

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
    expect(filamentLabel(f)).toMatch(/^PLA Preto 001 · PLA Preto · R\$\s68,00\/kg$/)
  })
})

import { generateName, lastPurchase, lastTemps, normalizeFilament } from './filament'

describe('padrão de escrita e nome gerado', () => {
  const mk = (over: Partial<FilamentDraft>, id: string, l: ReturnType<typeof addFilament> = []) => addFilament(l, { ...base, ...over }, id)
  it('salva nome, fornecedor, marca e cor em "Título"', () => {
    const [f] = mk({ name: 'pla preto fosco', supplier: 'loja DO joão', brand: 'MASTERPRINT', color: 'preto FOSCO' }, 'a')
    expect(f).toMatchObject({ name: 'PLA Preto Fosco', supplier: 'Loja do João', brand: 'Masterprint', color: 'Preto Fosco' })
    expect(normalizeFilament({ ...base, color: 'azul bebê' }).color).toBe('Azul Bebê')
  })
  it('nome = material + cor + marca + código, e o código sobe por combinação', () => {
    const p = { material: 'PLA', color: 'preto fosco', brand: 'Masterprint' }
    expect(generateName([], p)).toBe('PLA Preto Fosco Masterprint 001')
    const l = mk({ name: 'PLA Preto Fosco Masterprint 001' }, 'a')
    expect(generateName(l, p)).toBe('PLA Preto Fosco Masterprint 002')
    expect(generateName(l, { ...p, color: 'azul' })).toBe('PLA Azul Masterprint 001')
    const l2 = mk({ name: 'PLA Preto Fosco Masterprint 007' }, 'b', l)
    expect(generateName(l2, p)).toBe('PLA Preto Fosco Masterprint 008')
  })
  it('sem cor, sem marca ou material "Outro", o nome continua útil', () => {
    expect(generateName([], { material: 'PETG', color: '', brand: '' })).toBe('PETG 001')
    expect(generateName([], { material: 'Outro', color: 'verde', brand: '' })).toBe('Verde 001')
    expect(generateName([], { material: 'Outro', color: '', brand: '' })).toBe('Filamento 001')
  })
  it('nome personalizado não atrapalha o código dos automáticos', () => {
    const l = mk({ name: 'PLA Preto do Zé' }, 'a')
    expect(generateName(l, { material: 'PLA', color: 'preto', brand: '' })).toBe('PLA Preto 001')
  })
})

describe('último preço do fornecedor', () => {
  const l1 = addFilament([], { ...base, name: 'A', supplier: 'Loja X', brand: 'Masterprint', color: 'Preto', priceCents: 6800, boughtAt: '2026-09-01' }, 'a')
  const l2 = addFilament(l1, { ...base, name: 'B', supplier: 'Loja X', brand: 'Masterprint', color: 'Preto', priceCents: 7500, boughtAt: '2026-11-01' }, 'b')
  const l3 = addFilament(l2, { ...base, name: 'C', supplier: 'Loja X', brand: 'Sunlu', material: 'PETG', color: 'Azul', priceCents: 9000, weightG: 750, boughtAt: '2026-10-01' }, 'c')
  it('pega a compra mais recente da mesma combinação', () => {
    expect(lastPurchase(l3, { supplier: 'loja x', brand: 'masterprint', material: 'PLA', color: 'preto' })?.priceCents).toBe(7500)
  })
  it('sem a mesma combinação, usa a mais parecida do fornecedor, e por fim a mais recente dele', () => {
    expect(lastPurchase(l3, { supplier: 'Loja X', brand: 'Masterprint', material: 'PLA', color: 'Rosa' })?.priceCents).toBe(7500)
    expect(lastPurchase(l3, { supplier: 'Loja X', brand: 'Outra', material: 'PETG', color: 'Rosa' })?.priceCents).toBe(9000)
    expect(lastPurchase(l3, { supplier: 'Loja X', brand: '', material: 'ABS', color: '' })?.priceCents).toBe(7500)
  })
  it('sem fornecedor ou fornecedor desconhecido não sugere nada', () => {
    expect(lastPurchase(l3, { supplier: '', brand: '', material: 'PLA', color: '' })).toBeUndefined()
    expect(lastPurchase(l3, { supplier: 'Outra Loja', brand: '', material: 'PLA', color: '' })).toBeUndefined()
  })
  it('temperaturas: da última compra da mesma marca e material', () => {
    const t = addFilament(l3, { ...base, name: 'D', supplier: 'Y', brand: 'Sunlu', material: 'PETG', nozzleC: 240, bedC: 80, boughtAt: '2026-11-10' }, 'd')
    expect(lastTemps(t, { brand: 'sunlu', material: 'PETG' })).toEqual({ nozzleC: 240, bedC: 80 })
    expect(lastTemps(t, { brand: 'Masterprint', material: 'PLA' })).toBeUndefined()
  })
})
