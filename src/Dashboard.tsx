import { Children, cloneElement, useState, type ReactElement, type ReactNode } from 'react'
import { Composition } from './Composition'
import type { Linha } from './domain/trabalhos'
import { money, pct } from './format'
import { groupVersions } from './domain/versions'
import { ListaTrabalhos } from './ListaTrabalhos'

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

export function Dashboard({ jobs: all, onOpen, onDelete }: { jobs: Linha[]; onOpen: (j: Linha) => void; onDelete: (js: Linha[]) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  const groups = groupVersions(all)
  const jobs = groups.map((g) => g.latest)
  if (!jobs.length) return (
    <section className="card">
      <p><strong>Nenhum cálculo salvo ainda.</strong></p>
      <p>Faça um cálculo e clique em Salvar cálculo. Ele aparece aqui. Os dados ficam só neste navegador.</p>
      <a href="#/calculadora">Ir para a calculadora</a>
    </section>
  )
  const cur = jobs.find((j) => j.id === sel) ?? jobs[0]
  const byHour = [...jobs].sort((a, b) => b.profitPerHour - a.profitPerHour)
  return (
    <div className="dash">
      <section className="card">
        <h2>Últimos cálculos</h2>
        <ListaTrabalhos linhas={all} onOpen={onOpen} onDelete={onDelete} selId={cur.id} onSelect={(l) => setSel(l.id)} />
      </section>
      <section className="card">
        <h2>Custo por peça: {cur.name}</h2>
        <p className="big">{money(cur.unit)}</p>
        <Composition r={{ parts: cur.comp, total: cur.total }} totalLabel={cur.pieces > 1 ? 'Total do lote' : 'Total'} />
      </section>
      <section className="card wide">
        <h2>Margem bruta por trabalho</h2>
        <Table head={['Trabalho', 'Receita', 'Custo do lote', 'Margem bruta', '%']}>
          {jobs.map((j) => (
            <tr key={j.id}><td>{j.name}</td><td>{money(j.revenue)}</td><td>{money(j.total)}</td>
              <td className={j.gross < 0 ? 'loss' : ''}>{money(j.gross)}</td><td>{pct(j.grossPct)}</td></tr>
          ))}
        </Table>
        <p className="note">Receita menos todos os custos do lote. Sem preço praticado, usa o preço sugerido.</p>
      </section>
      <section className="card wide">
        <h2>Preço praticado e preço sugerido</h2>
        <Table head={['Trabalho', 'Sugerido', 'Praticado', 'Diferença', 'Lucro por peça']}>
          {jobs.map((j) => (
            <tr key={j.id}><td>{j.name}</td><td>{money(j.suggested)}</td>
              <td>{j.priceIsSuggested ? 'não informado' : money(j.price)}</td>
              <td>{j.priceIsSuggested ? '-' : money(j.price - j.suggested)}</td>
              <td className={j.profitPerUnit < 0 ? 'loss' : ''}>{money(j.profitPerUnit)}</td></tr>
          ))}
        </Table>
      </section>
      <section className="card wide">
        <h2>Lucro por hora de máquina</h2>
        <Table head={['Trabalho', 'Lucro por hora', 'Horas do lote']}>
          {byHour.map((j) => (
            <tr key={j.id}><td>{j.name}</td><td className={j.profitPerHour < 0 ? 'loss' : ''}>{money(j.profitPerHour)}</td>
              <td>{j.hours.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h</td></tr>
          ))}
        </Table>
        <p className="note">Lucro do lote ÷ horas de impressão. Mostra quais trabalhos rendem mais pelo tempo de máquina.</p>
      </section>
    </div>
  )
}
