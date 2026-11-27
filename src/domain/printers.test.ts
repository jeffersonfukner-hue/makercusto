import { describe, expect, it } from 'vitest'
import { addPrinter, CATALOG, cloneFromCatalog, MAX_PRINTERS, parsePrinters, validatePrinter } from './printers'

describe('impressoras', () => {
  it('o catálogo tem fonte em todas as entradas e ids únicos', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(10)
    expect(new Set(CATALOG.map((c) => c.id)).size).toBe(CATALOG.length)
    for (const c of CATALOG) expect(c.source).toMatch(/^https:\/\//)
  })
  it('clonar leva o nome e deixa preço em zero para o usuário preencher', () => {
    const k = CATALOG.find((c) => c.id === 'anycubic-kx')!
    expect(cloneFromCatalog(k, { watts: 150, lifetimeHours: 3000 })).toEqual({ name: 'Anycubic Kobra X', watts: 150, priceCents: 0, lifetimeHours: 3000 })
  })
  it('valida e limita', () => {
    expect(validatePrinter({ name: 'x', watts: 150, priceCents: 350000, lifetimeHours: 3000 })).toEqual([])
    expect(validatePrinter({ name: '', watts: 150, priceCents: 0, lifetimeHours: 3000 })).toHaveLength(1)
    expect(validatePrinter({ name: 'x', watts: -1, priceCents: 0, lifetimeHours: 3000 })).toHaveLength(1)
    expect(validatePrinter({ name: 'x', watts: 1, priceCents: 0, lifetimeHours: 0 })).toHaveLength(1)
    let l = [] as ReturnType<typeof addPrinter>
    for (let i = 0; i < MAX_PRINTERS; i++) l = addPrinter(l, { name: 'p', watts: 1, priceCents: 0, lifetimeHours: 1 }, String(i))
    expect(() => addPrinter(l, { name: 'p', watts: 1, priceCents: 0, lifetimeHours: 1 }, 'x')).toThrow(/Limite/)
  })
  it('lê do armazenamento ignorando lixo', () => {
    const ok = addPrinter([], { name: 'Kobra X', watts: 150, priceCents: 300000, lifetimeHours: 3000 }, 'a')
    expect(parsePrinters(JSON.stringify([...ok, { id: 1 }]))).toHaveLength(1)
    expect(parsePrinters('x')).toEqual([])
  })
})
