import { useEffect, useState } from 'react'
import { ICONES, MenuIcone } from './Icones'

// Temas do app. Para criar um novo: 1) incluir aqui, 2) copiar o bloco :root[data-tema="..."] em styles.css e trocar as cores.
// Todas as telas usam as mesmas variáveis de cor, então o tema vale para o app inteiro.
export const TEMAS = [
  { id: 'normal', label: 'Normal' },
  { id: 'neon', label: 'Neon' },
  { id: 'corporativo', label: 'Corporativo' },
] as const
export type TemaId = (typeof TEMAS)[number]['id']
const KEY = 'makercusto.tema'

function lido(): TemaId {
  try { const v = localStorage.getItem(KEY); return TEMAS.some((t) => t.id === v) ? (v as TemaId) : 'normal' } catch { return 'normal' }
}

// Aplica o tema salvo assim que o app abre, antes de qualquer tela.
if (typeof document !== 'undefined') document.documentElement.dataset.tema = lido()

export function useTema(): [TemaId, (t: TemaId) => void] {
  const [tema, setTema] = useState<TemaId>(lido)
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try { localStorage.setItem(KEY, tema) } catch { /* sem armazenamento: vale só nesta visita */ }
  }, [tema])
  return [tema, setTema]
}

export function TemaSeletor() {
  const [tema, setTema] = useTema()
  return (
    <MenuIcone icone={ICONES.paleta} label="Tema visual">
      {(fechar) => TEMAS.map((t) => (
        <button type="button" role="menuitemradio" aria-checked={tema === t.id} key={t.id} onClick={() => { setTema(t.id); fechar() }}>
          <span>{t.label}</span>{tema === t.id && ICONES.check}
        </button>
      ))}
    </MenuIcone>
  )
}
