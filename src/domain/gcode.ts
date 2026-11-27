// Leitura de gcode fatiado (Anycubic Slicer Next, Orca, Bambu): tempo e gramas por cor.
// Roda no navegador, sem enviar o arquivo a servidor. Função pura, com testes.
import { titleCase } from './texto'

export interface GcodeTool { index: number; hex: string; name: string; modelG: number; purgeG: number; towerG: number }
export interface GcodeResult {
  hours: number // tempo de impressão
  totalG: number // total do fatiador (peça + torre + purga)
  tools: GcodeTool[] // só as cores usadas
  purgeIsEstimate: boolean
  name: string
}

const BASES: [string, [number, number, number]][] = [
  ['Preto', [0, 0, 0]], ['Branco', [255, 255, 255]], ['Cinza', [128, 128, 128]], ['Vermelho', [255, 0, 0]], ['Laranja', [255, 128, 0]],
  ['Amarelo', [255, 220, 0]], ['Verde', [0, 160, 60]], ['Azul', [0, 70, 220]], ['Azul Claro', [100, 190, 255]], ['Roxo', [130, 50, 190]],
  ['Rosa', [255, 120, 180]], ['Marrom', [110, 60, 20]], ['Bege', [225, 200, 160]], ['Dourado', [212, 175, 55]], ['Prata', [192, 192, 192]],
]
export function colorName(hex: string): string {
  const m = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!m) return ''
  const n = parseInt(m[1], 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  let best = BASES[0]; let bd = Infinity
  for (const b of BASES) {
    const d = (b[1][0] - c[0]) ** 2 + (b[1][1] - c[1]) ** 2 + (b[1][2] - c[2]) ** 2
    if (d < bd) { bd = d; best = b }
  }
  return best[0]
}

