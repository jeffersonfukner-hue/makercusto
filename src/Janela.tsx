import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

// Janela única do app (cadastro rápido, o que falta, confirmações). Foco preso dentro, Esc fecha, clique fora fecha.
const FOCAVEIS = 'input, select, textarea, button, [href]'

export function Modal({ titulo, onClose, children, className = '', foco }: {
  titulo: string; onClose: () => void; children: ReactNode; className?: string
  foco?: string // seletor do primeiro foco (padrão: primeiro campo, senão primeiro botão)
}) {
  const box = useRef<HTMLDivElement>(null)
  const tid = useId()
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = box.current?.querySelector<HTMLElement>(foco ?? 'input, select, textarea') ?? box.current?.querySelector<HTMLElement>('button')
    el?.focus(); (el as HTMLInputElement | null)?.select?.()
    return () => prev?.focus?.()
  }, [foco])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); return }
    if (e.key !== 'Tab' || !box.current) return
    const els = [...box.current.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((x) => !(x as HTMLButtonElement).disabled)
    if (!els.length) return
    const first = els[0]; const last = els[els.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return (
    <div className="modalback" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={tid} ref={box} onKeyDown={onKey}>
        <h2 id={tid}>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

// Botão que pede confirmação na mesma janela do app, no lugar do confirm() do navegador.
export function BotaoConfirmar({ label, titulo, texto, acao = label, perigoso = true, onConfirm }: {
  label: string; titulo: string; texto?: string; acao?: string; perigoso?: boolean; onConfirm: () => void
}) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setAberto(true)}>{label}</button>
      {aberto && (
        <Modal titulo={titulo} onClose={() => setAberto(false)} foco="button.go">
          {texto && <p>{texto}</p>}
          <div className="rowacts modalacts">
            <button type="button" onClick={() => setAberto(false)}>Cancelar</button>
            <button type="button" className={`go ${perigoso ? 'danger' : 'primary'}`} onClick={() => { setAberto(false); onConfirm() }}>{acao}</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Excluir padrão: mesmo texto e mesmo visual em todas as telas.
export function BotaoExcluir({ nome, versoes = 1, onConfirm }: { nome: string; versoes?: number; onConfirm: () => void }) {
  return (
    <BotaoConfirmar label="Excluir" titulo={`Excluir "${nome}"?`} acao="Excluir" onConfirm={onConfirm}
      texto={versoes > 1 ? `Isso apaga também as ${versoes} versões do histórico. Não dá para desfazer.` : 'Não dá para desfazer.'} />
  )
}
