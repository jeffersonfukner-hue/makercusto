import { useEffect, useState } from 'react'
import { Composition } from './Composition'
import { Dashboard } from './Dashboard'
import { calculateCost, validate, type CostInput, type CostResult } from './domain/cost'
import { addSaved, summarize, type SavedCalc } from './domain/saved'
import { money, pct } from './format'
import { ESSENTIAL, inputForMode, type Mode } from './modes'
import { cloud, onUser, signInWithGoogle, signOut, supabase } from './supabase'
import { readMode, readSaved, writeMode, writeSaved } from './storage'

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))

function useRoute() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return hash === '#/calculadora' ? 'calculadora' : hash === '#/painel' ? 'painel' : 'inicio'
}

const toForm = (i: CostInput): Form => {
  const t = (n: number) => String(n).replace('.', ',')
  return {
    grams: t(i.grams), pricePerKg: t(i.pricePerKg), hours: t(i.hours), watts: t(i.watts), tariff: t(i.tariff),
    printerPrice: t(i.printerPrice), lifetimeHours: t(i.lifetimeHours), laborMinutes: t(i.laborMinutes),
    laborRate: t(i.laborRate), failurePct: t(i.failurePct), quantity: t(i.quantity), marginPct: t(i.marginPct),
    soldPrice: i.soldPrice === undefined ? '' : t(i.soldPrice),
  }
}

export default function App() {
  const route = useRoute()
  const [form, setForm] = useState<Form>(initial)
  const [saved, setSaved] = useState<SavedCalc[]>(readSaved)
  const [mode, setModeState] = useState<Mode>(readMode)
  const [user, setUser] = useState<string | null>(null)
  const [cloudMsg, setCloudMsg] = useState('')
  const setMode = (m: Mode) => { setModeState(m); writeMode(m) }
  const update = (next: SavedCalc[]) => { setSaved(next); writeSaved(next) }
  const account: Account = supabase ? { user, signIn: signInWithGoogle, signOut } : null

  useEffect(() => onUser(setUser), [])
  useEffect(() => {
    if (!cloud) return
    if (!user) { setSaved(readSaved()); setCloudMsg(''); return }
    cloud.list().then((l) => { setSaved(l); setCloudMsg('') }).catch((e: Error) => setCloudMsg(e.message))
  }, [user])

  const onSave = async (name: string, input: CostInput) => {
    if (user && cloud) { await cloud.save(name, input); setSaved(await cloud.list()); return }
    update(addSaved(saved, name, input, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, new Date().toISOString()))
  }
  const onDelete = async (id: string) => {
    if (!(user && cloud)) return update(saved.filter((x) => x.id !== id))
    try { await cloud.remove(id); setSaved(await cloud.list()); setCloudMsg('') } catch (e) { setCloudMsg((e as Error).message) }
  }

  if (route === 'calculadora') {
    return <Calculator form={form} setForm={setForm} onSave={onSave} mode={mode} setMode={setMode} account={account} />
  }
  if (route === 'painel') {
    const onOpen = (id: string) => {
      const s = saved.find((x) => x.id === id)
      if (s) { setForm(toForm(s.input)); location.hash = '#/calculadora' }
    }
    return (
      <main className="wrap">
        <Nav route="painel" account={account} />
        <h1>Painel</h1>
        <p className="lead">
          {user ? `Seus cálculos na nuvem, na conta ${user}. Os que você salvou antes de entrar continuam só neste navegador.`
            : account ? 'Seus cálculos salvos neste navegador. Entre com Google para guardar na nuvem.' : 'Seus cálculos salvos neste navegador.'}
        </p>
        {cloudMsg && <p className="errors" role="alert">{cloudMsg}</p>}
        <Dashboard jobs={saved.map(summarize)} onOpen={onOpen} onDelete={onDelete} />
      </main>
    )
  }
  return <Home />
}

type Account = { user: string | null; signIn: () => void; signOut: () => void } | null

function Nav({ route, account }: { route: string; account?: Account }) {
  const cur = (r: string) => (route === r ? 'page' : undefined)
  return (
    <nav className="nav">
      <a className="brand" href="#/">MakerCusto</a>
      <a href="#/calculadora" aria-current={cur('calculadora')}>Calculadora</a>
      <a href="#/painel" aria-current={cur('painel')}>Painel</a>
      {account && (account.user
        ? <span className="acct"><span title={account.user}>{account.user}</span><button type="button" onClick={account.signOut}>Sair</button></span>
        : <button type="button" className="acct" onClick={account.signIn}>Entrar com Google</button>)}
    </nav>
  )
}

