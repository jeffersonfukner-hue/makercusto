import { useEffect, useState } from 'react'
import { calculateProduct, lineGrams, validateProduct, type ProductInput, type ProductResult, type SavedProduct } from './domain/product'
import { filamentLabel, pricePerKg as kgPrice, type Filament } from './domain/filament'
import { fromHMS, toHMS } from './domain/time'
import type { UserPrinter } from './domain/printers'
import { money, pct } from './format'
import { readDraft, writeDraft } from './storage'

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
  filaments: Filament[]; printers: UserPrinter[]
  products: SavedProduct[]; onSave: (name: string, i: ProductInput) => Promise<void>; onDelete: (id: string) => void; msg: string
  openId?: string
}

export function Produto({ filaments, printers, products, onSave, onDelete, msg }: Props) {
  const [s, setS] = useState<State>(loadDraft)
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
  const field = (label: string, value: string, on: (v: string) => void, unit?: string, hint?: string, mode: 'decimal' | 'numeric' | 'text' = 'decimal') => (
    <label>
      <span>{label}</span>
      <span className="input"><input inputMode={mode} value={value} onChange={(e) => on(e.target.value)} />{unit && <em>{unit}</em>}</span>
      {hint && <small>{hint}</small>}
    </label>
  )

  return (
    <div className="layout">
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
          <fieldset key={n}>
            <legend>Parte {n + 1}{p.name.trim() ? `: ${p.name.trim()}` : ''}</legend>
            {field('Nome da parte', p.name, (v) => setPart(n, { name: v }), undefined, 'Ex.: brasão, base, aro. Uma parte = uma impressão (uma placa do fatiador).', 'text')}
            <fieldset className="time">
              <legend>Tempo da impressão</legend>
              <div className="hms">
                {([['h', 'horas'], ['m', 'minutos'], ['s', 'segundos']] as const).map(([k, l]) => (
                  <label key={k}><span>{l}</span><span className="input"><input inputMode="numeric" aria-label={`Parte ${n + 1}, ${l}`} value={p[k]} onChange={(e) => setPart(n, { [k]: e.target.value })} /></span></label>
                ))}
              </div>
            </fieldset>
            <div className="two">
              {field('Peças por impressão', p.pieces, (v) => setPart(n, { pieces: v }), 'un', 'Quantas saem da mesma placa.', 'numeric')}
              {field('Peças por produto', p.per, (v) => setPart(n, { per: v }), 'un', 'Quantas o produto usa.', 'numeric')}
            </div>
            <h3>Cores e peso (do fatiador)</h3>
            {p.lines.map((l, k) => (
              <div className="line" key={k}>
                {filaments.length > 0 && (
                  <label><span>Filamento cadastrado</span>
                    <span className="input"><select value={l.fil} onChange={(e) => pickFilament(n, k, e.target.value)}>
                      <option value="">Digitar o preço</option>
                      {filaments.map((f) => <option key={f.id} value={f.id}>{filamentLabel(f)}</option>)}
                    </select></span></label>
                )}
                {field('Cor', l.color, (v) => setLine(n, k, { color: v }), undefined, undefined, 'text')}
                {field('Preço do filamento', l.price, (v) => setLine(n, k, { price: v, fil: '' }), 'R$/kg')}
                <div className="three">
                  {field('Peça', l.model, (v) => setLine(n, k, { model: v }), 'g')}
                  {field('Purga', l.flushed, (v) => setLine(n, k, { flushed: v }), 'g')}
                  {field('Torre', l.tower, (v) => setLine(n, k, { tower: v }), 'g')}
                </div>
                <p className="note">Total desta cor: {t(Math.round(lineGrams({ color: '', pricePerKg: 0, modelG: grams(l.model) || 0, flushedG: grams(l.flushed) || 0, towerG: grams(l.tower) || 0 }) * 100) / 100)} g
                  {p.lines.length > 1 && <> · <button type="button" className="linkish" onClick={() => setPart(n, { lines: p.lines.filter((_, i) => i !== k) })}>Remover cor</button></>}</p>
              </div>
            ))}
            <p><button type="button" onClick={() => setPart(n, { lines: [...p.lines, newLine()] })}>Adicionar cor</button>
              {s.parts.length > 1 && <> <button type="button" onClick={() => setS({ ...s, parts: s.parts.filter((_, i) => i !== n) })}>Remover esta parte</button></>}</p>
          </fieldset>
        ))}
        <p><button type="button" className="primary" onClick={() => setS({ ...s, parts: [...s.parts, newPart()] })}>Adicionar parte</button></p>

        <fieldset>
          <legend>Itens comprados</legend>
          <p className="note">O que você compra pronto e entra no produto, como o copo de alumínio. Não passa pela taxa de falhas.</p>
          {s.bought.map((b, n) => (
            <div className="line" key={n}>
              {field('Item', b.name, (v) => setS({ ...s, bought: s.bought.map((x, i) => (i === n ? { ...x, name: v } : x)) }), undefined, undefined, 'text')}
              <div className="two">
                {field('Preço de cada', b.price, (v) => setS({ ...s, bought: s.bought.map((x, i) => (i === n ? { ...x, price: v } : x)) }), 'R$')}
                {field('Quantidade', b.qty, (v) => setS({ ...s, bought: s.bought.map((x, i) => (i === n ? { ...x, qty: v } : x)) }), 'un', undefined, 'numeric')}
              </div>
              <p><button type="button" onClick={() => setS({ ...s, bought: s.bought.filter((_, i) => i !== n) })}>Remover item</button></p>
            </div>
          ))}
          <p><button type="button" onClick={() => setS({ ...s, bought: [...s.bought, { name: '', price: '', qty: '1' }] })}>Adicionar item comprado</button></p>
        </fieldset>

        <fieldset>
          <legend>Oficina</legend>
          {printers.length > 0 && (
            <label><span>Minha impressora</span>
              <span className="input"><select value={s.printer} onChange={(e) => pickPrinter(e.target.value)}>
                <option value="">Digitar abaixo</option>
                {printers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></span></label>
          )}
          {field('Consumo médio da impressora', s.shop.watts, (v) => setShop({ watts: v }), 'W', 'Estimativa. Meça com um wattímetro se puder.')}
          {field('Tarifa de energia', s.shop.tariff, (v) => setShop({ tariff: v }), 'R$/kWh')}
          {field('Preço da impressora', s.shop.printerPrice, (v) => setShop({ printerPrice: v }), 'R$')}
          {field('Vida útil estimada', s.shop.life, (v) => setShop({ life: v }), 'h')}
          {field('Trabalho manual por produto', s.shop.laborMin, (v) => setShop({ laborMin: v }), 'min', 'Montagem, colagem, acabamento.')}
          {field('Valor da sua hora', s.shop.laborRate, (v) => setShop({ laborRate: v }), 'R$/h')}
          {field('Impressões que falham', s.shop.fail, (v) => setShop({ fail: v }), '%', 'Entre 5 e 15% é comum.')}
        </fieldset>

        <fieldset>
          <legend>Venda</legend>
          {field('Margem desejada', s.shop.margin, (v) => setShop({ margin: v }), '%', 'Margem = lucro ÷ preço. Não é o mesmo que markup.')}
          {field('Preço que você cobra (opcional)', s.shop.sold, (v) => setShop({ sold: v }), 'R$', 'Preencha para ver o lucro real.')}
        </fieldset>
        <p><button type="button" onClick={() => { if (confirm('Limpar tudo e começar um produto novo?')) setS(initial()) }}>Começar produto novo</button></p>
      </form>
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
        <label><span>Nome do produto</span><span className="input"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: caneca Flamengo" /></span></label>
        <p><button type="button" className="primary" onClick={save}>Salvar produto</button></p>
        {msg && <p className="note" role="status">{msg}</p>}
      </div>
    </>
  )
}
