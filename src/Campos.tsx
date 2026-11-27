import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { canonical, searchOptions } from './domain/catalogo'
import { foldText } from './domain/texto'

// "i" de ajuda: aparece ao passar o mouse ou focar, e fixa ao clicar ou tocar. Esc ou clique fora fecha.
export function Info({ label, text }: { label: string; text: string }) {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [shift, setShift] = useState(0)
  const root = useRef<HTMLSpanElement>(null)
  const tip = useRef<HTMLSpanElement>(null)
  const id = useId()
  const open = hover || pinned
  useEffect(() => {
    if (!open || !tip.current) return
    // Mantém a caixa dentro da tela: empurra para a esquerda se passar da borda direita, para a direita se passar da esquerda.
    const r = tip.current.getBoundingClientRect()
    const base = r.left - shift
    const over = base + r.width - (window.innerWidth - 8)
    setShift(over > 0 ? -over : base < 8 ? 8 - base : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  useEffect(() => {
    if (!pinned) return
    const out = (e: MouseEvent | TouchEvent) => { if (!root.current?.contains(e.target as Node)) setPinned(false) }
    document.addEventListener('mousedown', out); document.addEventListener('touchstart', out)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('touchstart', out) }
  }, [pinned])
  return (
    <span className="info" ref={root} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button type="button" className="ibtn" aria-label={`Ajuda: ${label}`} aria-describedby={open ? id : undefined} aria-expanded={open}
        onFocus={() => setHover(true)} onBlur={() => setHover(false)}
        onClick={() => setPinned((p) => !p)}
        onKeyDown={(e) => { if (e.key === 'Escape') { setPinned(false); setHover(false) } }}>i</button>
      {open && <span role="tooltip" id={id} ref={tip} className="tip" style={{ transform: `translateX(${shift}px)` }}>{text}</span>}
    </span>
  )
}

// Etiqueta do campo com "i" de ajuda e "+" de cadastro rápido, tudo na mesma linha.
export function Label({ htmlFor, children, plus, info }: {
  htmlFor?: string; children: ReactNode; plus?: { label: string; onClick: () => void }; info?: string
}) {
  const text = typeof children === 'string' ? children : ''
  return (
    <div className="lab">
      <label htmlFor={htmlFor}>{children}</label>
      {info && <Info label={text} text={info} />}
      {plus && <button type="button" className="plus" aria-label={plus.label} title={plus.label} onClick={plus.onClick}>+</button>}
    </div>
  )
}

// Campo numérico ou de texto compacto: etiqueta + "i" + (opcional) "+", caixa com unidade à direita.
export function Fld({ label, info, unit, value, onChange, mode = 'decimal', placeholder, maxLength, plus, children }: {
  label: string; info?: string; unit?: string; value?: string; onChange?: (v: string) => void
  mode?: 'decimal' | 'numeric' | 'text'; placeholder?: string; maxLength?: number
  plus?: { label: string; onClick: () => void }; children?: ReactNode
}) {
  const id = useId()
  return (
    <div className="field">
      <Label htmlFor={id} info={info} plus={plus}>{label}</Label>
      {children ? <span className="input">{cloneElement(children as ReactElement<{ id?: string }>, { id })}</span> : (
        <span className="input">
          <input id={id} inputMode={mode === 'text' ? undefined : mode} value={value ?? ''} placeholder={placeholder} maxLength={maxLength}
            onChange={(e) => onChange?.(e.target.value)} />
          {unit && <em>{unit}</em>}
        </span>
      )}
    </div>
  )
}

// Cadastro rápido com poucos campos, para o "+" de qualquer lista: salva e devolve a pessoa ao ponto onde estava.
export type QuickField = { key: string; label: string; info?: string; initial?: string; unit?: string; kind?: 'text' | 'number' | 'select'; options?: string[] }
export function QuickForm({ title, fields, note, onSave, onClose }: {
  title: string; fields: QuickField[]; note?: string; onSave: (v: Record<string, string>) => Promise<void>; onClose: () => void
}) {
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, f.initial ?? ''])))
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const tid = useId()
  const base = useId()
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = box.current?.querySelector<HTMLElement>('input, select')
    first?.focus(); (first as HTMLInputElement | null)?.select?.()
    return () => prev?.focus?.()
  }, [])
  const submit = async () => {
    setBusy(true); setErr('')
    try { await onSave(vals); onClose() } catch (e) { setErr((e as Error).message); setBusy(false) }
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (e.key !== 'Tab' || !box.current) return
    const els = [...box.current.querySelectorAll<HTMLElement>('input, select, button')].filter((x) => !(x as HTMLButtonElement).disabled)
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
          {fields.map((f) => (
            <div className="field" key={f.key}>
              <Label htmlFor={`${base}-${f.key}`} info={f.info}>{f.label}</Label>
              <span className="input">
                {f.kind === 'select' ? (
                  <select id={`${base}-${f.key}`} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input id={`${base}-${f.key}`} inputMode={f.kind === 'number' ? 'decimal' : undefined} value={vals[f.key]} maxLength={60}
                    onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
                )}
                {f.unit && <em>{f.unit}</em>}
              </span>
            </div>
          ))}
          <small>{note ?? 'Só o essencial. Os detalhes você completa depois, na tela de cadastro.'}</small>
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
export function DateParts({ value, onChange, legend, info }: { value: string; onChange: (v: string) => void; legend: string; info?: string }) {
  const now = new Date()
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const y = m ? Number(m[1]) : now.getFullYear(); const mo = m ? Number(m[2]) : now.getMonth() + 1; const d = m ? Number(m[3]) : now.getDate()
  const first = Math.min(now.getFullYear() - 5, y)
  const years = Array.from({ length: Math.max(now.getFullYear(), y) - first + 1 }, (_, i) => first + i).reverse()
  const set = (ny: number, nm: number, nd: number) => onChange(`${ny}-${pad(nm)}-${pad(Math.min(nd, daysIn(ny, nm)))}`)
  return (
    <fieldset className="date">
      <legend className="lab">{legend}{info && <Info label={legend} text={info} />}</legend>
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
