import type { CostInput } from './domain/cost'
import { addSaved, fromCloudRows, type SavedCalc } from './domain/saved'

// Só o que usamos do cliente do Supabase, para poder testar sem rede.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = { from: (table: string) => any }

export function createCloud(db: Db) {
  return {
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
