import { BotaoExcluir, BotaoConfirmar } from './Janela'
import { useEffect, useRef, useState } from 'react'
import { calculateProduct, lineGrams, validateProduct, type ProductInput, type ProductResult, type SavedProduct } from './domain/product'
import { filamentLabel, latestRollFor, pricePerKg as kgPrice, type Filament } from './domain/filament'
import { fromHMS, toHMS } from './domain/time'
import type { UserPrinter } from './domain/printers'
import type { Supply } from './domain/supply'
import { money, pct } from './format'
import { readDraft, writeDraft } from './storage'
import { AJUDA, type AjudaKey } from './ajuda'
import { Fld, Info } from './Campos'
import { QuickFilament, QuickPrinter } from './Rapido'
import { SecaoItens, type ItemF } from './Itens'
import { titleCase } from './domain/texto'
import type { Linha } from './domain/trabalhos'
import { ListaTrabalhos } from './ListaTrabalhos'
import { BotaoIcone, ICONES } from './Icones'
import { irParaCampo, Pendencias, useAtalhoBusca, type FieldItem } from './Pendencias'
import type { FilamentDraft } from './domain/filament'
import type { UserPrinterDraft } from './domain/printers'
import type { SupplyDraft } from './domain/supply'
import { summarize, type SavedCalc } from './domain/saved'
import { ImportGcode } from './ImportGcode'
import type { GcodeResult } from './domain/gcode'

type LineF = { color: string; fil: string; price: string; model: string; flushed: string; tower: string }
type PartF = { name: string; h: string; m: string; s: string; pieces: string; per: string; lines: LineF[] }
type BoughtF = ItemF
type ShopF = { watts: string; tariff: string; printerPrice: string; life: string; laborMin: string; laborRate: string; fail: string; margin: string; sold: string }
type State = { parts: PartF[]; bought: BoughtF[]; shop: ShopF; printer: string }

const newLine = (): LineF => ({ color: '', fil: '', price: '', model: '', flushed: '', tower: '' })
const newPart = (): PartF => ({ name: '', h: '0', m: '0', s: '0', pieces: '1', per: '1', lines: [newLine()] })
const initial = (): State => ({
  parts: [newPart()], bought: [], printer: '',
  shop: { watts: '150', tariff: '1,03', printerPrice: '3500', life: '3000', laborMin: '10', laborRate: '20', fail: '10', margin: '50', sold: '' },
})
// Campos obrigatórios: quando vazios ou inválidos, ficam em laranja.
const REQUIRED = new Set(['Nome da parte', 'Peças por impressão', 'Peças por produto', 'Preço do filamento', 'Item', 'Preço de cada', 'Quantidade', 'Consumo médio', 'Tarifa de energia', 'Preço da impressora', 'Vida útil estimada', 'Seu tempo por produto', 'Valor da sua hora', 'Impressões que falham', 'Margem desejada'])
const bad = (v: string) => v.trim() === '' || Number.isNaN(Number(v.replace(',', '.')))
// Leva a pessoa ao primeiro campo laranja, já selecionado para só digitar.
const goTo = (el: HTMLElement, openTab: (t: Tab) => void) => irParaCampo(el, (t) => openTab(t as Tab))
function focusMissing(openTab: (t: Tab) => void): boolean {
  const el = document.querySelector<HTMLInputElement>('.input.missing input')
  if (!el) return false
  goTo(el, openTab)
  return true
}
type Tab = 'partes' | 'filamentos' | 'impressora' | 'itens' | 'venda' | 'produtos'
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
  linhas: Linha[]; onSave: (name: string, i: ProductInput) => Promise<void>; onAbrir: (l: Linha) => void; onApagar: (ls: Linha[]) => void
  aberto?: SavedProduct | null; onAberto?: () => void; msg: string
  openId?: string
  savedParts?: SavedCalc[]
  onAddFilament?: (d: FilamentDraft) => Promise<void>; onAddPrinter?: (d: UserPrinterDraft) => Promise<void>; onAddSupply?: (d: SupplyDraft) => Promise<void>
}

