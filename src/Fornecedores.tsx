import { useState } from 'react'
import type { Supplier, SupplierDraft } from './domain/supplier'

const empty = () => ({ name: '', contact: '', site: '', notes: '' })

export function Fornecedores({ list, onAdd, onRemove, msg }: {
  list: Supplier[]; onAdd: (d: SupplierDraft) => Promise<void>; onRemove: (id: string) => void; msg: string
}) {
  const [f, setF] = useState(empty)
  const [note, setNote] = useState('')
  const set = (k: keyof ReturnType<typeof empty>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const save = async () => { try { await onAdd(f); setF(empty()); setNote('Salvo.') } catch (e) { setNote((e as Error).message) } }
  const link = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`)
  return (
    <div className="dash">
      <section className="card">
        <h2>Novo fornecedor</h2>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <label><span>Nome</span><span className="input"><input value={f.name} onChange={set('name')} placeholder="Ex.: Masterprint" /></span></label>
          <label><span>Contato (opcional)</span><span className="input"><input value={f.contact} onChange={set('contact')} placeholder="WhatsApp, e-mail ou telefone" /></span></label>
          <label><span>Site (opcional)</span><span className="input"><input value={f.site} onChange={set('site')} placeholder="exemplo.com.br" /></span></label>
          <label><span>Observações (opcional)</span><span className="input"><input value={f.notes} onChange={set('notes')} placeholder="Prazo, frete, condições" /></span></label>
          <p><button type="submit" className="primary">Salvar fornecedor</button></p>
          {note && <p className="note" role="status">{note}</p>}
        </form>
      </section>
      <section className="card">
        <h2>Meus fornecedores</h2>
        {msg && <p className="errors" role="alert">{msg}</p>}
        {!list.length ? <p className="note">Nenhum fornecedor cadastrado. Eles aparecem como sugestão ao cadastrar filamentos e itens de estoque.</p> : (
          <ul className="jobs">{list.map((s) => (
            <li key={s.id}>
              <span className="pick"><strong>{s.name}</strong>
                <span>{[s.contact, s.notes].filter(Boolean).join(' · ') || 'sem detalhes'}
                  {s.site && <> · <a href={link(s.site)} target="_blank" rel="noopener noreferrer">site</a></>}</span></span>
              <span className="acts"><button type="button" onClick={() => { if (confirm(`Excluir "${s.name}"?`)) onRemove(s.id) }}>Excluir</button></span>
            </li>))}</ul>
        )}
      </section>
    </div>
  )
}
