import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { canonical, searchOptions } from './domain/catalogo'
import { foldText } from './domain/texto'

// Etiqueta do campo com um "+" na mesma linha: abre o cadastro rápido sem sair da tela.
export function Label({ htmlFor, children, plus }: { htmlFor: string; children: ReactNode; plus?: { label: string; onClick: () => void } }) {
  return (
    <div className="lab">
      <label htmlFor={htmlFor}>{children}</label>
      {plus && <button type="button" className="plus" aria-label={plus.label} title={plus.label} onClick={plus.onClick}>+</button>}
    </div>
  )
}

// Campo de texto com lista de sugestões que filtra enquanto a pessoa digita (sem acento e sem diferença de maiúscula).
// Aceita texto livre: ao sair do campo, a escrita da lista ou o padrão "Título" é aplicado.
export function Combo({ id, value, onChange, options, placeholder, onCreate }: {
  id: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; onCreate?: (typed: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()
  const found = searchOptions(options, value)
  const typed = value.trim()
  const exact = options.some((o) => foldText(o) === foldText(typed))
  const rows: { text: string; isNew?: boolean }[] = [...found.map((text) => ({ text })), ...(onCreate && typed && !exact ? [{ text: typed, isNew: true }] : [])]
  const shown = open && rows.length > 0

  const pick = (i: number) => {
    const r = rows[i]
    if (!r) return
    setOpen(false); setActive(-1)
    if (r.isNew) onCreate?.(r.text); else onChange(r.text)
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(rows.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter' && shown && active >= 0) { e.preventDefault(); pick(active) }
    else if (e.key === 'Escape' && shown) { e.preventDefault(); setOpen(false); setActive(-1) }
  }
  return (
    <span className="input combo">
      <input id={id} value={value} placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={shown} aria-controls={listId}
        aria-autocomplete="list" aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setOpen(false); setActive(-1); const c = canonical(options, value); if (c !== value) onChange(c) }}
        onKeyDown={onKey} />
      {shown && (
        <ul className="opts" role="listbox" id={listId} onMouseDown={(e) => e.preventDefault()}>
          {rows.map((r, i) => (
            <li key={`${r.isNew ? 'n' : 'o'}-${r.text}`} id={`${listId}-${i}`} role="option" aria-selected={i === active} className={r.isNew ? 'new' : undefined} onClick={() => pick(i)}>
              {r.isNew ? <>+ Cadastrar “{r.text}”</> : r.text}
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}

// Cadastro rápido: só o nome, para não perder o fluxo. Os detalhes ficam na tela de cadastro dedicada.
export function QuickAdd({ title, label, initial = '', placeholder, onSave, onClose }: {
  title: string; label: string; initial?: string; placeholder?: string; onSave: (name: string) => Promise<void>; onClose: () => void
}) {
  const [name, setName] = useState(initial)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const tid = useId()
  const iid = useId()
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    input.current?.focus(); input.current?.select()
    return () => prev?.focus?.()
  }, [])
  const submit = async () => {
    setBusy(true); setErr('')
    try { await onSave(name); onClose() } catch (e) { setErr((e as Error).message); setBusy(false) }
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (e.key !== 'Tab' || !box.current) return
    const els = [...box.current.querySelectorAll<HTMLElement>('input, button')].filter((x) => !(x as HTMLButtonElement).disabled)
    if (!els.length) return
    const first = els[0]; const last = els[els.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return (
    <div className="modalback" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={tid} ref={box} onKeyDown={onKey}>
        <h2 id={tid}>{title}</h2>
        <form onSubmit={(e) => { e.preventDefault(); void submit() }} noValidate>
          <label htmlFor={iid}>{label}</label>
          <span className="input"><input id={iid} ref={input} value={name} placeholder={placeholder} maxLength={60} onChange={(e) => setName(e.target.value)} /></span>
          <small>Só o nome. Os detalhes você completa depois, na tela de cadastro.</small>
          {err && <p className="errors" role="alert">{err}</p>}
          <div className="rowacts modalacts">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary" disabled={busy}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate()
const pad = (n: number) => String(n).padStart(2, '0')

// Data em três escolhas, nesta ordem: ano, mês e dia. O dia se ajusta ao mês (fevereiro, meses de 30 dias).
export function DateParts({ value, onChange, legend }: { value: string; onChange: (v: string) => void; legend: string }) {
  const now = new Date()
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const y = m ? Number(m[1]) : now.getFullYear(); const mo = m ? Number(m[2]) : now.getMonth() + 1; const d = m ? Number(m[3]) : now.getDate()
  const first = Math.min(now.getFullYear() - 5, y)
  const years = Array.from({ length: Math.max(now.getFullYear(), y) - first + 1 }, (_, i) => first + i).reverse()
  const set = (ny: number, nm: number, nd: number) => onChange(`${ny}-${pad(nm)}-${pad(Math.min(nd, daysIn(ny, nm)))}`)
  return (
    <fieldset className="date">
      <legend>{legend}</legend>
      <div className="three">
        <label><span>Ano</span><span className="input"><select aria-label={`${legend}, ano`} value={y} onChange={(e) => set(Number(e.target.value), mo, d)}>
          {years.map((v) => <option key={v} value={v}>{v}</option>)}</select></span></label>
        <label><span>Mês</span><span className="input"><select aria-label={`${legend}, mês`} value={mo} onChange={(e) => set(y, Number(e.target.value), d)}>
          {MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}</select></span></label>
        <label><span>Dia</span><span className="input"><select aria-label={`${legend}, dia`} value={d} onChange={(e) => set(y, mo, Number(e.target.value))}>
          {Array.from({ length: daysIn(y, mo) }, (_, i) => i + 1).map((v) => <option key={v} value={v}>{v}</option>)}</select></span></label>
      </div>
    </fieldset>
  )
}
