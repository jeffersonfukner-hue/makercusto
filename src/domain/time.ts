// Tempo de impressão: o usuário digita horas, minutos e segundos; o cálculo usa horas decimais.
export type HMS = { h: number; m: number; s: number }

export function toHMS(hours: number): HMS {
  const total = Math.round((Number.isFinite(hours) && hours > 0 ? hours : 0) * 3600)
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}

// Campo vazio vale 0. Texto inválido, negativo ou fracionado vira NaN (o validador acusa).
export function fromHMS(h: string, m: string, s: string): number {
  const part = (v: string) => (v.trim() === '' ? 0 : /^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN)
  const [H, M, S] = [part(h), part(m), part(s)]
  return H + M / 60 + S / 3600
}
