// Marcas e cores cadastradas pela própria pessoa (além das sugestões). O cadastro rápido pede só o nome.
import { foldText, titleCase } from './texto'

export interface Brand { id: string; name: string; site: string; nozzleC?: number; bedC?: number }
export type BrandDraft = Omit<Brand, 'id'>
export const MAX_BRANDS = 100

export function validateBrand(d: BrandDraft): string[] {
  const e: string[] = []
  if (!d.name.trim()) e.push('Dê um nome à marca.')
  if (d.name.trim().length > 30) e.push('Nome da marca com até 30 letras.')
  if (d.site.length > 120) e.push('Site com até 120 letras.')
  for (const [v, max, label] of [[d.nozzleC, 500, 'bico'], [d.bedC, 200, 'mesa']] as const) {
    if (v !== undefined && !(Number.isInteger(v) && v >= 0 && v <= max)) e.push(`Temperatura da ${label} deve ser um número inteiro entre 0 e ${max}.`)
  }
  return e
}

export const normalizeBrand = (d: BrandDraft): BrandDraft => ({ ...d, name: titleCase(d.name), site: d.site.trim() })

export function addBrand(list: Brand[], d: BrandDraft, id: string): Brand[] {
  const e = validateBrand(d)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_BRANDS) throw new Error(`Limite de ${MAX_BRANDS} marcas. Exclua alguma.`)
  const n = normalizeBrand(d)
  if (list.some((b) => foldText(b.name) === foldText(n.name))) throw new Error('Você já cadastrou essa marca.')
  const b: Brand = { id, name: n.name, site: n.site, ...(d.nozzleC !== undefined ? { nozzleC: d.nozzleC } : {}), ...(d.bedC !== undefined ? { bedC: d.bedC } : {}) }
  return [...list, b].sort((a, c) => a.name.localeCompare(c.name, 'pt-BR'))
}

const isBrand = (x: any): x is Brand => !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.site === 'string' && validateBrand(x).length === 0
export function parseBrands(raw: string | null): Brand[] {
  if (!raw) return []
  try { const d = JSON.parse(raw); return Array.isArray(d) ? d.filter(isBrand).slice(0, MAX_BRANDS) : [] } catch { return [] }
}

export interface Color { id: string; name: string }
export type ColorDraft = Omit<Color, 'id'>
export const MAX_COLORS = 100

export function validateColor(d: ColorDraft): string[] {
  const e: string[] = []
  if (!d.name.trim()) e.push('Dê um nome à cor.')
  if (d.name.trim().length > 30) e.push('Nome da cor com até 30 letras.')
  return e
}

export function addColor(list: Color[], d: ColorDraft, id: string): Color[] {
  const e = validateColor(d)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_COLORS) throw new Error(`Limite de ${MAX_COLORS} cores. Exclua alguma.`)
  const name = titleCase(d.name)
  if (list.some((c) => foldText(c.name) === foldText(name))) throw new Error('Você já cadastrou essa cor.')
  return [...list, { id, name }].sort((a, c) => a.name.localeCompare(c.name, 'pt-BR'))
}

const isColor = (x: any): x is Color => !!x && typeof x.id === 'string' && typeof x.name === 'string' && validateColor(x).length === 0
export function parseColors(raw: string | null): Color[] {
  if (!raw) return []
  try { const d = JSON.parse(raw); return Array.isArray(d) ? d.filter(isColor).slice(0, MAX_COLORS) : [] } catch { return [] }
}