export function Produto({ filaments, printers, supplies = [], linhas, onSave, onAbrir, onApagar, aberto, onAberto, msg, onAddFilament, onAddPrinter, onAddSupply, savedParts = [] }: Props) {
  const [s, setS] = useState<State>(loadDraft)
  const [quick, setQuick] = useState<{ kind: 'fil'; n: number; k: number } | { kind: 'prn' } | null>(null)
  const [suggest, setSuggest] = useState('')
  const [name, setName] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [tab, setTab] = useState<Tab>('produtos')
  const [dlg, setPend] = useState<null | 'faltam' | 'busca'>(null)
  useAtalhoBusca(() => setPend('busca'))
  const [miss, setMiss] = useState<Record<string, number>>({})
  useEffect(() => {
    const m: Record<string, number> = {}
    document.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => { m[p.dataset.tab!] = p.querySelectorAll('.input.missing').length })
    setMiss((o) => (JSON.stringify(o) === JSON.stringify(m) ? o : m))
  })
  useEffect(() => { if (suggest) setName((n) => n || suggest) }, [suggest])
  const doSave = async () => {
    try {
      // Mesmo nome = mesmo produto: o salvamento entra como nova versão no histórico.
      const n = linhas.filter((x) => x.name.trim().toLowerCase() === name.trim().toLowerCase()).length
      await onSave(name, toInput(s))
      setSaveMsg(n ? `Salvo como versão ${n + 1} de "${titleCase(name)}". As anteriores ficam no histórico.` : 'Salvo.'); setName('')
    } catch (e) { setSaveMsg((e as Error).message) }
  }
  useEffect(() => { if (aberto) { setS(fromInput(aberto.input)); setName(aberto.name); onAberto?.(); setTab('partes') } }, [aberto]) // eslint-disable-line react-hooks/exhaustive-deps
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
  // Aba Filamentos: um preço por cor, aplicado a todas as partes que usam essa cor (como o fatiador).
  const colorKey = (l: LineF, n: number, k: number) => l.color.trim().toLowerCase() || `#${n}.${k}`
  const colorGroups = (() => {
    const m = new Map<string, { key: string; label: string; at: [number, number][] }>()
    s.parts.forEach((p, n) => p.lines.forEach((l, k) => {
      const key = colorKey(l, n, k)
      const g = m.get(key) ?? { key, label: l.color.trim() ? titleCase(l.color.trim()) : `Cor sem nome (parte ${n + 1})`, at: [] }
      g.at.push([n, k]); m.set(key, g)
    }))
    return [...m.values()]
  })()
  const setGroup = (g: { at: [number, number][] }, patch: Partial<LineF>) =>
    setS({ ...s, parts: s.parts.map((p, n) => ({ ...p, lines: p.lines.map((l, k) => (g.at.some(([a, b]) => a === n && b === k) ? { ...l, ...patch } : l)) })) })
  const pickGroup = (g: { at: [number, number][] }, id: string) => {
    const f = filaments.find((x) => x.id === id)
    setGroup(g, f ? { fil: id, price: t(kgPrice(f)) } : { fil: '' })
  }
  const pickFilament = (n: number, k: number, id: string) => {
    const f = filaments.find((x) => x.id === id)
    setLine(n, k, f ? { fil: id, price: t(kgPrice(f)), color: s.parts[n].lines[k].color || f.color } : { fil: '' })
  }
  // Cada .gcode vira uma parte: tempo e, por cor, peça, purga (estimada) e torre. Rolo cadastrado da mesma cor entra com o preço.
  const importParts = (rs: GcodeResult[], extra: { projectName?: string } = {}) => {
    const fresh = (p: PartF) => !p.name.trim() && p.lines.every((l) => !l.model && !l.price && !l.color)
    const built: PartF[] = rs.map((r) => {
      const { h, m, s: sec } = toHMS(r.hours)
      return { name: r.name, h: String(h), m: String(m), s: String(sec), pieces: '1', per: '1',
        lines: r.tools.map((tl) => {
          const f = latestRollFor(filaments, tl.name)
          return { color: tl.name, fil: f?.id ?? '', price: f ? t(kgPrice(f)) : '', model: t(tl.modelG), flushed: t(tl.purgeG), tower: t(tl.towerG) }
        }) }
    })
    const keep = s.parts.filter((p) => !fresh(p))
    setS({ ...s, parts: [...keep, ...built] })
    const prod = extra.projectName || rs.find((r) => r.product)?.product
    if (prod) setSuggest(prod)
  }
  const setShop = (patch: Partial<ShopF>) => setS({ ...s, shop: { ...s.shop, ...patch } })
  const pickPrinter = (id: string) => {
    const p = printers.find((x) => x.id === id)
    setS({ ...s, printer: id, shop: p ? { ...s.shop, watts: t(p.watts), printerPrice: t(p.priceCents / 100), life: t(p.lifetimeHours) } : s.shop })
  }
  const field = (label: string, value: string, on: (v: string) => void, unit?: string, help?: AjudaKey, mode: 'decimal' | 'numeric' | 'text' = 'decimal') => (
    <Fld label={label} info={help ? AJUDA[help] : undefined} unit={unit} value={value} onChange={on} mode={mode} missing={REQUIRED.has(label) && (mode === 'text' ? value.trim() === '' : bad(value))} />
  )
  // Depois do cadastro rápido, o item novo já fica escolhido no ponto de onde a pessoa saiu.
  useEffect(() => {
    const q = pend.current
    if (!q) return
    if (q.kind === 'fil') { const f = filaments.find((x) => x.name === q.name); if (f) { pend.current = null; const cur = sRef.current; const key = cur.parts[q.n]?.lines[q.k]?.color.trim().toLowerCase() ?? ''; setS({ ...cur, parts: cur.parts.map((p, i) => ({ ...p, lines: p.lines.map((l, j) => ((i === q.n && j === q.k) || (key && l.color.trim().toLowerCase() === key) ? { ...l, fil: f.id, price: t(kgPrice(f)), color: l.color || f.color } : l)) })) }) } }
    if (q.kind === 'prn') { const p = printers.find((x) => x.name === q.name); if (p) { pend.current = null; setS({ ...sRef.current, printer: p.id, shop: { ...sRef.current.shop, watts: t(p.watts), printerPrice: t(p.priceCents / 100), life: t(p.lifetimeHours) } }) } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filaments, printers, supplies])

  return (
    <>
    <div className="layout compact">
      <div className="result" aria-live="polite">
        {r ? <Result r={r} input={input} name={name} setName={setName} save={doSave} msg={saveMsg} /> : (
          <div className="hero errors"><strong>Corrija para ver o resultado:</strong>
            <ul>{[...new Set(errors)].slice(0, 8).map((e) => <li key={e}>{e}</li>)}</ul>
            <p className="note">O botão Salvar produto aparece aqui, no lugar deste aviso, quando não houver mais nada para corrigir.</p></div>
        )}
      </div>

      <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="tabs" role="tablist" aria-label="Seções do produto">
          {([['produtos', 'Produtos', linhas.length], ['partes', 'Partes', s.parts.length], ['filamentos', 'Filamentos', colorGroups.length], ['impressora', 'Impressora', 0], ['itens', 'Itens', s.bought.length], ['venda', 'Venda', 0]] as const).map(([k, l, n]) => (
            <button type="button" role="tab" key={k} id={`tab-${k}`} aria-selected={tab === k} aria-controls={`painel-${k}`} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {l}{n > 0 && <span className="cnt">{n}</span>}{miss[k] > 0 && <span className="dot" title="Falta preencher" aria-label="falta preencher" />}
            </button>
          ))}
          <span className="tabsearch"><BotaoIcone icone={ICONES.lupa} label="Buscar campo (Ctrl+K)" onClick={() => setPend('busca')} /></span>
        </div>
        <div role="tabpanel" id="painel-produtos" aria-labelledby="tab-produtos" data-tab="produtos" hidden={tab !== 'produtos'}>
        <section className="card2">
          <div className="listhead"><h2>Meus produtos</h2>
            <BotaoConfirmar label="Novo produto" titulo="Começar um produto novo?" texto="Limpa as partes, os itens e os valores desta tela. Os produtos já salvos continuam na lista." acao="Começar" perigoso={false} onConfirm={() => { setS(initial()); setName(''); setTab('partes') }} /></div>
          {msg && <p className="errors" role="alert">{msg}</p>}
          {!linhas.length ? <p className="note">Nenhum produto salvo ainda.</p> : <ListaTrabalhos linhas={linhas} onOpen={(l) => { onAbrir(l); setTab('partes') }} onDelete={onApagar} />}
        </section>
        </div>

        <div role="tabpanel" id="painel-partes" aria-labelledby="tab-partes" data-tab="partes" hidden={tab !== 'partes'}>
        {s.parts.map((p, n) => (
          <section className="card2 partcard" key={n} aria-label={`Parte ${n + 1}`}>
            <h2>Parte {n + 1}{p.name.trim() ? `: ${titleCase(p.name.trim())}` : ''}</h2>
            <div className="partgrid">
              {field('Nome da parte', p.name, (v) => setPart(n, { name: v }), undefined, 'nomeParte', 'text')}
              <fieldset className="time">
                <legend className="lab">Tempo da impressão<Info label="Tempo da impressão" text={AJUDA.tempoParte} /></legend>
                <div className="hms">
                  {([['h', 'horas', 'h'], ['m', 'minutos', 'm'], ['s', 'segundos', 's']] as const).map(([k, l, u]) => (
                    <span className={fromHMS(p.h, p.m, p.s) > 0 ? 'input' : 'input missing'} key={k}><input inputMode="numeric" aria-label={`Parte ${n + 1}, ${l}`} value={p[k]} onChange={(e) => setPart(n, { [k]: e.target.value })} /><em>{u}</em></span>
                  ))}
                </div>
              </fieldset>
              {field('Peças por impressão', p.pieces, (v) => setPart(n, { pieces: v }), 'un', 'pecasPorImpressao', 'numeric')}
              {field('Peças por produto', p.per, (v) => setPart(n, { per: v }), 'un', 'pecasPorProduto', 'numeric')}
            </div>
            <h3>Cores e peso (do fatiador)</h3>
            {p.lines.map((l, k) => (
              <div className="line" key={k}>
                {field('Cor', l.color, (v) => setLine(n, k, { color: v }), undefined, 'corLinha', 'text')}
                <div className="trio">
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
        <div className="addrow">
          <button type="button" className="primary" onClick={() => setS({ ...s, parts: [...s.parts, newPart()] })}>Adicionar parte</button>
          <ImportGcode multiple label="Importar do fatiador (.gcode)" onResults={importParts} />
          <Info label="Importar do fatiador" text={AJUDA.importar} />
        </div>
        <p className="note">Importou? Confira o preço do filamento em cada cor. A purga por cor é estimada: o total vem do fatiador.</p>
        </div>

        <div role="tabpanel" id="painel-filamentos" aria-labelledby="tab-filamentos" data-tab="filamentos" hidden={tab !== 'filamentos'}>
          <section className="card2">
            <h2>Filamentos <Info label="Filamentos" text={AJUDA.filamentosProduto} /></h2>
            {!colorGroups.length ? <p className="note">Adicione partes com cores para escolher o filamento de cada uma.</p> : colorGroups.map((g) => {
              const first = s.parts[g.at[0][0]].lines[g.at[0][1]]
              const total = g.at.reduce((sum, [a, b]) => { const l = s.parts[a].lines[b]; return sum + lineGrams({ color: '', pricePerKg: 0, modelG: grams(l.model) || 0, flushedG: grams(l.flushed) || 0, towerG: grams(l.tower) || 0 }) }, 0)
              return (
                <div className="line" key={g.key}>
                  <h3>{g.label}</h3>
                  <div className="pair">
                    <Fld label="Filamento cadastrado" info={AJUDA.filamentoCadastrado}
                      plus={onAddFilament ? { label: 'Cadastrar novo filamento', onClick: () => setQuick({ kind: 'fil', n: g.at[0][0], k: g.at[0][1] }) } : undefined}>
                      <select value={first.fil} onChange={(e) => pickGroup(g, e.target.value)}>
                        <option value="">Digitar o preço</option>
                        {filaments.map((f) => <option key={f.id} value={f.id}>{filamentLabel(f)}</option>)}
                      </select>
                    </Fld>
                    {field('Preço do filamento', first.price, (v) => setGroup(g, { price: v, fil: '' }), 'R$/kg', 'pricePerKg')}
                  </div>
                  {!first.fil && (() => { const r = latestRollFor(filaments, g.label); return r ? (
                    <p className="note">Rolo mais recente desta cor: <strong>{filamentLabel(r)}</strong> <button type="button" className="linkish" onClick={() => pickGroup(g, r.id)}>Usar este</button></p>) : null })()}
                  <p className="note">Usada em {g.at.length} {g.at.length === 1 ? 'parte' : 'partes'} · {t(Math.round(total * 100) / 100)} g no total</p>
                </div>
              )
            })}
          </section>
        </div>

        <div role="tabpanel" id="painel-itens" aria-labelledby="tab-itens" data-tab="itens" hidden={tab !== 'itens'}>
        <SecaoItens itens={s.bought} onChange={(bought) => setS({ ...s, bought })} supplies={supplies} onAddSupply={onAddSupply} savedParts={savedParts} />

        </div>

        <div role="tabpanel" id="painel-impressora" aria-labelledby="tab-impressora" data-tab="impressora" hidden={tab !== 'impressora'}>
          <section className="card2"><h2>Impressora e energia</h2>
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
        </div>

        <div role="tabpanel" id="painel-venda" aria-labelledby="tab-venda" data-tab="venda" hidden={tab !== 'venda'}>
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


      </form>
      {dlg && <Pendencias startSearch={dlg === 'busca'} onClose={() => setPend(null)}
        onGo={(it: FieldItem) => { setPend(null); goTo(it.el, setTab) }}
        fill={{
          count: colorGroups.filter((g) => bad(s.parts[g.at[0][0]].lines[g.at[0][1]].price)).length,
          filaments: filaments.map((f) => ({ id: f.id, label: filamentLabel(f), price: t(kgPrice(f)) })),
          apply: (price, filId) => {
            const todo = colorGroups.filter((g) => bad(s.parts[g.at[0][0]].lines[g.at[0][1]].price))
            setS({ ...s, parts: s.parts.map((p, n) => ({ ...p, lines: p.lines.map((l, k) => (todo.some((g) => g.at.some(([a, b]) => a === n && b === k)) ? { ...l, price, fil: filId } : l)) })) })
            setPend(null)
          },
        }} />}
      {quick?.kind === 'fil' && onAddFilament && <QuickFilament onAdd={onAddFilament} onClose={() => setQuick(null)} onSaved={(name) => { pend.current = { kind: 'fil', name, n: quick.n, k: quick.k } }} />}
      {quick?.kind === 'prn' && onAddPrinter && <QuickPrinter onAdd={onAddPrinter} onClose={() => setQuick(null)} defaults={{ watts: s.shop.watts, price: s.shop.printerPrice, life: s.shop.life }} onSaved={(name) => { pend.current = { kind: 'prn', name, n: 0, k: 0 } }} />}
    </div>
    <SummaryBar count={Object.values(miss).reduce((a, b) => a + b, 0)} onMissing={() => setPend('faltam')} r={r} input={input} errors={[...new Set(errors)]} name={name} setName={setName} save={doSave} msg={saveMsg} />
    </>
  )
}

function Result({ r, input, name, setName, save, msg }: { r: ProductResult; input: ProductInput; name: string; setName: (n: string) => void; save: () => Promise<void>; msg: string }) {
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
        <div id="salvar-produto" className="saveanchor">
        <Fld id="nome-produto-salvar" label="Nome do produto" info={AJUDA.nomeProduto} mode="text" value={name} onChange={setName} placeholder="Ex.: Caneca Flamengo" maxLength={60} />
        <p><button type="button" className="primary" onClick={save}>Salvar produto</button></p>
        {msg && <p className="note" role="status">{msg}</p>}
        </div>
      </div>
    </>
  )
}

// Barra de resumo fixa embaixo da tela: custo, preço sugerido e a opção de salvar. A coluna da direita continua com os cálculos.
function SummaryBar({ r, input, errors, name, setName, save, msg, onMissing, count }: {
  count: number
  onMissing: () => boolean | void
  r: ProductResult | null; input: ProductInput; errors: string[]; name: string; setName: (n: string) => void; save: () => Promise<void>; msg: string
}) {
  const top = () => { onMissing() }
  return (
    <div className="sumbar" role="region" aria-label="Resumo do produto">
      {r ? (
        <>
          <div className="k"><small>Custo do produto</small><strong>{money(r.total)}</strong></div>
          <div className="k sug"><small>Preço sugerido ({pct(input.marginPct / 100)})</small><strong>{money(r.suggestedPrice)}</strong></div>
          <span className="input name"><input aria-label="Nome do produto para salvar" placeholder="Nome do produto" value={name} maxLength={60}
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void save() }} /></span>
          <button type="button" className="primary" onClick={() => void save()}>Salvar produto</button>
          {msg && <small role="status" className="msg">{msg}</small>}
        </>
      ) : (
        <>
          <div className="k"><strong>Faltam {count || errors.length} {(count || errors.length) === 1 ? 'item' : 'itens'} para salvar</strong><small className="first">{errors[0]}</small></div>
          <button type="button" onClick={top}>Ver o que falta</button>
        </>
      )}
    </div>
  )
}
