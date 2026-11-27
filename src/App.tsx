import { useEffect, useState } from 'react'
import { Composition } from './Composition'
import { Dashboard } from './Dashboard'
import { calculateCost, validate, type CostInput, type CostResult } from './domain/cost'
import { addSaved, summarize, type SavedCalc } from './domain/saved'
import { money, pct } from './format'
import { readSaved, writeSaved } from './storage'

const OLD_URL = 'https://makercusto-preview.pages.dev/'
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
  const update = (next: SavedCalc[]) => { setSaved(next); writeSaved(next) }
  if (route === 'calculadora') {
    const onSave = (name: string, input: CostInput) =>
      update(addSaved(saved, name, input, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, new Date().toISOString()))
    return <Calculator form={form} setForm={setForm} onSave={onSave} />
  }
  if (route === 'painel') {
    const onOpen = (id: string) => {
      const s = saved.find((x) => x.id === id)
      if (s) { setForm(toForm(s.input)); location.hash = '#/calculadora' }
    }
    return (
      <main className="wrap">
        <a className="back" href="#/">Início</a>
        <h1>Painel</h1>
        <p className="lead">Seus cálculos salvos neste navegador.</p>
        <Dashboard jobs={saved.map(summarize)} onOpen={onOpen} onDelete={(id) => update(saved.filter((x) => x.id !== id))} />
      </main>
    )
  }
  return <Home />
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
        <a className="choice" href={OLD_URL} target="_blank" rel="noopener noreferrer">
          <strong>Versão anterior</strong>
          <span>Abre o MakerCusto antigo em outra aba.</span>
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

function Calculator({ form, setForm, onSave }: { form: Form; setForm: (f: Form) => void; onSave: (name: string, i: CostInput) => void }) {
  const input = toInput(form)
  const errors = validate(input)
  const result = errors.length ? null : calculateCost(input)

  return (
    <main className="wrap">
      <a className="back" href="#/">Início</a> · <a className="back" href="#/painel">Painel</a>
      <h1>Calculadora</h1>
      <p className="lead">Os valores abaixo são exemplos. Troque pelos seus.</p>
      <div className="layout">
        <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
          {groups.map((g) => (
            <fieldset key={g.title}>
              <legend>{g.title}</legend>
              {g.fields.map((f) => (
                <label key={f.key}>
                  <span>{f.label}</span>
                  <span className="input">
                    <input inputMode="decimal" value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    <em>{f.unit}</em>
                  </span>
                  {f.hint && <small>{f.hint}</small>}
                </label>
              ))}
            </fieldset>
          ))}
        </form>
        <section className="result" aria-live="polite">
          {result ? <><Result r={result} margin={input.marginPct} /><SaveBox onSave={(n) => onSave(n, input)} /></> : (
            <div className="errors"><strong>Corrija para ver o resultado:</strong>
              <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
          )}
        </section>
      </div>
    </main>
  )
}

function SaveBox({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const save = () => {
    try { onSave(name); setMsg('Salvo.'); setName('') } catch (e) { setMsg((e as Error).message) }
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

function Result({ r, margin }: { r: CostResult; margin: number }) {
  return (
    <>
      <h2>Custo por peça</h2>
      <p className="big">{money(r.unit)}</p>
      <Composition r={r} />
      <div className="price">
        <div><small>Preço sugerido (margem {pct(margin / 100)})</small><strong>{money(r.suggestedPrice)}</strong></div>
        {!r.priceIsSuggested && (
          <div><small>Com o preço que você cobra ({money(r.price)})</small>
            <strong className={r.profitPerUnit < 0 ? 'loss' : ''}>Lucro {money(r.profitPerUnit)} por peça</strong>
            <span>Margem {pct(r.margin)} · Markup {pct(r.markup)} · {money(r.profitPerHour)} por hora de máquina</span>
            {r.profitPerUnit < 0 && <span className="loss">Esse preço está abaixo do custo.</span>}
          </div>
        )}
      </div>
      <p className="note">Margem é lucro ÷ preço. Markup é lucro ÷ custo. Falhas entram como <code>custo ÷ (1 − taxa)</code>: as peças boas pagam as que falharam.</p>
    </>
  )
}
