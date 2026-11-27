import { useRef, type ReactNode } from 'react'

// Ícones e menu de ícone do app. Um lugar só: trocar aqui muda tudo que usa.
const P = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
export const ICONES = {
  usuario: <svg {...P}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /></svg>,
  paleta: <svg {...P}><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.2-1-1.5-1-2.7 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></svg>,
  lupa: <svg {...P}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>,
  check: <svg {...P} width={16} height={16}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
} as const
export type IconeId = keyof typeof ICONES

// Botão de ícone discreto, sem contorno.
export function BotaoIcone({ icone, label, onClick }: { icone: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" className="iconbtn" aria-label={label} title={label} onClick={onClick}>{icone}</button>
}

// Ícone que abre um menu pequeno (tema, conta). Fecha ao escolher uma opção.
export function MenuIcone({ icone, label, children }: { icone: ReactNode; label: string; children: (fechar: () => void) => ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const fechar = () => ref.current?.removeAttribute('open')
  return (
    <details className="iconmenu" ref={ref} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) fechar() }}>
      <summary className="iconbtn" aria-label={label} title={label}>{icone}</summary>
      <div className="menu" role="menu">{children(fechar)}</div>
    </details>
  )
}
