import type { CostInput } from './domain/cost'
import { addSaved, fromCloudRows, type SavedCalc } from './domain/saved'
import { parseFilaments, validateFilament, type Filament, type FilamentDraft } from './domain/filament'
import { validatePrinter, type UserPrinter, type UserPrinterDraft } from './domain/printers'
import { validateSupplier, type Supplier, type SupplierDraft } from './domain/supplier'
import { validateSupply, type Supply, type SupplyDraft } from './domain/supply'
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
        const { error } = await db.from('filamentos').insert({ nome: d.name.trim(), fornecedor: d.supplier.trim(), marca: d.brand.trim(), material: d.material,
          cor: d.color.trim(), preco_centavos: d.priceCents, peso_g: d.weightG, comprado_em: d.boughtAt,
          temp_bico: d.nozzleC ?? null, temp_mesa: d.bedC ?? null })
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
        const { error } = await db.from('fornecedores').insert({ nome: d.name.trim(), contato: d.contact.trim(), site: d.site.trim(), obs: d.notes.trim() })
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
        const { error } = await db.from('insumos').insert({ nome: d.name.trim(), categoria: d.category.trim(), fornecedor: d.supplier.trim(), qtd: d.qty, minimo: d.min, custo_centavos: d.costCents })
        if (error) throw new Error(limitMsg('itens', 200, error, 'Não foi possível salvar o item na nuvem.'))
      },
      async update(id: string, s: Supply): Promise<void> {
        const e = validateSupply(s)
        if (e.length) throw new Error(e[0])
        const { error } = await db.from('insumos').update({ nome: s.name.trim(), categoria: s.category.trim(), fornecedor: s.supplier.trim(), qtd: s.qty, minimo: s.min, custo_centavos: s.costCents }).eq('id', id)
        if (error) throw new Error('Não foi possível atualizar o item na nuvem.')
      },
      async remove(id: string): Promise<void> {
        const { error } = await db.from('insumos').delete().eq('id', id)
        if (error) throw new Error('Não foi possível excluir o item na nuvem.')
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