function Home() {
  return (
    <main className="wrap home">
      <h1>MakerCusto</h1>
      <p className="lead">Descubra quanto custa cada peça impressa e qual preço cobrar.</p>
      <div className="choices">
        <a className="choice main" href="#/calculadora">
          <strong>Calculadora</strong>
          <span>Custo por peça, preço sugerido e lucro.</span>
        </a>
        <a className="choice" href="#/painel">
          <strong>Painel</strong>
          <span>Seus cálculos salvos, margens e lucro por hora.</span>
        </a>
      </div>
    </main>
  )
}

// Valores de exemplo: troque pelos seus. Consumo, tarifa e vida útil são hipóteses.
const initial = {
  grams: '50', pricePerKg: '100', hours: '3', watts: '150', tariff: '1,03',
  printerPrice: '3500', lifetimeHours: '3000', laborMinutes: '10', laborRate: '20',
  failurePct: '10', quantity: '1', marginPct: '50', soldPrice: '',
}
type Form = typeof initial
type Field = { key: keyof Form; label: string; unit: string; hint?: string }

const groups: { title: string; fields: Field[] }[] = [
  { title: 'Material', fields: [
    { key: 'grams', label: 'Peso total do lote', unit: 'g' },
    { key: 'pricePerKg', label: 'Preço do filamento', unit: 'R$/kg' } ] },
  { title: 'Impressão', fields: [
    { key: 'hours', label: 'Tempo de impressão do lote', unit: 'h', hint: 'Use o tempo do fatiador.' },
    { key: 'watts', label: 'Consumo médio da impressora', unit: 'W', hint: 'Estimativa. Meça com um wattímetro se puder.' },
    { key: 'tariff', label: 'Tarifa de energia', unit: 'R$/kWh', hint: 'Está na sua conta de luz.' } ] },
  { title: 'Impressora', fields: [
    { key: 'printerPrice', label: 'Preço da impressora', unit: 'R$' },
    { key: 'lifetimeHours', label: 'Vida útil estimada', unit: 'h', hint: 'Quantas horas você espera imprimir com ela.' } ] },
  { title: 'Seu tempo e riscos', fields: [
    { key: 'laborMinutes', label: 'Trabalho manual no lote', unit: 'min', hint: 'Preparar, tirar da mesa, acabamento.' },
    { key: 'laborRate', label: 'Valor da sua hora', unit: 'R$/h' },
    { key: 'failurePct', label: 'Impressões que falham', unit: '%', hint: 'Entre 5 e 15% é comum. Ajuste com a sua experiência.' } ] },
  { title: 'Venda', fields: [
    { key: 'quantity', label: 'Peças no lote', unit: 'un' },
    { key: 'marginPct', label: 'Margem desejada', unit: '%', hint: 'Margem = lucro ÷ preço. Não é o mesmo que markup.' },
    { key: 'soldPrice', label: 'Preço que você cobra (opcional)', unit: 'R$/peça', hint: 'Preencha para ver o lucro real.' } ] },
]

function toInput(f: Form): CostInput {
  const sold = num(f.soldPrice)
  return {
    grams: num(f.grams), pricePerKg: num(f.pricePerKg), hours: num(f.hours), watts: num(f.watts),
    tariff: num(f.tariff), printerPrice: num(f.printerPrice), lifetimeHours: num(f.lifetimeHours),
    laborMinutes: num(f.laborMinutes), laborRate: num(f.laborRate), failurePct: num(f.failurePct),
    quantity: num(f.quantity), marginPct: num(f.marginPct), soldPrice: f.soldPrice.trim() === '' ? undefined : sold,
  }
}

const flat = groups.flatMap((g) => g.fields)
const byKey = (k: string) => flat.find((f) => f.key === k)!
const isEssential = (k: string) => (ESSENTIAL as readonly string[]).includes(k)

