// Impressoras. O catálogo traz só dados com fonte (potência nominal e volume do fabricante).
// Consumo médio, preço e vida útil são hipóteses do usuário: o catálogo não os inventa.
export interface CatalogPrinter {
  id: string
  brand: string
  model: string
  volume?: string // mm
  ratedW?: string // potência nominal declarada pelo fabricante (máximo, não média)
  source: string
}

export const CATALOG: CatalogPrinter[] = [
  { id: 'bambu-a1-mini', brand: 'Bambu Lab', model: 'A1 mini', volume: '180 x 180 x 180', ratedW: '150 W (110 V e 220 V)', source: 'https://wiki.bambulab.com/en/general/power-consumption' },
  { id: 'bambu-a1', brand: 'Bambu Lab', model: 'A1', ratedW: '350 W (110 V) ou 1300 W (220 V)', source: 'https://wiki.bambulab.com/en/general/power-consumption' },
  { id: 'bambu-p1s', brand: 'Bambu Lab', model: 'P1S', ratedW: '350 W (110 V) ou 1100 W (220 V)', source: 'https://wiki.bambulab.com/en/general/power-consumption' },
  { id: 'creality-e3v3se', brand: 'Creality', model: 'Ender-3 V3 SE', volume: '220 x 220 x 250', ratedW: '350 W', source: 'https://store.creality.com/blog/ender-3-v3-vs-v3-se-vs-v3-ke' },
  { id: 'creality-e3v3ke', brand: 'Creality', model: 'Ender-3 V3 KE', volume: '220 x 220 x 240', ratedW: '350 W', source: 'https://store.creality.com/blog/ender-3-v3-vs-v3-se-vs-v3-ke' },
  { id: 'anycubic-k2neo', brand: 'Anycubic', model: 'Kobra 2 Neo', volume: '220 x 220 x 250', ratedW: '400 W', source: 'https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison' },
  { id: 'anycubic-k2pro', brand: 'Anycubic', model: 'Kobra 2 Pro', volume: '220 x 220 x 250', ratedW: '400 W', source: 'https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison' },
  { id: 'anycubic-k2plus', brand: 'Anycubic', model: 'Kobra 2 Plus', volume: '320 x 320 x 400', ratedW: '400 W', source: 'https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison' },
  { id: 'anycubic-k2max', brand: 'Anycubic', model: 'Kobra 2 Max', volume: '420 x 420 x 500', ratedW: '500 W', source: 'https://store.anycubic.com/blogs/3d-printing-guides/anycubic-kobra-2-series-specs-and-features-comparison' },
  { id: 'anycubic-kx', brand: 'Anycubic', model: 'Kobra X', volume: '260 x 260 x 260', source: 'https://store.anycubic.com/products/kobra-x' },
  { id: 'elegoo-n4pro', brand: 'Elegoo', model: 'Neptune 4 Pro', volume: '225 x 225 x 265', source: 'https://us.elegoo.com/collections/new-arrivals/products/elegoo-neptune-4-pro-fdm-3d-printer' },
  { id: 'flashforge-ad5mpro', brand: 'Flashforge', model: 'Adventurer 5M Pro', volume: '220 x 220 x 220', ratedW: '350 W em operação', source: 'https://www.cdw.com/product/flashforge-adventurer-5m-pro-3d-printer/8445947' },
]

// Perfil do usuário: é aqui que ficam o consumo medido, o preço pago e a vida útil estimada.
export interface UserPrinter { id: string; name: string; watts: number; priceCents: number; lifetimeHours: number }
export type UserPrinterDraft = Omit<UserPrinter, 'id'>
export const MAX_PRINTERS = 20

export function validatePrinter(d: UserPrinterDraft): string[] {
  const e: string[] = []
  if (!d.name.trim()) e.push('Dê um nome à impressora.')
  if (!Number.isFinite(d.watts) || d.watts < 0 || d.watts > 5000) e.push('Consumo médio entre 0 e 5000 W.')
  if (!Number.isInteger(d.priceCents) || d.priceCents < 0 || d.priceCents > 100_000_000) e.push('Informe o preço pago na impressora (pode ser zero).')
  if (!Number.isFinite(d.lifetimeHours) || d.lifetimeHours <= 0 || d.lifetimeHours > 100000) e.push('Vida útil em horas, maior que zero.')
  return e
}

export function addPrinter(list: UserPrinter[], d: UserPrinterDraft, id: string): UserPrinter[] {
  const e = validatePrinter(d)
  if (e.length) throw new Error(e[0])
  if (list.length >= MAX_PRINTERS) throw new Error(`Limite de ${MAX_PRINTERS} impressoras. Exclua alguma.`)
  return [...list, { id, name: d.name.trim().slice(0, 60), watts: d.watts, priceCents: d.priceCents, lifetimeHours: d.lifetimeHours }]
}

// Clonar do catálogo: leva o nome; consumo, preço e vida útil ficam com os valores de partida do usuário.
export const cloneFromCatalog = (c: CatalogPrinter, base: { watts: number; lifetimeHours: number }): UserPrinterDraft =>
  ({ name: `${c.brand} ${c.model}`, watts: base.watts, priceCents: 0, lifetimeHours: base.lifetimeHours })

const isPrinter = (x: any): x is UserPrinter =>
  !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.watts === 'number' &&
  typeof x.priceCents === 'number' && typeof x.lifetimeHours === 'number' && validatePrinter(x).length === 0

export function parsePrinters(raw: string | null): UserPrinter[] {
  if (!raw) return []
  try { const d = JSON.parse(raw); return Array.isArray(d) ? d.filter(isPrinter).slice(0, MAX_PRINTERS) : [] } catch { return [] }
}
