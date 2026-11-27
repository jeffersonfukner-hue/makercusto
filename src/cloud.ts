import type { CostInput } from './domain/cost'
import { addSaved, fromCloudRows, type Kind, type SavedCalc } from './domain/saved'
import { normalizeFilament, parseFilaments, validateFilament, type Filament, type FilamentDraft } from './domain/filament'
import { normalizeBrand, parseBrands, parseColors, validateBrand, validateColor, type Brand, type BrandDraft, type Color, type ColorDraft } from './domain/marca'
import { titleCase } from './domain/texto'
import { validatePrinter, type UserPrinter, type UserPrinterDraft } from './domain/printers'
import { validateSupplier, type Supplier, type SupplierDraft } from './domain/supplier'
import { normalizeSupply, validateSupply, type Supply, type SupplyDraft } from './domain/supply'
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
          .select('id, nome, fornecedor, marca, material, cor, preco_centavos, peso_g, comprado_em, temp_bico, temp_mesa').order('comprado_em', { ascending: false })
        if (error) throw new Error('Não foi possível carregar os filamentos da nuvem.')
        const rows = (data ?? []).map((r: any) => ({ id: r.id, name: r.nome, supplier: r.fornecedor, brand: r.marca ?? '', material: r.material, color: r.cor,
          priceCents: r.preco_centavos, weightG: r.peso_g, boughtAt: r.comprado_em,
          ...(r.temp_bico != null ? { nozzleC: r.temp_bico } : {}), ...(r.temp_mesa != null ? { bedC: r.temp_mesa } : {}) }))
        return parseFilaments(JSON.stringify(rows))
      },
      async save(d: FilamentDraft): Promise<void> {
        const e = validateFilament(d)
        if (e.length) throw new Error(e[0])
        const n = normalizeFilament(d)
        const { error } = await db.from('filamentos').insert({ nome: n.name, fornecedor: n.supplier, marca: n.brand, material: n.material,
          cor: n.color, preco_centavos: n.priceCents, peso_g: n.weightG, comprado_em: n.boughtAt,
          temp_bico: n.nozzleC ?? null, temp_mesa: n.bedC ?? null })
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
    suppliers: {
      async list(): Promise<Supplier[]> {
        const { data, error } = await db.from('fornecedores').select('id, nome, contato, site, obs').order('nome', { ascending: true })
        if (error) throw new Error('Não foi possível carregar os fornecedores da nuvem.')
        return (data ?? []).map((r: any) => ({ id: r.id, name: r.nome, contact: r.contato, site: r.site, notes: r.obs }))
          .filter((x: Supplier) => validateSupplier(x).length === 0)
      },
      async save(d: SupplierDraft): Promise<void> {
        const e = validateSupplier(d)
        if (e.length) throw new Error(e[0])
        const { error } = await db.from('fornecedores').insert({ nome: titleCase(d.name), contato: d.contact.trim(), site: d.site.trim(), obs: d.notes.trim() })
        if (error) throw new Error(limitMsg('fornecedores', 50, error, 'Não foi possível salvar o fornecedor na nuvem.'))
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('fornecedores').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir o fornecedor na nuvem.')
      },
    },
    supplies: {
      async list(): Promise<Supply[]> {
        const { data, error } = await db.from('insumos').select('id, nome, categoria, fornecedor, qtd, minimo, custo_centavos').order('nome', { ascending: true })
        if (error) throw new Error('Não foi possível carregar o estoque da nuvem.')
        return (data ?? []).map((r: any) => ({ id: r.id, name: r.nome, category: r.categoria, supplier: r.fornecedor, qty: r.qtd, min: r.minimo, costCents: r.custo_centavos }))
          .filter((x: Supply) => validateSupply(x).length === 0)
      },
      async save(d: SupplyDraft): Promise<void> {
        const e = validateSupply(d)
        if (e.length) throw new Error(e[0])
        const n = normalizeSupply(d)
        const { error } = await db.from('insumos').insert({ nome: n.name, categoria: n.category, fornecedor: n.supplier, qtd: n.qty, minimo: n.min, custo_centavos: n.costCents })
        if (error) throw new Error(limitMsg('itens', 200, error, 'Não foi possível salvar o item na nuvem.'))
      },
      async update(id: string, s: Supply): Promise<void> {
        const e = validateSupply(s)
        if (e.length) throw new Error(e[0])
        const n = normalizeSupply(s)
        const { error } = await db.from('insumos').update({ nome: n.name, categoria: n.category, fornecedor: n.supplier, qtd: n.qty, minimo: n.min, custo_centavos: n.costCents }).eq('id', id)
        if (error) throw new Error('Não foi possível atualizar o item na nuvem.')
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('insumos').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir o item na nuvem.')
      },
    },
    brands: {
      async list(): Promise<Brand[]> {
        const { data, error } = await db.from('marcas').select('id, nome, site, temp_bico, temp_mesa').order('nome', { ascending: true })
        if (error) throw new Error('Não foi possível carregar as marcas da nuvem.')
        return parseBrands(JSON.stringify((data ?? []).map((r: any) => ({ id: r.id, name: r.nome, site: r.site,
          ...(r.temp_bico != null ? { nozzleC: r.temp_bico } : {}), ...(r.temp_mesa != null ? { bedC: r.temp_mesa } : {}) }))))
      },
      async save(d: BrandDraft): Promise<void> {
        const e = validateBrand(d)
        if (e.length) throw new Error(e[0])
        const n = normalizeBrand(d)
        const { error } = await db.from('marcas').insert({ nome: n.name, site: n.site, temp_bico: d.nozzleC ?? null, temp_mesa: d.bedC ?? null })
        if (error?.code === '23505') throw new Error('Você já cadastrou essa marca.')
        if (error) throw new Error(limitMsg('marcas', 100, error, 'Não foi possível salvar a marca na nuvem.'))
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('marcas').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir a marca na nuvem.')
      },
    },
    colors: {
      async list(): Promise<Color[]> {
        const { data, error } = await db.from('cores').select('id, nome').order('nome', { ascending: true })
        if (error) throw new Error('Não foi possível carregar as cores da nuvem.')
        return parseColors(JSON.stringify((data ?? []).map((r: any) => ({ id: r.id, name: r.nome }))))
      },
      async save(d: ColorDraft): Promise<void> {
        const e = validateColor(d)
        if (e.length) throw new Error(e[0])
        const { error } = await db.from('cores').insert({ nome: titleCase(d.name) })
        if (error?.code === '23505') throw new Error('Você já cadastrou essa cor.')
        if (error) throw new Error(limitMsg('cores', 100, error, 'Não foi possível salvar a cor na nuvem.'))
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('cores').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir a cor na nuvem.')
      },
    },
    waitlist: {
      // Repetido conta como sucesso: a pessoa já está na lista e não precisa saber mais que isso.
      async join(email: string): Promise<void> {
        const e = email.trim().toLowerCase()
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) || e.length > 120) throw new Error('Digite um e-mail válido.')
        const { error } = await db.from('lista_espera').insert({ email: e })
        if (error && error.code !== '23505') throw new Error('Não foi possível entrar na lista agora. Tente de novo em instantes.')
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
        const { error } = await db.from('impressoras').insert({ nome: titleCase(d.name).slice(0, 60), dados: { watts: d.watts, priceCents: d.priceCents, lifetimeHours: d.lifetimeHours } })
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
    async save(name: string, input: CostInput, kind: Kind = 'produto'): Promise<void> {
      const [v] = addSaved([], name, input, 'novo', new Date().toISOString(), kind) // valida nome e campos
      const { error } = await db.from('calculos').insert({ nome: v.name, entrada: { ...v.input, tipo: kind } })
      if (error) throw new Error(/limite/i.test(error.message ?? '') ? 'Limite de 50 cálculos na nuvem. Exclua algum.' : 'Não foi possível salvar na nuvem.')
    },
    async remove(id: string): Promise<void> {
      const { error } = await db.from('calculos').delete().eq('id', id)
      if (error) throw new Error('Não foi possível excluir na nuvem.')
    },
  }
}
