import type { Composicao } from './domain/trabalhos'
import { money, pct } from './format'

export const parts: { key: keyof Composicao; label: string; color: string }[] = [
  { key: 'material', label: 'Material', color: '#0f766e' },
  { key: 'waste', label: 'Purga e torre', color: '#5fa8a0' },
  { key: 'energy', label: 'Energia', color: '#d98e04' },
  { key: 'machine', label: 'Máquina', color: '#3b5b92' },
  { key: 'labor', label: 'Seu tempo', color: '#8a4f7d' },
  { key: 'failure', label: 'Falhas', color: '#b4442f' },
  { key: 'bought', label: 'Itens comprados', color: '#6b7280' },
]

// Mostra só as fatias que existem no trabalho (a Calculadora não tem purga nem itens comprados).
export function Composition({ r, totalLabel = 'Total' }: { r: { parts: Composicao; total: number }; totalLabel?: string }) {
  const vis = parts.filter((p) => (r.parts[p.key] ?? 0) > 0)
  return (
    <>
      <div className="bar" role="img" aria-label="Composição do custo">
        {vis.map((p) => <i key={p.key} style={{ width: `${((r.parts[p.key] ?? 0) / r.total) * 100}%`, background: p.color }} />)}
      </div>
      <ul className="legend">
        {vis.map((p) => (
          <li key={p.key}>
            <b style={{ background: p.color }} />{p.label}
            <span>{money(r.parts[p.key] ?? 0)} <small>{pct((r.parts[p.key] ?? 0) / r.total)}</small></span>
          </li>
        ))}
        <li className="sum">{totalLabel}<span>{money(r.total)}</span></li>
      </ul>
    </>
  )
}
