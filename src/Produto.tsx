import { useEffect, useRef, useState } from 'react'
import { calculateProduct, lineGrams, validateProduct, type ProductInput, type ProductResult, type SavedProduct } from './domain/product'
import { filamentLabel, pricePerKg as kgPrice, type Filament } from './domain/filament'
import { fromHMS, toHMS } from './domain/time'
import type { UserPrinter } from './domain/printers'
import type { Supply } from './domain/supply'
import { money, pct } from './format'
import { readDraft, writeDraft } from './storage'
import { AJUDA, type AjudaKey } from './ajuda'
import { Fld, Info } from './Campos'
import { QuickFilament, QuickPrinter, QuickSupply } from './Rapido'
import { titleCase } from './domain/texto'
import type { FilamentDraft } from './domain/filament'
import type { UserPrinterDraft } from './domain/printers'
import type { SupplyDraft } from './domain/supply'

type LineF = { color: string; fil: string; price: string; model: string; flushed: string; tower: string }
type PartF = { name: string; h: string; m: string; s: string; pieces: string; per: string; lines: LineF[] }
type BoughtF = { name: string; price: string; qty: string }
type ShopF = { watts: string; tariff: string; printerPrice: string; life: string; laborMin: string; laborRate: string; fail: string; margin: string; sold: string }
type State = { parts: PartF[]; bought: BoughtF[]; shop: ShopF; printer: string }

const newLine = (): LineF => ({ color: '', fil: '', price: '', model: '', flushed: '', tower: '' })
const newPart = (): PartF => ({ name: '', h: '0', m: '0', s: '0', pieces: '1', per: '1', lines: [newLine()] })
const initial = (): State => ({
  parts: [newPart()], bought: [], printer: '',
  shop: { watts: '150', tariff: '1,03', printerPrice: '3500', life: '3000', laborMin: '10', laborRate: '20', fail: '10', margin: '50', sold: '' },
})
const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))
const grams = (s: string) => (s.trim() === '' ? 0 : num(s))
const t = (n: number) => String(n).replace('.', ',')

export function toInput(s: State): ProductInput {
  return {
    parts: s.parts.map((p) => ({
      name: p.name, hours: fromHMS(p.h, p.m, p.s), piecesPerPrint: num(p.pieces), perProduct: num(p.per),
      lines: p.lines.map((l) => ({ color: l.color, pricePerKg: num(l.price), modelG: grams(l.model), flushedG: grams(l.flushed), towerG: grams(l.tower) })),
    })),
    bought: s.bought.map((b) => ({ name: b.name, price: num(b.price), qty: num(b.qty) })),
    watts: num(s.shop.watts), tariff: num(s.shop.tariff), printerPrice: num(s.shop.printerPrice), lifetimeHours: num(s.shop.life),
    laborMinutes: num(s.shop.laborMin), laborRate: num(s.shop.laborRate), failurePct: num(s.shop.fail), marginPct: num(s.shop.margin),
    soldPrice: s.shop.sold.trim() === '' ? undefined : num(s.shop.sold),
  }
}

export function fromInput(i: ProductInput): State {
  return {
    printer: '',
    parts: i.parts.map((p) => {
      const { h, m, s } = toHMS(p.hours)
      return { name: p.name, h: String(h), m: String(m), s: String(s), pieces: String(p.piecesPerPrint), per: String(p.perProduct),
        lines: p.lines.map((l) => ({ color: l.color, fil: '', price: t(l.pricePerKg), model: t(l.modelG), flushed: t(l.flushedG), tower: t(l.towerG) })) }
    }),
    bought: i.bought.map((b) => ({ name: b.name, price: t(b.price), qty: String(b.qty) })),
    shop: { watts: t(i.watts), tariff: t(i.tariff), printerPrice: t(i.printerPrice), life: t(i.lifetimeHours), laborMin: t(i.laborMinutes),
      laborRate: t(i.laborRate), fail: t(i.failurePct), margin: t(i.marginPct), sold: i.soldPrice === undefined ? '' : t(i.soldPrice) },
  }
}

