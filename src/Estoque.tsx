import { useState } from 'react'
import type { Supplier } from './domain/supplier'
import { isLow, stockValueCents, withQty, type Supply, type SupplyDraft } from './domain/supply'
import { money } from './format'

const empty = () => ({ name: '', category: '', supplier: '', qty: '0', min: '0', cost: '' })
const toCents = (s: string) => Math.round(Number(s.replace(',', '.')) * 100)

export function Estoque({ list, suppliers, onAdd, onUpdate, onRemove, msg }: {
  list: Supply[]; suppliers: Supplier[]; onAdd: (d: SupplyDraft) => Promise<void>; onUpdate: (s: Supply) => Promise<void>
  onRemove: (id: string) => void; msg: string
}) {
  const [f, setF] = useState(empty)
  const [note, setNote] = useState('')
  const set = (k: keyof ReturnType<typeof empty>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const save = async () => {
    try {
      await onAdd({ name: f.name, category: f.category, supplier: f.supplier, qty: Number(f.qty), min: Number(f.min), costCents: f.cost.trim() === '' ? NaN : toCents(f.cost) })
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
          <label><span>Nome</span><span className="input"><input value={f.name} onChange={set('name')} placeholder="Ex.: Copo de alumínio" /></span></label>
          <label><span>Categoria (opcional)</span><span className="input"><input value={f.category} onChange={set('category')} placeholder="Ex.: Canecas" /></span></label>
          <label><span>Fornecedor (opcional)</span><span className="input"><input list="fornecedores-estoque" value={f.supplier} onChange={set('supplier')} /></span></label>
          <datalist id="fornecedores-estoque">{suppliers.map((x) => <option key={x.id} value={x.name} />)}</datalist>
          <label><span>Custo de cada unidade</span><span className="input"><input inputMode="decimal" value={f.cost} onChange={set('cost')} /><em>R$</em></span></label>
          <div className="two">
            <label><span>Quantidade agora</span><span className="input"><input inputMode="numeric" value={f.qty} onChange={set('qty')} /><em>un</em></span></label>
            <label><span>Avisar quando chegar a</span><span className="input"><input inputMode="numeric" value={f.min} onChange={set('min')} /><em>un</em></span></label>
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
    </div>
  )
}
