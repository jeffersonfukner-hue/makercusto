// Padrão de escrita: todo nome (filamento, cor, marca, fornecedor, item...) fica em "Título".
// Descrições e observações não passam por aqui.
const CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'com', 'em', 'no', 'na', 'nos', 'nas', 'para', 'ou'])
// Siglas de material e de uso comum no hobby: sempre em maiúsculas.
const ACRONYMS = new Set(['pla', 'petg', 'abs', 'asa', 'tpu', 'pva', 'hips', 'pa', 'pc', 'cf', 'gf', 'led', 'usb', 'uv', 'rgb'])

// Sem acento e sem diferença de maiúscula: serve para comparar e buscar.
export const foldText = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const upperFirstLetter = (w: string) => {
  const lower = w.toLowerCase()
  const i = lower.search(/\p{L}/u)
  return i < 0 ? w : lower.slice(0, i) + lower[i].toLocaleUpperCase('pt-BR') + lower.slice(i + 1)
}

function cap(w: string, first: boolean): string {
  if (!w) return w
  const core = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  if (ACRONYMS.has(core)) return w.toUpperCase()
  if (!first && CONNECTORS.has(core)) return w.toLowerCase()
  const hasLower = w !== w.toUpperCase()
  const hasUpper = w !== w.toLowerCase()
  // Maiúscula no meio da palavra (eSun, GTMax3D): foi escrito assim de propósito.
  if (hasLower && hasUpper && w.slice(1) !== w.slice(1).toLowerCase()) return w
  // Tudo em maiúsculas: até 2 letras é sigla ou modelo (SE, V3); acima disso é só caps lock.
  if (!hasLower && w.replace(/[^\p{L}]/gu, '').length <= 2) return w
  return upperFirstLetter(w)
}

// "preto fosco", "PRETO FOSCO" e "Preto fosco" viram "Preto Fosco". "de", "da", "e"... ficam em minúscula.
export function titleCase(s: string): string {
  return s.trim().split(/\s+/).filter(Boolean)
    .map((w, i) => w.split(/([-/])/).map((p, j) => (/^[-/]$/.test(p) ? p : cap(p, i === 0 && j === 0))).join(''))
    .join(' ')
}
