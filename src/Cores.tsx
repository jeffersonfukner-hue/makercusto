import { BotaoExcluir } from './Janela'
import { AJUDA } from './ajuda'
import { Fld } from './Campos'
import { useState } from 'react'
import { COLORS } from './domain/catalogo'
import type { Color, ColorDraft } from './domain/marca'

export function Cores({ list, onAdd, onRemove, msg }: { list: Color[]; onAdd: (d: ColorDraft) => Promise<void>; onRemove: (id: string) => void; msg: string }) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const save = async () => { try { await onAdd({ name }); setName(''); setNote('Salvo.') } catch (e) { setNote((e as Error).message) } }
  return (
    <div className="dash">
      <section className="card">
        <h2>Nova cor</h2>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <Fld label="Nome" info={AJUDA.nomeCor} mode="text" value={name} onChange={setName} placeholder="Ex.: Azul Bebê" maxLength={30} />
          <p><button type="submit" className="primary">Salvar cor</button></p>
          {note && <p className="note" role="status">{note}</p>}
        </form>
      </section>
      <section className="card">
        <h2>Minhas cores</h2>
        {msg && <p className="errors" role="alert">{msg}</p>}
        {!list.length ? <p className="note">Nenhuma cor sua ainda. A lista de sugestões tem {COLORS.length} cores e acabamentos, incluindo dual color e silk. Cadastre aqui só as que não estão nela.</p> : (
          <ul className="jobs">{list.map((c) => (
            <li key={c.id}>
              <span className="pick"><strong>{c.name}</strong></span>
              <span className="acts"><BotaoExcluir nome={c.name} onConfirm={() => onRemove(c.id)} /></span>
            </li>))}</ul>
        )}
      </section>
    </div>
  )
}
