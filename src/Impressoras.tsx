import { BotaoExcluir } from './Janela'
import { AJUDA } from './ajuda'
import { Fld } from './Campos'
import { useState } from 'react'
import { CATALOG, cloneFromCatalog, type CatalogPrinter, type UserPrinter, type UserPrinterDraft } from './domain/printers'
import { money } from './format'

const empty = () => ({ name: '', watts: '150', price: '', life: '3000' })
const toCents = (s: string) => Math.round(Number(s.replace(',', '.')) * 100)

export function Impressoras({ list, onAdd, onRemove, msg }: {
  list: UserPrinter[]; onAdd: (d: UserPrinterDraft) => Promise<void>; onRemove: (id: string) => void; msg: string
}) {
  const [f, setF] = useState(empty)
  const [note, setNote] = useState('')
  const set = (k: keyof ReturnType<typeof empty>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const save = async () => {
    try {
      await onAdd({ name: f.name, watts: Number(f.watts.replace(',', '.')), priceCents: f.price.trim() === '' ? 0 : toCents(f.price), lifetimeHours: Number(f.life.replace(',', '.')) })
      setF(empty()); setNote('Salvo.')
    } catch (e) { setNote((e as Error).message) }
  }
  const clone = (c: CatalogPrinter) => {
    const d = cloneFromCatalog(c, { watts: Number(f.watts.replace(',', '.')) || 150, lifetimeHours: Number(f.life.replace(',', '.')) || 3000 })
    setF({ name: d.name, watts: String(d.watts), price: '', life: String(d.lifetimeHours) })
    setNote('Copiado para o formulário. Informe o preço que você pagou e o consumo que você mediu, e salve.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <div className="dash">
      <section className="card">
        <h2>Minha impressora</h2>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <Fld label="Nome" info={AJUDA.nomeImpressora} mode="text" value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="Ex.: Kobra X da oficina" />
          <div className="trio">
            <Fld label="Consumo médio" info={AJUDA.wattsImpressora} unit="W" value={f.watts} onChange={(v) => setF({ ...f, watts: v })} />
            <Fld label="Preço pago" info={AJUDA.precoImpressora} unit="R$" value={f.price} onChange={(v) => setF({ ...f, price: v })} />
            <Fld label="Vida útil" info={AJUDA.vidaImpressora} mode="numeric" unit="h" value={f.life} onChange={(v) => setF({ ...f, life: v })} />
          </div>
          <p><button type="submit" className="primary">Salvar impressora</button></p>
          {note && <p className="note" role="status">{note}</p>}
        </form>
        <h2>Minhas impressoras</h2>
        {msg && <p className="errors" role="alert">{msg}</p>}
        {!list.length ? <p className="note">Nenhuma cadastrada. Ela aparece na calculadora e no produto para preencher consumo, preço e vida útil.</p> : (
          <ul className="jobs">{list.map((p) => (
            <li key={p.id}>
              <span className="pick"><strong>{p.name}</strong><span>{p.watts} W · {money(p.priceCents)} · {p.lifetimeHours} h</span></span>
              <span className="acts"><BotaoExcluir nome={p.name} onConfirm={() => onRemove(p.id)} /></span>
            </li>))}</ul>
        )}
      </section>
      <section className="card wide">
        <h2>Catálogo</h2>
        <p className="note">Modelos com dados do fabricante. A potência nominal é o máximo da fonte, não o consumo médio. Preço, consumo e vida útil são seus: clone e preencha.</p>
        <div className="scroll stack"><table>
          <thead><tr>{['Modelo', 'Área de impressão (mm)', 'Potência nominal', 'Fonte', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{CATALOG.map((c) => (
            <tr key={c.id}>
              <td data-label="Modelo"><strong>{c.brand} {c.model}</strong></td>
              <td data-label="Área de impressão (mm)">{c.volume ?? 'não consta na fonte'}</td>
              <td data-label="Potência nominal">{c.ratedW ?? 'não consta na fonte'}</td>
              <td data-label="Fonte"><a href={c.source} target="_blank" rel="noopener noreferrer">ver</a></td>
              <td><div className="rowacts"><button type="button" onClick={() => clone(c)}>Clonar para as minhas</button></div></td>
            </tr>))}</tbody>
        </table></div>
        <p className="note">Não achou o seu modelo? Cadastre acima mesmo assim. Novos modelos entram no catálogo com o tempo.</p>
      </section>
    </div>
  )
}