function Calculator({ form, setForm, onSave, mode, setMode, account }: {
  form: Form; setForm: (f: Form) => void; onSave: (name: string, i: CostInput) => Promise<void>; mode: Mode; setMode: (m: Mode) => void; account: Account
}) {
  const input = inputForMode(toInput(form), mode)
  const errors = validate(input)
  const result = errors.length ? null : calculateCost(input)
  const basic = mode === 'basico'
  const field = (f: Field) => (
    <label key={f.key}>
      <span>{f.label}</span>
      <span className="input">
        <input inputMode="decimal" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
        <em>{f.unit}</em>
      </span>
      {f.hint && <small>{f.hint}</small>}
    </label>
  )
  const adjust = groups
    .map((g) => ({ ...g, fields: g.fields.filter((f) => !isEssential(f.key) && f.key !== 'soldPrice') }))
    .filter((g) => g.fields.length)

  return (
    <main className="wrap">
      <Nav route="calculadora" account={account} />
      <header className="top">
        <h1>Calculadora</h1>
        <div className="modes" role="group" aria-label="Modo da calculadora">
          <button type="button" aria-pressed={basic} onClick={() => setMode('basico')}>Básico</button>
          <button type="button" aria-pressed={!basic} onClick={() => setMode('avancado')}>Avançado</button>
        </div>
      </header>
      <p className="lead">
        {basic ? 'O essencial para chegar a um preço.' : 'Todos os custos, o preço que você cobra e o lucro real.'} Os valores são exemplos. Troque pelos seus.
      </p>
      <div className="layout">
        <div className="result" aria-live="polite">
          {result ? <Hero r={result} margin={input.marginPct} /> : (
            <div className="hero errors"><strong>Corrija para ver o resultado:</strong>
              <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
          )}
          {result && <Details r={result} basic={basic} onSave={(n) => onSave(n, input)} />}
        </div>
        <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
          {basic ? (
            <>
              <fieldset><legend>Seu lote</legend>{ESSENTIAL.map((k) => field(byKey(k)))}</fieldset>
              <details className="adj">
                <summary>Ajustes da oficina</summary>
                <p className="note">Energia, impressora, seu tempo e falhas. Já vêm preenchidos com exemplos. Confira com os seus dados.</p>
                {adjust.map((g) => <fieldset key={g.title}><legend>{g.title}</legend>{g.fields.map(field)}</fieldset>)}
              </details>
            </>
          ) : groups.map((g) => <fieldset key={g.title}><legend>{g.title}</legend>{g.fields.map(field)}</fieldset>)}
        </form>
      </div>
    </main>
  )
}

function Hero({ r, margin }: { r: CostResult; margin: number }) {
  return (
    <div className="hero">
      <div><small>Custo por peça</small><strong>{money(r.unit)}</strong></div>
      <div className="sug"><small>Preço sugerido ({pct(margin / 100)} de margem)</small><strong>{money(r.suggestedPrice)}</strong></div>
    </div>
  )
}

function Details({ r, basic, onSave }: { r: CostResult; basic: boolean; onSave: (name: string) => Promise<void> }) {
  return (
    <div className="details">
      {!basic && (
        <>
          <h2>Para onde vai o custo</h2>
          <Composition r={r} />
          <div className="price">
            {r.priceIsSuggested ? <p className="note">Informe o preço que você cobra para ver o lucro real.</p> : (
              <div><small>Com o preço que você cobra ({money(r.price)})</small>
                <strong className={r.profitPerUnit < 0 ? 'loss' : ''}>Lucro {money(r.profitPerUnit)} por peça</strong>
                <span>Margem {pct(r.margin)} · Markup {pct(r.markup)} · {money(r.profitPerHour)} por hora de máquina</span>
                {r.profitPerUnit < 0 && <span className="loss">Esse preço está abaixo do custo.</span>}
              </div>
            )}
          </div>
        </>
      )}
      <p className="note">Margem é lucro ÷ preço. Markup é lucro ÷ custo. Falhas entram como custo ÷ (1 − taxa): as peças boas pagam as que falharam.</p>
      <SaveBox onSave={onSave} />
    </div>
  )
}

function SaveBox({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const save = async () => {
    try { await onSave(name); setMsg('Salvo.'); setName('') } catch (e) { setMsg((e as Error).message) }
  }
  return (
    <div className="save">
      <label><span>Nome do trabalho</span>
        <span className="input"><input value={name} maxLength={60} placeholder="Ex.: chaveiro azul" onChange={(e) => setName(e.target.value)} /></span></label>
      <button type="button" onClick={save}>Salvar cálculo</button>
      {msg && <p role="status">{msg} {msg === 'Salvo.' && <a href="#/painel">Ver no painel</a>}</p>}
    </div>
  )
}
