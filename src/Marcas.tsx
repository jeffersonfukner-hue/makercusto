import { useState } from 'react'
import { BRANDS } from './domain/catalogo'
import type { Brand, BrandDraft } from './domain/marca'

const empty = () => ({ name: '', site: '', nozzle: '', bed: '' })
const link = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`)

export function Marcas({ list, onAdd, onRemove, msg }: { list: Brand[]; onAdd: (d: BrandDraft) => Promise<void>; onRemove: (id: string) => void; msg: string }) {
  const [f, setF] = useState(empty)
  const [note, setNote] = useState('')
  const set = (k: keyof ReturnType<typeof empty>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const save = async () => {
    try {
      await onAdd({ name: f.name, site: f.site, nozzleC: f.nozzle.trim() === '' ? undefined : Number(f.nozzle), bedC: f.bed.trim() === '' ? undefined : Number(f.bed) })
      setF(empty()); setNote('Salvo.')
    } catch (e) { setNote((e as Error).message) }
  }
  return (
    <div className="dash">
      <section className="card">
        <h2>Nova marca</h2>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <label><span>Nome</span><span className="input"><input value={f.name} onChange={set('name')} placeholder="Ex.: Voolt3D" maxLength={30} /></span></label>
          <label><span>Site (opcional)</span><span className="input"><input value={f.site} onChange={set('site')} placeholder="exemplo.com.br" /></span></label>
          <div className="two">
            <label><span>Temperatura do bico (opcional)</span><span className="input"><input inputMode="numeric" value={f.nozzle} onChange={set('nozzle')} /><em>°C</em></span></label>
            <label><span>Temperatura da mesa (opcional)</span><span className="input"><input inputMode="numeric" value={f.bed} onChange={set('bed')} /><em>°C</em></span></label>
          </div>
          <small>As temperaturas vêm preenchidas quando você escolhe essa marca em um filamento novo.</small>
          <p><button type="submit" className="primary">Salvar marca</button></p>
          {note && <p className="note" role="status">{note}</p>}
        </form>
      </section>
      <section className="card">
        <h2>Minhas marcas</h2>
        {msg && <p className="errors" role="alert">{msg}</p>}
        {!list.length ? <p className="note">Nenhuma marca sua ainda. Você pode escolher as {BRANDS.length} marcas da lista de sugestões direto no cadastro de filamentos. Cadastre aqui só as que não estão nela, ou para guardar site e temperaturas.</p> : (
          <ul className="jobs">{list.map((b) => (
            <li key={b.id}>
              <span className="pick"><strong>{b.name}</strong>
                <span>{b.nozzleC === undefined && b.bedC === undefined ? 'sem temperaturas' : `${b.nozzleC ?? '?'} / ${b.bedC ?? '?'} °C`}
                  {b.site && <> · <a href={link(b.site)} target="_blank" rel="noopener noreferrer">site</a></>}</span></span>
              <span className="acts"><button type="button" onClick={() => { if (confirm(`Excluir "${b.name}"?`)) onRemove(b.id) }}>Excluir</button></span>
            </li>))}</ul>
        )}
      </section>
    </div>
  )
}
