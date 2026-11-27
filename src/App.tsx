import { useEffect, useState } from 'react'
import { calculateCost, validate, type CostInput, type CostResult } from './domain/cost'

const OLD_URL = 'https://makercusto-preview.pages.dev/'
const money = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (x: number) => (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))

function useRoute() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return hash === '#/calculadora' ? 'calculadora' : 'inicio'
}

export default function App() {
  return useRoute() === 'calculadora' ? <Calculator /> : <Home />
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

const parts: { key: keyof CostResult['parts']; label: string; color: string }[] = [
  { key: 'material', label: 'Material', color: '#0f766e' },
  { key: 'energy', label: 'Energia', color: '#d98e04' },
  { key: 'machine', label: 'Máquina', color: '#3b5b92' },
  { key: 'labor', label: 'Seu tempo', color: '#8a4f7d' },
  { key: 'failure', label: 'Falhas', color: '#b4442f' },
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

function Calculator() {
  const [form, setForm] = useState<Form>(initial)
  const input = toInput(form)
  const errors = validate(input)
  const result = errors.length ? null : calculateCost(input)

  return (
    <main className="wrap">
      <a className="back" href="#/">Início</a>
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
          {result ? <Result r={result} margin={input.marginPct} /> : (
            <div className="errors"><strong>Corrija para ver o resultado:</strong>
              <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
          )}
        </section>
      </div>
    </main>
  )
}

function Result({ r, margin }: { r: CostResult; margin: number }) {
  return (
    <>
      <h2>Custo por peça</h2>
      <p className="big">{money(r.unit)}</p>
      <div className="bar" role="img" aria-label="Composição do custo">
        {parts.map((p) => r.parts[p.key] > 0 && (
          <i key={p.key} style={{ width: `${(r.parts[p.key] / r.total) * 100}%`, background: p.color }} />
        ))}
      </div>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.key}>
            <b style={{ background: p.color }} />{p.label}
            <span>{money(r.parts[p.key])} <small>{pct(r.parts[p.key] / r.total)}</small></span>
          </li>
        ))}
        <li className="sum">Total do lote<span>{money(r.total)}</span></li>
      </ul>
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
