import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Filamentos } from './Filamentos'
import { Impressoras } from './Impressoras'
import { ImportBar } from './ImportBar'
import { Produto, fromInput, toInput } from './Produto'
import { addFilament } from './domain/filament'
import { CATALOG } from './domain/printers'
import { calculateProduct } from './domain/product'

const noop = () => {}
const asyncNoop = async () => {}

describe('telas novas', () => {
  it('filamentos: vazio e com dois rolos do mesmo fornecedor', () => {
    expect(renderToString(<Filamentos list={[]} onAdd={asyncNoop} onRemove={noop} msg="" />)).toContain('Nenhum rolo cadastrado')
    const base = { name: 'PLA preto 001', supplier: 'F', brand: '', material: 'PLA', color: 'preto', priceCents: 6800, weightG: 1000, boughtAt: '2026-10-01' }
    const l = addFilament(addFilament([], base, 'a'), { ...base, name: 'PLA preto 002', priceCents: 7500, boughtAt: '2026-11-20' }, 'b')
    const html = renderToString(<Filamentos list={l} onAdd={asyncNoop} onRemove={noop} msg="" />)
    expect(html).toContain('PLA Preto 001'); expect(html).toContain('PLA Preto 002')
    expect(html).toMatch(/R\$\s75,00/); expect(html).toMatch(/R\$\s68,00/)
    expect(html).toContain('data-label="Preço por kg"')
  })
  it('impressoras: catálogo com fonte e botão de clonar', () => {
    const html = renderToString(<Impressoras list={[]} onAdd={asyncNoop} onRemove={noop} msg="" />)
    for (const c of CATALOG) expect(html).toContain(c.model)
    expect(html).toContain('Clonar para as minhas')
    expect(html).toContain('https://wiki.bambulab.com')
  })
  it('faixa de importação só aparece com itens locais', () => {
    expect(renderToString(<ImportBar count={0} what="filamentos" onImport={noop} />)).toBe('')
    expect(renderToString(<ImportBar count={3} what="filamentos" onImport={noop} />).replace(/<!-- -->/g, '')).toContain('3 filamentos')
  })
  it('produto: estado inicial pede correção; estado preenchido mostra o custo', () => {
    const html = renderToString(<Produto filaments={[]} printers={[]} products={[]} msg="" onSave={asyncNoop} onDelete={noop} />)
    expect(html).toContain('Corrija para ver o resultado')
    expect(html).toContain('Adicionar parte'); expect(html).toContain('Itens comprados')
  })
  it('produto: formulário e entrada convertem ida e volta sem perder dados', () => {
    const input = {
      parts: [{ name: 'Brasão', hours: 36.5667 / 60, piecesPerPrint: 1, perProduct: 1, lines: [
        { color: 'preto', pricePerKg: 68, modelG: 2.77, flushedG: 0.09, towerG: 0.09 }, { color: 'vermelho', pricePerKg: 75, modelG: 0.88, flushedG: 1.04, towerG: 0.53 }] }],
      bought: [{ name: 'Copo de alumínio', price: 12.5, qty: 1 }],
      watts: 150, tariff: 1.03, printerPrice: 3500, lifetimeHours: 3000, laborMinutes: 10, laborRate: 20, failurePct: 10, marginPct: 50,
    }
    const back = toInput(fromInput(input))
    expect(back.parts[0].lines).toEqual(input.parts[0].lines)
    expect(back.bought).toEqual(input.bought)
    expect(back.parts[0].hours).toBeCloseTo(input.parts[0].hours, 2)
    expect(calculateProduct(back).total).toBeGreaterThan(1250)
  })
})

import { Estoque } from './Estoque'
import { Fornecedores } from './Fornecedores'
import { LandingHero, LandingSections } from './Landing'
import { addSupplier } from './domain/supplier'
import { addSupply } from './domain/supply'

describe('telas: fornecedores, estoque e landing', () => {
  it('fornecedores: vazio e com itens', () => {
    expect(renderToString(<Fornecedores list={[]} onAdd={asyncNoop} onRemove={noop} msg="" />)).toContain('Nenhum fornecedor cadastrado')
    const l = addSupplier([], { name: 'Masterprint', contact: '(43) 9', site: 'exemplo.com', notes: '' }, 'a')
    const html = renderToString(<Fornecedores list={l} onAdd={asyncNoop} onRemove={noop} msg="" />)
    expect(html).toContain('Masterprint'); expect(html).toContain('https://exemplo.com')
  })
  it('estoque: valor parado, aviso de baixo e botões de entrada e saída', () => {
    const l = addSupply(addSupply([], { name: 'Copo de alumínio', category: '', supplier: '', qty: 2, min: 5, costCents: 1250 }, 'a'), { name: 'LED', category: '', supplier: '', qty: 100, min: 10, costCents: 35 }, 'b')
    const html = renderToString(<Estoque list={l} suppliers={[]} onAdd={asyncNoop} onUpdate={asyncNoop} onRemove={noop} msg="" />).replace(/<!-- -->/g, '')
    expect(html).toContain('Estoque baixo'); expect(html).toContain('Copo de Alumínio (2)')
    expect(html).toMatch(/R\$\s60,00/) // 2 x 12,50 + 100 x 0,35
    expect(html).toContain('Tirar 1 de LED'); expect(html).toContain('Colocar 10 em LED')
  })
  it('landing: promessa, planos honestos e sem formulário quando não há nuvem', () => {
    expect(renderToString(<LandingHero />)).toContain('Quanto custa de verdade')
    const html = renderToString(<LandingSections />)
    expect(html).toContain('Grátis'); expect(html).toContain('em breve')
    expect(html).not.toContain('Quero ser avisado')
  })
})