const loadDraft = (): State => {
  const d = readDraft() as State | null
  return d && Array.isArray(d.parts) && Array.isArray(d.bought) && d.shop && d.parts.every((p) => Array.isArray(p.lines)) ? d : initial()
}

type Props = {
  filaments: Filament[]; printers: UserPrinter[]; supplies?: Supply[]
  products: SavedProduct[]; onSave: (name: string, i: ProductInput) => Promise<void>; onDelete: (id: string) => void; msg: string
  openId?: string
  onAddFilament?: (d: FilamentDraft) => Promise<void>; onAddPrinter?: (d: UserPrinterDraft) => Promise<void>; onAddSupply?: (d: SupplyDraft) => Promise<void>
}

export function Produto({ filaments, printers, supplies = [], products, onSave, onDelete, msg, onAddFilament, onAddPrinter, onAddSupply }: Props) {
  const [s, setS] = useState<State>(loadDraft)
  const [quick, setQuick] = useState<{ kind: 'fil'; n: number; k: number } | { kind: 'prn' } | { kind: 'sup'; n: number } | null>(null)
  const sRef = useRef(s)
  sRef.current = s
  const pend = useRef<{ kind: 'fil' | 'prn' | 'sup'; name: string; n: number; k: number } | null>(null)
  useEffect(() => { writeDraft(s) }, [s])
  const input = toInput(s)
  const errors = validateProduct(input)
  const r: ProductResult | null = errors.length ? null : calculateProduct(input)

  const setPart = (n: number, patch: Partial<PartF>) => setS({ ...s, parts: s.parts.map((p, i) => (i === n ? { ...p, ...patch } : p)) })
  const setLine = (n: number, k: number, patch: Partial<LineF>) =>
    setPart(n, { lines: s.parts[n].lines.map((l, i) => (i === k ? { ...l, ...patch } : l)) })
  const pickFilament = (n: number, k: number, id: string) => {
    const f = filaments.find((x) => x.id === id)
    setLine(n, k, f ? { fil: id, price: t(kgPrice(f)), color: s.parts[n].lines[k].color || f.color } : { fil: '' })
  }
  const setShop = (patch: Partial<ShopF>) => setS({ ...s, shop: { ...s.shop, ...patch } })
  const pickPrinter = (id: string) => {
    const p = printers.find((x) => x.id === id)
    setS({ ...s, printer: id, shop: p ? { ...s.shop, watts: t(p.watts), printerPrice: t(p.priceCents / 100), life: t(p.lifetimeHours) } : s.shop })
  }
  const field = (label: string, value: string, on: (v: string) => void, unit?: string, help?: AjudaKey, mode: 'decimal' | 'numeric' | 'text' = 'decimal') => (
    <Fld label={label} info={help ? AJUDA[help] : undefined} unit={unit} value={value} onChange={on} mode={mode} />
  )
  // Depois do cadastro rápido, o item novo já fica escolhido no ponto de onde a pessoa saiu.
  useEffect(() => {
    const q = pend.current
    if (!q) return
    if (q.kind === 'fil') { const f = filaments.find((x) => x.name === q.name); if (f) { pend.current = null; setS({ ...sRef.current, parts: sRef.current.parts.map((p, i) => (i !== q.n ? p : { ...p, lines: p.lines.map((l, j) => (j === q.k ? { ...l, fil: f.id, price: t(kgPrice(f)), color: l.color || f.color } : l)) })) }) } }
    if (q.kind === 'prn') { const p = printers.find((x) => x.name === q.name); if (p) { pend.current = null; setS({ ...sRef.current, printer: p.id, shop: { ...sRef.current.shop, watts: t(p.watts), printerPrice: t(p.priceCents / 100), life: t(p.lifetimeHours) } }) } }
    if (q.kind === 'sup') { const x = supplies.find((y) => y.name === q.name); if (x) { pend.current = null; setS({ ...sRef.current, bought: sRef.current.bought.map((y, i) => (i === q.n ? { ...y, name: x.name, price: t(x.costCents / 100) } : y)) }) } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filaments, printers, supplies])

  return (
    <div className="layout compact">
      <div className="result" aria-live="polite">
        {r ? <Result r={r} input={input} onSave={onSave} /> : (
          <div className="hero errors"><strong>Corrija para ver o resultado:</strong>
            <ul>{errors.slice(0, 6).map((e) => <li key={e}>{e}</li>)}</ul></div>
        )}
        <section className="card" style={{ marginTop: 12 }}>
          <h2>Meus produtos</h2>
          {msg && <p className="errors" role="alert">{msg}</p>}
          {!products.length ? <p className="note">Nenhum produto salvo ainda.</p> : (
            <ul className="jobs">
              {products.map((p) => (
                <li key={p.id}>
                  <span className="pick"><strong>{p.name}</strong><span>{new Date(p.savedAt).toLocaleDateString('pt-BR')} · {p.input.parts.length} partes</span></span>
                  <span className="acts">
                    <button type="button" onClick={() => setS(fromInput(p.input))}>Abrir</button>
                    <button type="button" onClick={() => { if (confirm(`Excluir "${p.name}"?`)) onDelete(p.id) }}>Excluir</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
        {s.parts.map((p, n) => (
          <section className="card2 partcard" key={n} aria-label={`Parte ${n + 1}`}>
            <h2>Parte {n + 1}{p.name.trim() ? `: ${titleCase(p.name.trim())}` : ''}</h2>
            <div className="partgrid">
              {field('Nome da parte', p.name, (v) => setPart(n, { name: v }), undefined, 'nomeParte', 'text')}
              <fieldset className="time">
                <legend className="lab">Tempo da impressão<Info label="Tempo da impressão" text={AJUDA.tempoParte} /></legend>
                <div className="hms">
                  {([['h', 'horas', 'h'], ['m', 'minutos', 'm'], ['s', 'segundos', 's']] as const).map(([k, l, u]) => (
                    <span className="input" key={k}><input inputMode="numeric" aria-label={`Parte ${n + 1}, ${l}`} value={p[k]} onChange={(e) => setPart(n, { [k]: e.target.value })} /><em>{u}</em></span>
                  ))}
                </div>
              </fieldset>
              {field('Peças por impressão', p.pieces, (v) => setPart(n, { pieces: v }), 'un', 'pecasPorImpressao', 'numeric')}
              {field('Peças por produto', p.per, (v) => setPart(n, { per: v }), 'un', 'pecasPorProduto', 'numeric')}
            </div>
            <h3>Cores e peso (do fatiador)</h3>
            {p.lines.map((l, k) => (
              <div className="line" key={k}>
                <div className="pair">
                  <Fld label="Filamento cadastrado" info={AJUDA.filamentoCadastrado}
                    plus={onAddFilament ? { label: 'Cadastrar novo filamento', onClick: () => setQuick({ kind: 'fil', n, k }) } : undefined}>
                    <select value={l.fil} onChange={(e) => pickFilament(n, k, e.target.value)}>
                      <option value="">Digitar o preço</option>
                      {filaments.map((f) => <option key={f.id} value={f.id}>{filamentLabel(f)}</option>)}
                    </select>
                  </Fld>
                  {field('Cor', l.color, (v) => setLine(n, k, { color: v }), undefined, 'corLinha', 'text')}
                </div>
                <div className="trio4">
                  {field('Preço do filamento', l.price, (v) => setLine(n, k, { price: v, fil: '' }), 'R$/kg', 'pricePerKg')}
                  {field('Peça', l.model, (v) => setLine(n, k, { model: v }), 'g', 'pecaG')}
                  {field('Purga', l.flushed, (v) => setLine(n, k, { flushed: v }), 'g', 'purgaG')}
                  {field('Torre', l.tower, (v) => setLine(n, k, { tower: v }), 'g', 'torreG')}
                </div>
                <p className="note">Total desta cor: {t(Math.round(lineGrams({ color: '', pricePerKg: 0, modelG: grams(l.model) || 0, flushedG: grams(l.flushed) || 0, towerG: grams(l.tower) || 0 }) * 100) / 100)} g
                  {p.lines.length > 1 && <> · <button type="button" className="linkish" onClick={() => setPart(n, { lines: p.lines.filter((_, i) => i !== k) })}>Remover cor</button></>}</p>
              </div>
            ))}
            <p><button type="button" onClick={() => setPart(n, { lines: [...p.lines, newLine()] })}>Adicionar cor</button>
              {s.parts.length > 1 && <> <button type="button" onClick={() => setS({ ...s, parts: s.parts.filter((_, i) => i !== n) })}>Remover esta parte</button></>}</p>
          </section>
        ))}
        <p><button type="button" className="primary" onClick={() => setS({ ...s, parts: [...s.parts, newPart()] })}>Adicionar parte</button></p>

        <section className="card2" style={{ marginBottom: 12 }}>
          <h2>Itens comprados <Info label="Itens comprados" text={AJUDA.itemComprado} /></h2>
          {s.bought.map((b, n) => (
            <div className="line" key={n}>
              <Fld label="Do estoque" info={AJUDA.doEstoque} plus={onAddSupply ? { label: 'Cadastrar novo item de estoque', onClick: () => setQuick({ kind: 'sup', n }) } : undefined}>
                <select value="" onChange={(e) => {
                  const x = supplies.find((q) => q.id === e.target.value)
                  if (x) setS({ ...s, bought: s.bought.map((y, i) => (i === n ? { ...y, name: x.name, price: t(x.costCents / 100) } : y)) })
                }}>
                  <option value="">Escolher item cadastrado</option>
                  {supplies.map((q) => <option key={q.id} value={q.id}>{q.name} ({(q.costCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</option>)}
                </select>
              </Fld>
              <div className="trio">
                {field('Item', b.name, (v) => setS({ ...s, bought: s.bought.map((x, i) => (i === n ? { ...x, name: v } : x)) }), undefined, 'nomeItem', 'text')}
                {field('Preço de cada', b.price, (v) => setS({ ...s, bought: s.bought.map((x, i) => (i === n ? { ...x, price: v } : x)) }), 'R$', 'precoCada')}
                {field('Quantidade', b.qty, (v) => setS({ ...s, bought: s.bought.map((x, i) => (i === n ? { ...x, qty: v } : x)) }), 'un', 'quantidade', 'numeric')}
              </div>
              <p><button type="button" onClick={() => setS({ ...s, bought: s.bought.filter((_, i) => i !== n) })}>Remover item</button></p>
            </div>
          ))}
          <p><button type="button" onClick={() => setS({ ...s, bought: [...s.bought, { name: '', price: '', qty: '1' }] })}>Adicionar item comprado</button></p>
        </section>

        <div className="cards">
          <section className="card2"><h2>Oficina</h2>
            <Fld label="Minha impressora" info={AJUDA.impressoraCadastrada} plus={onAddPrinter ? { label: 'Cadastrar nova impressora', onClick: () => setQuick({ kind: 'prn' }) } : undefined}>
              <select value={s.printer} onChange={(e) => pickPrinter(e.target.value)}>
                <option value="">Digitar abaixo</option>
                {printers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Fld>
            <div className="pair">
              {field('Consumo médio', s.shop.watts, (v) => setShop({ watts: v }), 'W', 'watts')}
              {field('Tarifa de energia', s.shop.tariff, (v) => setShop({ tariff: v }), 'R$/kWh', 'tariff')}
              {field('Preço da impressora', s.shop.printerPrice, (v) => setShop({ printerPrice: v }), 'R$', 'printerPrice')}
              {field('Vida útil estimada', s.shop.life, (v) => setShop({ life: v }), 'h', 'lifetimeHours')}
            </div>
          </section>
          <section className="card2"><h2>Seu tempo, riscos e venda</h2>
            <div className="pair">
              {field('Seu tempo por produto', s.shop.laborMin, (v) => setShop({ laborMin: v }), 'min', 'laborProduto')}
              {field('Valor da sua hora', s.shop.laborRate, (v) => setShop({ laborRate: v }), 'R$/h', 'laborRate')}
              {field('Impressões que falham', s.shop.fail, (v) => setShop({ fail: v }), '%', 'failurePct')}
              {field('Margem desejada', s.shop.margin, (v) => setShop({ margin: v }), '%', 'marginPct')}
            </div>
            {field('Preço que você cobra (opcional)', s.shop.sold, (v) => setShop({ sold: v }), 'R$', 'soldPrice')}
          </section>
        </div>
        <p><button type="button" onClick={() => { if (confirm('Limpar tudo e começar um produto novo?')) setS(initial()) }}>Começar produto novo</button></p>
      </form>
      {quick?.kind === 'fil' && onAddFilament && <QuickFilament onAdd={onAddFilament} onClose={() => setQuick(null)} onSaved={(name) => { pend.current = { kind: 'fil', name, n: quick.n, k: quick.k } }} />}
      {quick?.kind === 'prn' && onAddPrinter && <QuickPrinter onAdd={onAddPrinter} onClose={() => setQuick(null)} defaults={{ watts: s.shop.watts, price: s.shop.printerPrice, life: s.shop.life }} onSaved={(name) => { pend.current = { kind: 'prn', name, n: 0, k: 0 } }} />}
      {quick?.kind === 'sup' && onAddSupply && <QuickSupply onAdd={onAddSupply} onClose={() => setQuick(null)} onSaved={(name) => { pend.current = { kind: 'sup', name, n: quick.n, k: 0 } }} />}
    </div>
  )
}

function Result({ r, input, onSave }: { r: ProductResult; input: ProductInput; onSave: (name: string, i: ProductInput) => Promise<void> }) {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const save = async () => { try { await onSave(name, input); setMsg('Salvo.'); setName('') } catch (e) { setMsg((e as Error).message) } }
  const g = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return (
    <>
      <div className="hero">
        <div><small>Custo do produto</small><strong>{money(r.total)}</strong></div>
        <div className="sug"><small>Preço sugerido ({pct(input.marginPct / 100)} de margem)</small><strong>{money(r.suggestedPrice)}</strong></div>
      </div>
      <div className="details">
        <h2>Para onde vai o custo</h2>
        <div className="scroll stack"><table>
          <thead><tr>{['Parte', 'Filamento', 'Purga e torre', 'Energia e máquina', 'Subtotal'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{r.parts.map((p, i) => (
            <tr key={i}>
              <td data-label="Parte">{p.name}</td><td data-label="Filamento">{money(p.material)}</td><td data-label="Purga e torre">{money(p.waste)}</td>
              <td data-label="Energia e máquina">{money(p.energy + p.machine)}</td><td data-label="Subtotal"><strong>{money(p.subtotal)}</strong></td>
            </tr>))}</tbody>
        </table></div>
        <ul className="sum">
          <li><span>Itens comprados</span><strong>{money(r.bought)}</strong></li>
          <li><span>Seu tempo</span><strong>{money(r.labor)}</strong></li>
          <li><span>Falhas</span><strong>{money(r.failure)}</strong></li>
          <li className="tot"><span>Total do produto</span><strong>{money(r.total)}</strong></li>
        </ul>
        {r.grams.waste > 0 && (
          <p className="note"><strong>{pct(r.wastePct)} do filamento vira purga e torre</strong> ({g(r.grams.waste)} g de {g(r.grams.model + r.grams.waste)} g por produto). Trocar menos de cor ou reduzir a purga no fatiador baixa o custo.</p>
        )}
        {r.priceIsSuggested ? <p className="note">Informe o preço que você cobra para ver o lucro real.</p> : (
          <div className="price"><small>Com o preço que você cobra ({money(r.price)})</small>
            <strong className={r.profit < 0 ? 'loss' : ''}>Lucro {money(r.profit)} por produto</strong>
            <span>Margem {pct(r.margin)} · Markup {pct(r.markup)} · {money(r.profitPerHour)} por hora de máquina</span>
            {r.profit < 0 && <span className="loss">Esse preço está abaixo do custo.</span>}</div>
        )}
        <Fld label="Nome do produto" info={AJUDA.nomeProduto} mode="text" value={name} onChange={setName} placeholder="Ex.: Caneca Flamengo" maxLength={60} />
        <p><button type="button" className="primary" onClick={save}>Salvar produto</button></p>
        {msg && <p className="note" role="status">{msg}</p>}
      </div>
    </>
  )
}
