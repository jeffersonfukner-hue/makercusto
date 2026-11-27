// Listas de sugestão para o cadastro rápido. São só nomes, sem ranking: a pessoa adiciona as que faltarem.
import { foldText, titleCase } from './texto'

// Marcas que aparecem no varejo brasileiro de filamento (nacionais e importadas). Ordem alfabética.
export const BRANDS = [
  '3D Lab', 'Anycubic', 'Bambu Lab', 'Cliever', 'Creality', 'Creatorally', 'Elegoo', 'eSun', 'GTMax3D', 'Hatchbox', 'Masterprint',
  'National 3D', 'Overture', 'Polymaker', 'Printalot', 'Prusament', 'Sethi3D', 'Sunlu', 'Voolt3D',
]

const BASE = [
  'Preto', 'Branco', 'Cinza', 'Cinza Claro', 'Cinza Escuro', 'Prata', 'Dourado', 'Vermelho', 'Vermelho Escuro', 'Laranja', 'Amarelo',
  'Verde', 'Verde Claro', 'Verde Escuro', 'Verde Limão', 'Verde Militar', 'Azul', 'Azul Claro', 'Azul Escuro', 'Azul Marinho', 'Azul Bebê',
  'Azul Turquesa', 'Roxo', 'Lilás', 'Rosa', 'Rosa Pink', 'Magenta', 'Ciano', 'Marrom', 'Bege', 'Creme', 'Vinho', 'Salmão', 'Cobre', 'Bronze',
]
const FINISHES = ['Fosco', 'Silk', 'Metálico', 'Glitter', 'Translúcido']
const OTHERS = [
  'Natural', 'Transparente', 'Madeira', 'Mármore', 'Granito', 'Pedra', 'Arco-Íris', 'Brilha no Escuro', 'Muda de Cor com Calor', 'Muda de Cor com UV',
]
const DUAL_PAIRS: [string, string][] = [
  ['Preto', 'Vermelho'], ['Preto', 'Dourado'], ['Preto', 'Azul'], ['Preto', 'Branco'], ['Dourado', 'Prata'], ['Dourado', 'Vermelho'],
  ['Azul', 'Roxo'], ['Azul', 'Verde'], ['Azul', 'Dourado'], ['Azul', 'Prata'], ['Verde', 'Roxo'], ['Verde', 'Dourado'], ['Rosa', 'Azul'],
  ['Rosa', 'Roxo'], ['Rosa', 'Dourado'], ['Vermelho', 'Azul'], ['Vermelho', 'Prata'], ['Laranja', 'Amarelo'], ['Laranja', 'Vermelho'],
]

// Cor simples, com acabamento, especiais e dual color (duas cores no mesmo filamento, em versão comum e silk).
export const COLORS: string[] = [...new Set([
  ...BASE,
  ...BASE.flatMap((c) => FINISHES.map((f) => `${c} ${f}`)),
  ...OTHERS,
  ...DUAL_PAIRS.flatMap(([a, b]) => [`${a} e ${b} Dual Color`, `${a} e ${b} Silk Dual Color`]),
])]

// Busca por qualquer parte do texto, sem acento e sem diferença de maiúscula. Quem começa igual vem primeiro.
export function searchOptions(options: string[], query: string, limit = 8): string[] {
  const q = foldText(query).trim()
  if (!q) return options.slice(0, limit)
  const tokens = q.split(/\s+/)
  const hits: [number, string][] = []
  options.forEach((o, i) => {
    const f = foldText(o)
    if (!tokens.every((t) => f.includes(t))) return
    const rank = f === q ? 0 : f.startsWith(q) ? 1 : f.split(/\s+/).some((w) => w.startsWith(tokens[0])) ? 2 : 3
    hits.push([rank * 100000 + i, o])
  })
  return hits.sort((a, b) => a[0] - b[0]).slice(0, limit).map((h) => h[1])
}

// Se o texto é uma opção da lista (ignorando acento e maiúscula), devolve a escrita da lista. Senão, aplica o padrão de escrita.
export function canonical(options: string[], text: string): string {
  const f = foldText(text).trim()
  if (!f) return ''
  return options.find((o) => foldText(o) === f) ?? titleCase(text)
}

// Junta sugestões e cadastros próprios, sem repetir, em ordem alfabética.
export function mergeOptions(base: string[], own: string[]): string[] {
  const seen = new Map<string, string>()
  for (const o of [...base, ...own]) if (!seen.has(foldText(o))) seen.set(foldText(o), o) // a escrita da lista de sugestões vale
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
