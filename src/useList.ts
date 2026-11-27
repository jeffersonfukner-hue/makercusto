import { useCallback, useEffect, useState } from 'react'

// Lista que vive na nuvem quando a pessoa está logada e no navegador quando não está.
// `localCount` mostra quantos itens ficaram só no navegador, e `importLocal` os envia para a nuvem.
export interface CloudApi<T, D> { list(): Promise<T[]>; save(d: D): Promise<void>; remove(id: string): Promise<void>; update?(id: string, t: T): Promise<void> }
export function useList<T extends { id: string }, D>(o: {
  read: () => T[]; write: (l: T[]) => void; user: string | null
  api: CloudApi<T, D> | null; addLocal: (l: T[], d: D, id: string) => T[]; toDraft: (t: T) => D
}) {
  const [items, setItems] = useState<T[]>(o.read)
  const [local, setLocal] = useState<T[]>(o.read)
  const [msg, setMsg] = useState('')
  const online = !!(o.user && o.api)

  const reload = useCallback(async () => {
    if (!(o.user && o.api)) { setItems(o.read()); return }
    try { setItems(await o.api.list()); setMsg('') } catch (e) { setMsg((e as Error).message) }
  }, [o.user, o.api]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void reload(); setLocal(o.read()) }, [reload]) // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (d: D) => {
    if (online) { await o.api!.save(d); await reload(); return }
    const next = o.addLocal(items, d, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    setItems(next); o.write(next)
  }
  // Aceita um id ou vários (ex.: todas as versões de um produto) e grava uma vez só.
  const remove = async (ids: string | string[]) => {
    const list = Array.isArray(ids) ? ids : [ids]
    if (!online) { const next = items.filter((x) => !list.includes(x.id)); setItems(next); o.write(next); return }
    try { for (const id of list) await o.api!.remove(id); await reload() } catch (e) { setMsg((e as Error).message) }
  }
  // Troca um item inteiro (ex.: nova quantidade em estoque).
  const update = async (next: T) => {
    if (!online) { const l = items.map((x) => (x.id === next.id ? next : x)); setItems(l); o.write(l); return }
    try { await o.api!.update?.(next.id, next); await reload() } catch (e) { setMsg((e as Error).message) }
  }
  const importLocal = async () => {
    if (!online) return
    let sent = 0
    try {
      for (const t of [...local].reverse()) { await o.api!.save(o.toDraft(t)); sent++ }
      o.write([]); setLocal([]); setMsg(`${sent} enviados para a nuvem.`)
    } catch (e) {
      const rest = local.slice(0, local.length - sent); o.write(rest); setLocal(rest); setMsg((e as Error).message)
    }
    await reload()
  }
  return { items, msg, add, remove, update, online, localCount: online ? local.length : 0, importLocal, setMsg }
}
