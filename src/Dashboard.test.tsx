import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Dashboard } from './Dashboard'
import { addSaved } from './domain/saved'
import { linhaDeCalc } from './domain/trabalhos'

const input = {
  grams: 100, pricePerKg: 100, hours: 10, watts: 200, tariff: 1, printerPrice: 3000, lifetimeHours: 3000,
  laborMinutes: 30, laborRate: 20, failurePct: 20, quantity: 4, marginPct: 50, soldPrice: 25,
}
const noop = () => {}

describe('Dashboard', () => {
  it('mostra o estado vazio com orientação', () => {
    const html = renderToString(<Dashboard jobs={[]} onOpen={noop} onDelete={noop} />)
    expect(html).toContain('Nenhum cálculo salvo ainda')
  })
  it('mostra os 5 blocos com um trabalho salvo', () => {
    const jobs = addSaved([], 'Chaveiro', input, '1', '2026-11-27T12:00:00Z').map(linhaDeCalc)
    const html = renderToString(<Dashboard jobs={jobs} onOpen={noop} onDelete={noop} />)
    for (const t of ['Últimos cálculos', 'Custo por peça', 'Margem bruta por trabalho', 'Preço praticado e preço sugerido', 'Lucro por hora de máquina', 'Chaveiro'])
      expect(html).toContain(t)
    expect(html).toContain('R$')
    expect(html).toContain('data-label="Margem bruta"')
    expect(html).toContain('data-label="Lucro por hora"')
  })
})
