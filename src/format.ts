export const money = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const pct = (x: number) => (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
