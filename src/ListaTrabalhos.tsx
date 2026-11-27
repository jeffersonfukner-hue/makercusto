import { BotaoExcluir } from './Janela'
import { groupVersions } from './domain/versions'
import type { Linha } from './domain/trabalhos'
import { money } from './format'

// Lista única de trabalhos salvos (Produtos e Painel). Mesmo nome = um item, com o histórico de versões embaixo.
const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const hora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const ORIGEM = { calculo: 'Calculadora', produto: 'Com partes' } as const

export function ListaTrabalhos({ linhas, onOpen, onDelete, selId, onSelect }: {
  linhas: Linha[]; onOpen: (l: Linha) => void; onDelete: (ls: Linha[]) => void
  selId?: string; onSelect?: (l: Linha) => void // no Painel, clicar escolhe o trabalho do gráfico
}) {
  return (
    <ul className="jobs">
      {groupVersions(linhas).map((g) => {
        const j = g.latest
        const info = <><strong>{j.name}{j.kind === 'parte' && <> <span className="tag parte">parte</span></>}</strong>
          <span>{dia(j.savedAt)} · {money(j.unit)}{j.pieces > 1 ? ' por peça' : ''}{g.history.length > 1 ? ` · ${g.history.length} versões` : ''}</span></>
        return (
          <li key={g.key} className={`grp${selId === j.id ? ' on' : ''}`}>
            {onSelect
              ? <button type="button" className="pick" onClick={() => onSelect(j)} aria-pressed={selId === j.id}>{info}</button>
              : <span className="pick">{info}</span>}
            <span className="acts">
              <button type="button" onClick={() => onOpen(j)}>Abrir</button>
              <BotaoExcluir nome={j.name} versoes={g.history.length} onConfirm={() => onDelete(g.history)} />
            </span>
            {g.history.length > 1 && (
              <details className="hist"><summary>Histórico ({g.history.length})</summary>
                <ul>{g.history.map((v, k) => (
                  <li key={v.id}><span>{hora(v.savedAt)} · {money(v.unit)} · {ORIGEM[v.origem]}{k === 0 ? ' (atual)' : ''}</span>
                    <span className="acts"><button type="button" onClick={() => onOpen(v)}>Abrir</button>
                      <BotaoExcluir nome="esta versão" onConfirm={() => onDelete([v])} /></span></li>
                ))}</ul>
              </details>
            )}
          </li>
        )
      })}
    </ul>
  )
}
