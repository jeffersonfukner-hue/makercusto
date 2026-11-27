import { useEffect, useMemo, useState } from 'react'
import { Modal } from './Janela'

// Lista de campos do formulário, lida da tela: serve para "o que falta" e para a busca de campo (como no fatiador).
export interface FieldItem { tab: string; label: string; ctx: string; missing: boolean; el: HTMLElement }

export const TAB_LABEL: Record<string, string> = { calculadora: 'Calculadora', partes: 'Partes', filamentos: 'Filamentos', impressora: 'Impressora', itens: 'Itens', venda: 'Venda', produtos: 'Meus produtos' }

export function collectFields(): FieldItem[] {
  const out: FieldItem[] = []
  document.querySelectorAll<HTMLElement>('[data-tab]').forEach((panel) => {
    const tab = panel.dataset.tab!
    panel.querySelectorAll<HTMLElement>('.field, fieldset.time').forEach((f) => {
      const isTime = f.matches('fieldset.time')
      const label = isTime ? 'Tempo da impressão' : f.querySelector('label')?.textContent?.trim() ?? ''
      const el = isTime ? (f.querySelector('.input.missing input') ?? f.querySelector('input')) as HTMLElement | null : f.querySelector<HTMLElement>('input, select')
      if (!label || !el) return
      const sec = f.closest('section')
      const ctx = f.closest('.line')?.querySelector('h3')?.textContent?.trim() || sec?.querySelector('h2')?.textContent?.replace(/\s*Ajuda:.*$/, '').trim() || ''
      out.push({ tab, label, ctx, missing: !!f.querySelector('.input.missing'), el })
    })
  })
  return out
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function Pendencias({ startSearch, onClose, onGo, fill }: {
  startSearch?: boolean; onClose: () => void; onGo: (it: FieldItem) => void
  // Preencher o preço do filamento de todas as cores que faltam de uma vez.
  fill: { count: number; filaments: { id: string; label: string; price: string }[]; apply: (price: string, filId: string) => void }
}) {
  const items = useMemo(collectFields, [])
  const [q, setQ] = useState('')
  const [price, setPrice] = useState('')
  const [fil, setFil] = useState('')
  const missing = items.filter((i) => i.missing)
  const list = q.trim() ? items.filter((i) => norm(`${i.label} ${i.ctx} ${TAB_LABEL[i.tab]}`).includes(norm(q))) : startSearch ? items : missing
  const pickFil = (id: string) => { setFil(id); const f = fill.filaments.find((x) => x.id === id); if (f) setPrice(f.price) }
  return (
    <Modal titulo={q.trim() || startSearch ? 'Buscar campo' : missing.length ? `Faltam ${missing.length} ${missing.length === 1 ? 'item' : 'itens'}` : 'Nada faltando'} onClose={onClose} className="pend" foco={startSearch ? 'input[type=search]' : 'button.go'}>
        <input type="search" className="pendsearch" placeholder="Buscar campo: preço, impressora, margem..." value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && list[0]) onGo(list[0]) }} aria-label="Buscar campo" />
        {!q.trim() && !startSearch && fill.count > 1 && (
          <div className="fillall">
            <strong>Mesmo preço para as {fill.count} cores que faltam</strong>
            <p className="note">Útil quando você usa o mesmo rolo em todas as peças. Depois dá para ajustar cor por cor na aba Filamentos.</p>
            <div className="pair">
              <label className="fl">Filamento cadastrado
                <select value={fil} onChange={(e) => pickFil(e.target.value)}>
                  <option value="">Digitar o preço</option>
                  {fill.filaments.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select></label>
              <label className="fl">Preço do filamento
                <span className="input"><input inputMode="decimal" value={price} onChange={(e) => { setPrice(e.target.value); setFil('') }} /><em>R$/kg</em></span></label>
            </div>
            <button type="button" className="primary" disabled={!price.trim()} onClick={() => fill.apply(price, fil)}>Aplicar às {fill.count} cores</button>
          </div>
        )}
        {!q.trim() && missing.length > 0 && fill.count > 1 && <p className="note">Ou escolha um por um:</p>}
        <ul className="pendlist">
          {list.map((i, k) => (
            <li key={k}><button type="button" className={k === 0 && !q.trim() ? 'go' : ''} onClick={() => onGo(i)}>
              <span><strong>{i.label}</strong>{i.ctx && <small> · {i.ctx}</small>}</span><em>{TAB_LABEL[i.tab]}</em></button></li>
          ))}
          {!list.length && <li className="note">{q.trim() ? 'Nenhum campo com esse nome.' : 'Todos os campos obrigatórios estão preenchidos.'}</li>}
        </ul>
        <div className="rowacts modalacts"><button type="button" onClick={onClose}>Fechar</button></div>
    </Modal>
  )
}

// Leva a pessoa a um campo: abre a aba (se houver), rola, pisca e seleciona para digitar. Usado por todas as telas.
export function irParaCampo(el: HTMLElement, abrirAba: (t: string) => void = () => {}) {
  const t = el.closest<HTMLElement>('[data-tab]')?.dataset.tab
  if (t) abrirAba(t)
  el.closest('details')?.setAttribute('open', '') // campo dentro de bloco recolhido
  window.setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const box = el.closest<HTMLElement>('.input') ?? el
    box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash')
    window.setTimeout(() => box.classList.remove('flash'), 1800)
    window.setTimeout(() => { el.focus({ preventScroll: true }); (el as HTMLInputElement).select?.() }, 250)
  }, 60)
}

// Ctrl/Cmd+K abre a busca de campo.
export function useAtalhoBusca(abrir: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); abrir() } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [abrir])
}
