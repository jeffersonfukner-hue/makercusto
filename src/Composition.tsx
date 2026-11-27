import type { CostResult } from './domain/cost'
import { money, pct } from './format'

export const parts: { key: keyof CostResult['parts']; label: string; color: string }[] = [
  { key: 'material', label: 'Material', color: '#0f766e' },
  { key: 'energy', label: 'Energia', color: '#d98e04' },
  { key: 'machine', label: 'Máquina', color: '#3b5b92' },
  { key: 'labor', label: 'Seu tempo', color: '#8a4f7d' },
  { key: 'failure', label: 'Falhas', color: '#b4442f' },
]

export function Composition({ r }: { r: CostResult }) {
  return (
    <>
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
    </>
  )
}
