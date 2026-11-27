import type { CostInput } from './domain/cost'
import { addSaved, fromCloudRows, type SavedCalc } from './domain/saved'
import { parseFilaments, validateFilament, type Filament, type FilamentDraft } from './domain/filament'
import { validatePrinter, type UserPrinter, type UserPrinterDraft } from './domain/printers'
import { addSavedProduct, productsFromRows, type ProductInput, type SavedProduct } from './domain/product'

// Só o que usamos do cliente do Supabase, para poder testar sem rede.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = { from: (table: string) => any }

const limitMsg = (what: string, max: number, e: { message?: string }, fallback: string) =>
  /limite/i.test(e.message ?? '') ? `Limite de ${max} ${what} na nuvem. Exclua algum.` : fallback

export function createCloud(db: Db) {
  return {
    filaments: {
      async list(): Promise<Filament[]> {
        const { data, error } = await db.from('filamentos')
          .select('id, nome, fornecedor, material, cor, preco_centavos, peso_g, comprado_em').order('comprado_em', { ascending: false })
        if (error) throw new Error('Não foi possível carregar os filamentos da nuvem.')
        const rows = (data ?? []).map((r: any) => ({ id: r.id, name: r.nome, supplier: r.fornecedor, material: r.material, color: r.cor,
          priceCents: r.preco_centavos, weightG: r.peso_g, boughtAt: r.comprado_em }))
        return parseFilaments(JSON.stringify(rows))
      },
      async save(d: FilamentDraft): Promise<void> {
        const e = validateFilament(d)
        if (e.length) throw new Error(e[0])
        const { error } = await db.from('filamentos').insert({ nome: d.name.trim(), fornecedor: d.supplier.trim(), material: d.material,
          cor: d.color.trim(), preco_centavos: d.priceCents, peso_g: d.weightG, comprado_em: d.boughtAt })
        if (error) throw new Error(limitMsg('filamentos', 100, error, 'Não foi possível salvar o filamento na nuvem.'))
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('filamentos').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir o filamento na nuvem.')
      },
    },
    products: {
      async list(): Promise<SavedProduct[]> {
        const { data, error } = await db.from('produtos').select('id, nome, entrada, criado_em').order('criado_em', { ascending: false })
        if (error) throw new Error('Não foi possível carregar os produtos da nuvem.')
        return productsFromRows(data ?? [])
      },
      async save(d: { name: string; input: ProductInput }): Promise<void> {
        const [v] = addSavedProduct([], d.name, d.input, 'novo', new Date().toISOString())
        const { error } = await db.from('produtos').insert({ nome: v.name, entrada: v.input })
        if (error) throw new Error(limitMsg('produtos', 50, error, 'Não foi possível salvar o produto na nuvem.'))
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('produtos').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir o produto na nuvem.')
      },
    },
    printers: {
      async list(): Promise<UserPrinter[]> {
        const { data, error } = await db.from('impressoras').select('id, nome, dados').order('criado_em', { ascending: true })
        if (error) throw new Error('Não foi possível carregar as impressoras da nuvem.')
        return (data ?? []).map((r: any) => ({ id: r.id, name: r.nome, watts: r.dados?.watts, priceCents: r.dados?.priceCents, lifetimeHours: r.dados?.lifetimeHours }))
          .filter((p: UserPrinter) => validatePrinter(p).length === 0)
      },
      async save(d: UserPrinterDraft): Promise<void> {
        const e = validatePrinter(d)
        if (e.length) throw new Error(e[0])
        const { error } = await db.from('impressoras').insert({ nome: d.name.trim(), dados: { watts: d.watts, priceCents: d.priceCents, lifetimeHours: d.lifetimeHours } })
        if (error) throw new Error(limitMsg('impressoras', 20, error, 'Não foi possível salvar a impressora na nuvem.'))
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('impressoras').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir a impressora na nuvem.')
      },
    },
    async list(): Promise<SavedCalc[]> {
      const { data, error } = await db.from('calculos').select('id, nome, entrada, criado_em').order('criado_em', { ascending: false })
      if (error) throw new Error('Não foi possível carregar da nuvem.')
      return fromCloudRows(data ?? [])
    },
    async save(name: string, input: CostInput): Promise<void> {
      const [v] = addSaved([], name, input, 'novo', new Date().toISOString()) // valida nome e campos
      const { error } = await db.from('calculos').insert({ nome: v.name, entrada: v.input })
      if (error) throw new Error(/limite/i.test(error.message ?? '') ? 'Limite de 50 cálculos na nuvem. Exclua algum.' : 'Não foi possível salvar na nuvem.')
    },
    async remove(id: string): Promise<void> {
      const { error } = await db.from('calculos').delete().eq('id', id)
      if (error) throw new Error('Não foi possível excluir na nuvem.')
    },
  }
}