export function parseDuration(s: string): number {
  const g = (u: string) => Number(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${u}`).exec(s)?.[1] ?? 0)
  return (g('d') * 24 * 3600 + g('h') * 3600 + g('m') * 60 + g('s')) / 3600
}

export const nameFromFile = (file: string): string => {
  const base = file.replace(/\.(gcode|txt)$/i, '').replace(/^[0-9a-f]{8}-\d{4}-\d{4}-/i, '')
  const cut = base.split(/[_ -]*plate/i)[0].replace(/[_]+/g, ' ').trim()
  return titleCase(cut || base)
}

export function parseGcode(text: string, fileName = ''): GcodeResult | null {
  const lines = text.split('\n')
  let usedM = 0; let hours = 0
  let diameter = 1.75; let density = [1.24]
  let colors: string[] = []
  let relative = true
  let tool = 0; let typ = ''; let flush = false; let incoming = -1; let lastE = 0
  const net = new Map<number, { model: number; tower: number }>()
  const macro = new Map<number, number>() // extrusão positiva dos macros de troca, por cor que entra
  const changes = new Map<number, number>()
  let sawE = false
  const bucket = (t: number) => { let b = net.get(t); if (!b) { b = { model: 0, tower: 0 }; net.set(t, b) } return b }

  for (const raw of lines) {
    const l = raw.trimEnd()
    if (!l) continue
    if (l.charCodeAt(0) === 59) { // ';'
      if (l.startsWith(';TYPE:')) { typ = l.slice(6).trim(); continue }
      if (l.startsWith('; FLUSH_START')) { flush = true; continue }
      if (l.startsWith('; FLUSH_END')) { flush = false; continue }
      if (flush && l.startsWith(';;; G1 E')) {
        const v = Number(/;;; G1 E(-?[\d.]+)/.exec(l)?.[1])
        if (v > 0 && incoming >= 0) macro.set(incoming, (macro.get(incoming) ?? 0) + v)
        continue
      }
      let m: RegExpExecArray | null
      if ((m = /^; used_filament\s*=\s*([\d.]+)/.exec(l))) usedM = Number(m[1])
      else if ((m = /^; print_time\s*=\s*(.+)$/.exec(l))) hours = parseDuration(m[1])
      else if (!hours && (m = /^; estimated printing time \(normal mode\)\s*=\s*(.+?)(?:\s*=|$)/.exec(l))) hours = parseDuration(m[1])
      else if ((m = /^; filament_diameter\s*[:=]\s*(.+)$/.exec(l))) diameter = Number(m[1].split(',')[0]) || diameter
      else if ((m = /^; filament_density\s*[:=]\s*(.+)$/.exec(l))) density = m[1].split(',').map((x) => Number(x) || 1.24)
      else if ((m = /^; paint_info\s*=\s*(\[.*\])/.exec(l)) && !colors.length) {
        try {
          for (const [i, p] of (JSON.parse(m[1]) as { paint_color: number[]; paint_index?: number }[]).entries()) {
            colors[p.paint_index ?? i] = '#' + p.paint_color.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()
          }
        } catch { /* ignora */ }
      } else if (!colors.length && (m = /^; filament_colou?r\s*=\s*(.+)$/.exec(l))) colors = m[1].split(';').map((x) => x.trim().toUpperCase())
      continue
    }
    if (l.charCodeAt(0) === 84) { // 'T'
      const m = /^T(\d+)\b/.exec(l)
      if (m) { const t = Number(m[1]); if (t !== tool) changes.set(t, (changes.get(t) ?? 0) + 1); tool = t; incoming = t }
      continue
    }
    if (l.startsWith('M83')) { relative = true; continue }
    if (l.startsWith('M82')) { relative = false; continue }
    if (l.startsWith('G92')) { const m = /\sE(-?[\d.]+)/.exec(l); if (m) lastE = Number(m[1]); continue }
    if (l.startsWith('G1') || l.startsWith('G0')) {
      const m = /\sE(-?[\d.]+)/.exec(l)
      if (!m) continue
      let v = Number(m[1])
      if (!relative) { const d = v - lastE; lastE = v; v = d }
      sawE = true
      const b = bucket(tool)
      if (typ === 'Prime tower') b.tower += v; else b.model += v
    }
  }
  if (!sawE) return null

  const gPerMm = (t: number) => (Math.PI * (diameter / 2) ** 2 / 1000) * (density[t] ?? density[0] ?? 1.24)
  const used = [...net.keys()].sort((a, b) => a - b)
  const activeG = used.reduce((s, t) => s + (net.get(t)!.model + net.get(t)!.tower) * gPerMm(t), 0)
  const totalFromHeader = usedM > 0 ? usedM * 1000 * gPerMm(used[0] ?? 0) : 0
  const gap = Math.max(0, totalFromHeader - activeG)
  const purgeTotal = gap > totalFromHeader * 0.02 ? gap : 0 // abaixo de 2% é arredondamento do cabeçalho

  // Purga por cor: proporcional ao que cada cor puxou nos macros de troca; sem macros, pelo número de trocas para ela.
  const weight = (t: number) => (macro.size ? macro.get(t) ?? 0 : changes.get(t) ?? 0)
  const wsum = used.reduce((s, t) => s + weight(t), 0)
  const r2 = (n: number) => Math.round(n * 100) / 100
  const tools: GcodeTool[] = used.map((t) => {
    const hex = colors[t] ?? ''
    return {
      index: t, hex, name: hex ? colorName(hex) : `Cor ${t + 1}`,
      modelG: r2(net.get(t)!.model * gPerMm(t)), towerG: r2(net.get(t)!.tower * gPerMm(t)),
      purgeG: wsum > 0 ? r2((purgeTotal * weight(t)) / wsum) : 0,
    }
  })
  return { hours, totalG: r2(Math.max(totalFromHeader, activeG)), tools, purgeIsEstimate: purgeTotal > 0, name: nameFromFile(fileName) }
}
