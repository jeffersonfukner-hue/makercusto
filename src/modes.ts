import type { CostInput } from './domain/cost'

export type Mode = 'basico' | 'avancado'
// Campos do modo básico. Os demais ficam em "Ajustes da oficina", já preenchidos e editáveis.
export const ESSENTIAL = ['grams', 'pricePerKg', 'hours', 'marginPct', 'quantity'] as const
// No básico o preço praticado não entra na conta, para o resultado bater com o que está na tela.
export const inputForMode = (i: CostInput, m: Mode): CostInput => (m === 'basico' ? { ...i, soldPrice: undefined } : i)
