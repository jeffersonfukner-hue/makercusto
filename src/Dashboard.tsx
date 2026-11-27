import { Children, cloneElement, useState, type ReactElement, type ReactNode } from 'react'
import { Composition } from './Composition'
import type { JobSummary } from './domain/saved'
import { money, pct } from './format'

const date = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
// No celular cada linha vira um cartão: o data-label de cada célula vem do cabeçalho.
const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="scroll stack"><table><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>
    {Children.map(children, (tr) => {
      const row = tr as ReactElement<{ children: ReactNode }>
      return cloneElement(row, {}, Children.map(row.props.children, (td, i) => cloneElement(td as ReactElement<object>, { 'data-label': head[i] } as object)))
    })}
  </tbody></table></div>
)

export function Dashboard({ jobs, onOpen, onDelete }: { jobs: JobSummary[]; onOpen: (id: string) => void; onDelete: (id: string) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  if (!jobs.length) return (
    <section className="card">
      <p><strong>Nenhum cálculo salvo ainda.</strong></p>
      <p>Faça um cálculo e clique em Salvar cálculo. Ele aparece aqui. Os dados ficam só neste navegador.</p>
      <a href="#/calculadora">Ir para a calculadora</a>
    </section>
  )
  const cur = jobs.find((j) => j.id === sel) ?? jobs[0]
  const byHour = [...jobs].sort((a, b) => b.result.profitPerHour - a.result.profitPerHour)
  return (
    <div className="dash">
      <section className="card">
        <h2>Últimos cálculos</h2>
        <ul className="jobs">
          {jobs.map((j) => (
            <li key={j.id} className={j.id === cur.id ? 'on' : ''}>
              <button className="pick" onClick={() => setSel(j.id)} aria-pressed={j.id === cur.id}>
                <strong>{j.name}</strong><span>{date(j.savedAt)} · {money(j.result.unit)} por peça</span>
              </button>
              <span className="acts">
                <button onClick={() => onOpen(j.id)}>Abrir</button>
                <button onClick={() => { if (confirm(`Excluir "${j.name}"?`)) onDelete(j.id) }}>Excluir</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2>Custo por peça: {cur.name}</h2>
        <p className="big">{money(cur.result.unit)}</p>
        <Composition r={cur.result} />
      </section>
      <section className="card wide">
        <h2>Margem bruta por trabalho</h2>
        <Table head={['Trabalho', 'Receita', 'Custo do lote', 'Margem bruta', '%']}>
          {jobs.map((j) => (
            <tr key={j.id}><td>{j.name}</td><td>{money(j.revenue)}</td><td>{money(j.result.total)}</td>
              <td className={j.gross < 0 ? 'loss' : ''}>{money(j.gross)}</td><td>{pct(j.grossPct)}</td></tr>
          ))}
        </Table>
        <p className="note">Receita menos todos os custos do lote. Sem preço praticado, usa o preço sugerido.</p>
      </section>
      <section className="card wide">
        <h2>Preço praticado e preço sugerido</h2>
        <Table head={['Trabalho', 'Sugerido', 'Praticado', 'Diferença', 'Lucro por peça']}>
          {jobs.map((j) => (
            <tr key={j.id}><td>{j.name}</td><td>{money(j.result.suggestedPrice)}</td>
              <td>{j.result.priceIsSuggested ? 'não informado' : money(j.result.price)}</td>
              <td>{j.result.priceIsSuggested ? '-' : money(j.result.price - j.result.suggestedPrice)}</td>
              <td className={j.result.profitPerUnit < 0 ? 'loss' : ''}>{money(j.result.profitPerUnit)}</td></tr>
          ))}
        </Table>
      </section>
      <section className="card wide">
        <h2>Lucro por hora de máquina</h2>
        <Table head={['Trabalho', 'Lucro por hora', 'Horas do lote']}>
          {byHour.map((j) => (
            <tr key={j.id}><td>{j.name}</td><td className={j.result.profitPerHour < 0 ? 'loss' : ''}>{money(j.result.profitPerHour)}</td>
              <td>{j.input.hours.toLocaleString('pt-BR')} h</td></tr>
          ))}
        </Table>
        <p className="note">Lucro do lote ÷ horas de impressão. Mostra quais trabalhos rendem mais pelo tempo de máquina.</p>
      </section>
    </div>
  )
}
