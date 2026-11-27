import { useEffect, useRef, useState } from 'react'
import type { Supply, SupplyDraft } from './domain/supply'
import type { Bought } from './domain/cost'
import { summarize, type SavedCalc } from './domain/saved'
import { money } from './format'
import { AJUDA } from './ajuda'
import { Fld, Info } from './Campos'
import { QuickSupply } from './Rapido'

// Item comprado como texto de formulário. É o formato único das duas telas (Calculadora e Produto).
export type ItemF = { name: string; price: string; qty: string; ref?: string }

const t = (n: number) => String(n).replace('.', ',')
const num = (v: string) => Number(v.replace(',', '.'))
const bad = (v: string) => v.trim() === '' || Number.isNaN(num(v))

export const itensParaInput = (l: ItemF[]): Bought[] => l.map((b) => ({ name: b.name, price: num(b.price), qty: num(b.qty) }))
export const itensDoInput = (l: Bought[] = []): ItemF[] => l.map((b) => ({ name: b.name, price: t(b.price), qty: String(b.qty) }))
export const itensValidos = (l: unknown): l is ItemF[] => Array.isArray(l) && l.every((b) => b && typeof b.name === 'string' && typeof b.price === 'string' && typeof b.qty === 'string')

// Parte salva entra como item pronto: custo do cálculo salvo, sem margem e sem contar as falhas duas vezes.
const unitOf = (c: SavedCalc) => summarize(c).result.unit / 100

/** Seção "Itens comprados": a mesma nas duas telas. Mudou aqui, mudou nas duas. */
export function SecaoItens({ itens, onChange, supplies, onAddSupply, savedParts }: {
  itens: ItemF[]; onChange: (l: ItemF[]) => void; supplies: Supply[]; onAddSupply?: (d: SupplyDraft) => Promise<void>; savedParts: SavedCalc[]
}) {
  const [quick, setQuick] = useState<number | null>(null)
  const pend = useRef<{ name: string; n: number } | null>(null)
  const ref = useRef(itens)
  ref.current = itens
  const set = (n: number, p: Partial<ItemF>) => onChange(itens.map((x, i) => (i === n ? { ...x, ...p } : x)))
  // Depois do cadastro rápido, o item novo já fica escolhido na linha de onde a pessoa saiu.
  useEffect(() => {
    const q = pend.current
    if (!q) return
    const x = supplies.find((y) => y.name === q.name)
    if (x) { pend.current = null; onChange(ref.current.map((y, i) => (i === q.n ? { ...y, name: x.name, price: t(x.costCents / 100) } : y))) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplies])
  const addSaved = (id: string) => {
    const c = savedParts.find((x) => x.id === id)
    if (c) onChange([...itens, { name: `Parte: ${c.name}`, price: t(unitOf(c)), qty: '1', ref: c.id }])
  }
  const fld = (n: number, label: string, key: 'name' | 'price' | 'qty', unit: string | undefined, help: keyof typeof AJUDA, mode: 'decimal' | 'numeric' | 'text') => (
    <Fld label={label} info={AJUDA[help]} unit={unit} value={itens[n][key]} onChange={(v) => set(n, { [key]: v })} mode={mode}
      missing={mode === 'text' ? itens[n][key].trim() === '' : bad(itens[n][key])} />
  )
  return (
    <section className="card2" style={{ marginBottom: 12 }}>
      <h2>Itens comprados <Info label="Itens comprados" text={AJUDA.itemComprado} /></h2>
      {itens.map((b, n) => (
        <div className="line" key={n}>
          <Fld label="Do estoque" info={AJUDA.doEstoque} plus={onAddSupply ? { label: 'Cadastrar novo item de estoque', onClick: () => setQuick(n) } : undefined}>
            <select value="" onChange={(e) => {
              const x = supplies.find((q) => q.id === e.target.value)
              if (x) set(n, { name: x.name, price: t(x.costCents / 100) })
            }}>
              <option value="">Escolher item cadastrado</option>
              {supplies.map((q) => <option key={q.id} value={q.id}>{q.name} ({money(q.costCents)})</option>)}
            </select>
          </Fld>
          <div className="trio">
            {fld(n, 'Item', 'name', undefined, 'nomeItem', 'text')}
            {fld(n, 'Preço de cada', 'price', 'R$', 'precoCada', 'decimal')}
            {fld(n, 'Quantidade', 'qty', 'un', 'quantidade', 'numeric')}
          </div>
          {b.ref && <p className="note">Parte salva. Custo do cálculo salvo, já com as falhas dela.{savedParts.some((c) => c.id === b.ref) && <> <button type="button" className="linkish" onClick={() => { const c = savedParts.find((x) => x.id === b.ref); if (c) set(n, { price: t(unitOf(c)) }) }}>Atualizar</button></>}</p>}
          <p><button type="button" onClick={() => onChange(itens.filter((_, i) => i !== n))}>Remover item</button></p>
        </div>
      ))}
      <div className="addrow">
        <button type="button" onClick={() => onChange([...itens, { name: '', price: '', qty: '1' }])}>Adicionar item comprado</button>
        {savedParts.length > 0 && (
          <span className="input"><select aria-label="Adicionar parte salva" value="" onChange={(e) => addSaved(e.target.value)}>
            <option value="">Adicionar parte salva...</option>
            {savedParts.map((c) => <option key={c.id} value={c.id}>{c.name} ({money(summarize(c).result.unit)})</option>)}
          </select></span>
        )}
      </div>
      {quick !== null && onAddSupply && <QuickSupply onAdd={onAddSupply} onClose={() => setQuick(null)} onSaved={(name) => { pend.current = { name, n: quick } }} />}
    </section>
  )
}
