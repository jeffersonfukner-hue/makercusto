import { AJUDA } from './ajuda'
import { useMemo, useState } from 'react'
import { Combo, Fld, Label, QuickAdd } from './Campos'
import { canonical } from './domain/catalogo'
import type { Supplier, SupplierDraft } from './domain/supplier'
import { foldText, titleCase } from './domain/texto'
import { isLow, stockValueCents, withQty, type Supply, type SupplyDraft } from './domain/supply'
import { money } from './format'

const empty = () => ({ name: '', category: '', supplier: '', qty: '0', min: '0', cost: '' })
const toCents = (s: string) => Math.round(Number(s.replace(',', '.')) * 100)

export function Estoque({ list, suppliers, onAdd, onUpdate, onRemove, onAddSupplier, msg }: {
  list: Supply[]; suppliers: Supplier[]; onAddSupplier?: (d: SupplierDraft) => Promise<void>; onAdd: (d: SupplyDraft) => Promise<void>; onUpdate: (s: Supply) => Promise<void>
  onRemove: (id: string) => void; msg: string
}) {
  const [f, setF] = useState(empty)
  const [note, setNote] = useState('')
  const [modal, setModal] = useState<string | null>(null)
  const supplierOpts = useMemo(() => suppliers.map((s) => s.name), [suppliers])
  const set = (k: keyof ReturnType<typeof empty>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const save = async () => {
    try {
      await onAdd({ name: f.name, category: f.category, supplier: canonical(supplierOpts, f.supplier), qty: Number(f.qty), min: Number(f.min), costCents: f.cost.trim() === '' ? NaN : toCents(f.cost) })
      setF({ ...empty(), category: f.category, supplier: f.supplier }); setNote('Salvo.')
    } catch (e) { setNote((e as Error).message) }
  }
  const low = list.filter(isLow)
  return (
    <div className="dash">
      <section className="card">
        <h2>Novo item</h2>
        <p className="note">Insumos que você compra pronto para montar o produto: chaveiros, copos de alumínio, LEDs, velas artificiais, ímãs.</p>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <div className="pair">
            <Fld label="Nome" info={AJUDA.nomeItem} mode="text" value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="Ex.: Copo de alumínio" />
            <Fld label="Categoria (opcional)" info={AJUDA.categoria} mode="text" value={f.category} onChange={(v) => setF({ ...f, category: v })} placeholder="Ex.: Canecas" />
          </div>
          <div className="field">
            <Label htmlFor="e-forn" info={AJUDA.fornecedor} plus={onAddSupplier ? { label: 'Cadastrar novo fornecedor', onClick: () => setModal('') } : undefined}>Fornecedor (opcional)</Label>
            <Combo id="e-forn" value={f.supplier} onChange={(v) => setF({ ...f, supplier: v })} options={supplierOpts} onCreate={onAddSupplier ? (t) => setModal(t) : undefined} />
          </div>
          <div className="trio">
            <Fld label="Custo de cada" info={AJUDA.custoUnidade} unit="R$" value={f.cost} onChange={(v) => setF({ ...f, cost: v })} />
            <Fld label="Quantidade agora" info={AJUDA.qtdAgora} mode="numeric" unit="un" value={f.qty} onChange={(v) => setF({ ...f, qty: v })} />
            <Fld label="Avisar em" info={AJUDA.minimo} mode="numeric" unit="un" value={f.min} onChange={(v) => setF({ ...f, min: v })} />
          </div>
          <p><button type="submit" className="primary">Salvar item</button></p>
          {note && <p className="note" role="status">{note}</p>}
        </form>
      </section>
      <section className="card">
        <h2>Resumo</h2>
        <p className="big">{money(stockValueCents(list))}</p>
        <p className="note">Valor parado em insumos ({list.length} itens).</p>
        {low.length > 0 && (
          <p className="loss" role="status"><strong>Estoque baixo:</strong> {low.map((s) => `${s.name} (${s.qty})`).join(', ')}</p>
        )}
      </section>
      <section className="card wide">
        <h2>Meus insumos</h2>
        {msg && <p className="errors" role="alert">{msg}</p>}
        {!list.length ? <p className="note">Nenhum item cadastrado.</p> : (
          <div className="scroll stack"><table>
            <thead><tr>{['Item', 'Categoria', 'Fornecedor', 'Custo', 'Estoque', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>{list.map((s) => (
              <tr key={s.id}>
                <td data-label="Item">{s.name}</td>
                <td data-label="Categoria">{s.category || '-'}</td>
                <td data-label="Fornecedor">{s.supplier || '-'}</td>
                <td data-label="Custo">{money(s.costCents)}</td>
                <td data-label="Estoque" className={isLow(s) ? 'loss' : ''}><strong>{s.qty}</strong>{isLow(s) ? ' (baixo)' : ''}</td>
                <td>
                  <div className="rowacts">
                    <button type="button" aria-label={`Tirar 1 de ${s.name}`} onClick={() => void onUpdate(withQty(s, s.qty - 1))}>-1</button>
                    <button type="button" aria-label={`Colocar 1 em ${s.name}`} onClick={() => void onUpdate(withQty(s, s.qty + 1))}>+1</button>
                    <button type="button" aria-label={`Colocar 10 em ${s.name}`} onClick={() => void onUpdate(withQty(s, s.qty + 10))}>+10</button>
                    <button type="button" onClick={() => { if (confirm(`Excluir "${s.name}"?`)) onRemove(s.id) }}>Excluir</button>
                  </div>
                </td>
              </tr>))}</tbody>
          </table></div>
        )}
        <p className="note">Entrada e saída são feitas aqui, na mão. A baixa automática por pedido vem junto com os pedidos.</p>
      </section>
      {modal !== null && onAddSupplier && <QuickAdd title="Novo fornecedor" label="Nome do fornecedor" placeholder="Ex.: Masterprint" initial={modal}
        onSave={async (n) => {
          const existing = supplierOpts.find((o) => foldText(o) === foldText(n))
          if (!existing) await onAddSupplier({ name: titleCase(n), contact: '', site: '', notes: '' })
          setF({ ...f, supplier: existing ?? titleCase(n) })
        }} onClose={() => setModal(null)} />}
    </div>
  )
}
