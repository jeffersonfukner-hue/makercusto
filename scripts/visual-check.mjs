// Checagem visual automática: abre o build em 3 larguras, tira capturas e falha se houver
// rolagem horizontal, erro de console ou texto cortado. Uso: npm run build && npm run visual
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome'
const OUT = process.env.SHOTS_DIR || 'visual-out'
const PORT = 4173
const sizes = [{ n: 'celular-360', w: 360, h: 780 }, { n: 'tablet-768', w: 768, h: 900 }, { n: 'desktop-1280', w: 1280, h: 900 }]
const routes = ['#/', '#/calculadora', '#/painel', '#/filamentos', '#/calculadora?avancado', '#/produto', '#/impressoras', '#/fornecedores', '#/marcas', '#/cores', '#/estoque', '#/inicio']
const sample = { grams: 50, pricePerKg: 100, hours: 3, watts: 150, tariff: 1.03, printerPrice: 3500, lifetimeHours: 3000,
  laborMinutes: 10, laborRate: 20, failurePct: 10, quantity: 1, marginPct: 50 }
const seed = JSON.stringify([
  { id: 'a', name: 'Chaveiro azul', savedAt: '2026-11-27T10:00:00Z', input: { ...sample, soldPrice: 35 } },
  { id: 'b', name: 'Suporte de fone com nome bem comprido para testar quebra', savedAt: '2026-11-26T10:00:00Z', input: sample },
])

const fil = JSON.stringify([
  { id: 'f1', name: 'PLA Preto 002', supplier: 'Fornecedor com Nome Bem Comprido', material: 'PLA', color: 'Preto', priceCents: 7500, weightG: 1000, boughtAt: '2026-11-20' },
  { id: 'f2', name: 'PLA Preto 001', supplier: 'Fornecedor com Nome Bem Comprido', material: 'PLA', color: 'Preto', priceCents: 6800, weightG: 1000, boughtAt: '2026-10-01' },
])

const draft = JSON.stringify({
  printer: '', bought: [{ name: 'Copo de alumínio com nome comprido para testar', price: '12,5', qty: '1' }],
  parts: [{ name: 'Brasão', h: '0', m: '36', s: '34', pieces: '1', per: '1', lines: [
    { color: 'preto', fil: '', price: '68', model: '2,77', flushed: '0,09', tower: '0,09' },
    { color: 'vermelho', fil: '', price: '75', model: '0,88', flushed: '1,04', tower: '0,53' },
    { color: 'branco', fil: '', price: '68', model: '0,11', flushed: '2,08', tower: '0,12' }] },
    { name: 'Aro', h: '1', m: '20', s: '0', pieces: '1', per: '1', lines: [{ color: 'vermelho', fil: '', price: '75', model: '30', flushed: '0', tower: '0' }] }],
  shop: { watts: '150', tariff: '1,03', printerPrice: '3500', life: '3000', laborMin: '10', laborRate: '20', fail: '10', margin: '50', sold: '' },
})
const prns = JSON.stringify([{ id: 'p1', name: 'Anycubic Kobra X da oficina', watts: 150, priceCents: 300000, lifetimeHours: 3000 }])

const sups = JSON.stringify([{ id: 's1', name: 'Masterprint', contact: '(43) 99999-0000', site: 'masterprint.com.br', notes: 'Frete grátis acima de R$ 300 e prazo de 3 dias úteis' }])
const stock = JSON.stringify([
  { id: 'i1', name: 'Copo de alumínio', category: 'Canecas', supplier: 'Loja com nome comprido de teste', qty: 2, min: 5, costCents: 1250 },
  { id: 'i2', name: 'LED 5mm', category: 'Iluminação', supplier: '', qty: 100, min: 10, costCents: 35 }])

const brandsSeed = JSON.stringify([{ id: 'b1', name: 'Marca Própria com Nome Bem Comprido', site: 'marca.com.br', nozzleC: 215, bedC: 60 }])
const colorsSeed = JSON.stringify([{ id: 'c1', name: 'Verde Floresta Dual Color com Nome Comprido' }])
const sups2 = JSON.stringify([
  { id: 's1', name: 'Masterprint', contact: '(43) 99999-0000', site: 'masterprint.com.br', notes: 'Frete grátis acima de R$ 300 e prazo de 3 dias úteis' },
  { id: 's2', name: 'Fornecedor com Nome Bem Comprido', contact: '', site: '', notes: '' }])

mkdirSync(OUT, { recursive: true })
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const base = `http://localhost:${PORT}/`
for (let i = 0; i < 40; i++) { try { if ((await fetch(base)).ok) break } catch {} await new Promise((r) => setTimeout(r, 250)) }

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const problems = []
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, locale: 'pt-BR' })
  await ctx.addInitScript(([v, f, d, p, su, st, br, co]) => { try { localStorage.setItem('makercusto:marcas', br); localStorage.setItem('makercusto:cores', co); localStorage.setItem('makercusto:calculos', v); localStorage.setItem('makercusto:filamentos', f); localStorage.setItem('makercusto:rascunho-produto', d); localStorage.setItem('makercusto:impressoras', p); localStorage.setItem('makercusto:fornecedores', su); localStorage.setItem('makercusto:insumos', st) } catch {} }, [seed, fil, draft, prns, sups2, stock, brandsSeed, colorsSeed])
  const page = await ctx.newPage()
  // Fontes externas e favicon não contam: a rede de teste pode bloqueá-los.
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(`[${s.n}] console: ${m.text()}`) })
  page.on('pageerror', (e) => problems.push(`[${s.n}] erro: ${e.message}`))
  for (const r of routes) {
    const adv = r.endsWith('?avancado')
    await page.goto(base + r.replace('?avancado', '')); await page.evaluate((a) => localStorage.setItem('makercusto:modo', a ? 'avancado' : 'basico'), adv)
    await page.reload(); await page.waitForTimeout(300)
    const name = `${s.n}-${r.replace('#/', '').replace('?avancado', '-avancado') || 'inicio'}`
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
    const over = await page.evaluate(() => {
      const w = document.documentElement.clientWidth
      const bad = [...document.querySelectorAll('body *')].filter((e) => {
        if (e.closest('.scroll')) return false
        const b = e.getBoundingClientRect(); return b.width > 0 && b.right > w + 1
      }).slice(0, 3).map((e) => e.tagName.toLowerCase() + '.' + e.className)
      return { scroll: document.documentElement.scrollWidth - w, bad }
    })
    if (over.scroll > 1) problems.push(`[${name}] rolagem horizontal de ${over.scroll}px`)
    if (over.bad.length) problems.push(`[${name}] elementos além da borda: ${over.bad.join(', ')}`)
  }
  // Fluxo do cadastro de filamento: busca de cor, nome gerado, último preço, "+" com cadastro rápido e data.
  const ok = (cond, msg) => { if (!cond) problems.push(`[${s.n}] fluxo filamento: ${msg}`) }
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.goto(base + '#/filamentos'); await page.reload(); await page.waitForTimeout(300)
  await page.fill('#f-cor', 'preto fo')
  await page.waitForSelector('[role=listbox] [role=option]')
  ok((await page.textContent('[role=listbox] [role=option]')) === 'Preto Fosco', 'busca "preto fo" não trouxe Preto Fosco primeiro')
  ok((await overflow()) <= 1, 'lista de sugestões causou rolagem horizontal')
  await page.screenshot({ path: `${OUT}/${s.n}-fluxo-1-busca-cor.png`, fullPage: true })
  await page.click('[role=option]:has-text("Preto Fosco")')
  ok((await page.inputValue('#f-cor')) === 'Preto Fosco', 'cor não foi escolhida')
  await page.fill('#f-marca', 'voolt'); await page.click('[role=option]:has-text("Voolt3D")')
  ok((await page.inputValue('#f-marca')) === 'Voolt3D', 'marca não foi escolhida')
  await page.fill('#f-forn', 'fornecedor com'); await page.click('[role=option]')
  ok((await page.inputValue('#f-forn')) === 'Fornecedor com Nome Bem Comprido', 'fornecedor não foi escolhido')
  ok((await page.inputValue('#f-nome')) === 'PLA Preto Fosco Voolt3D 001', `nome gerado inesperado: ${await page.inputValue('#f-nome')}`)
  ok(/75/.test(await page.inputValue('label:has-text("Preço pago no rolo") input')), 'último preço do fornecedor não foi preenchido')
  await page.click('button[aria-label="Cadastrar nova marca"]')
  await page.waitForSelector('[role=dialog]')
  ok(await page.evaluate(() => document.activeElement?.closest('[role=dialog]') !== null), 'foco não foi para a janela de cadastro')
  await page.screenshot({ path: `${OUT}/${s.n}-fluxo-2-cadastro-rapido.png` })
  await page.keyboard.press('Escape')
  ok((await page.locator('[role=dialog]').count()) === 0, 'Esc não fechou a janela')
  await page.click('button[aria-label="Cadastrar nova marca"]')
  await page.fill('[role=dialog] input', 'minha marca nova'); await page.keyboard.press('Enter')
  await page.waitForSelector('[role=dialog]', { state: 'detached' })
  ok((await page.inputValue('#f-marca')) === 'Minha Marca Nova', `cadastro rápido não escolheu a marca: ${await page.inputValue('#f-marca')}`)
  await page.selectOption('select[aria-label="Data da compra, mês"]', '2')
  await page.selectOption('select[aria-label="Data da compra, dia"]', '28')
  await page.selectOption('select[aria-label="Data da compra, ano"]', '2025')
  await page.selectOption('select[aria-label="Data da compra, mês"]', '4')
  ok((await page.locator('select[aria-label="Data da compra, dia"] option').count()) === 30, 'dias de abril deveriam ser 30')
  await page.click('button:has-text("Salvar rolo")')
  await page.waitForSelector('text=Salvo.')
  ok(await page.locator('td[data-label="Nome"]', { hasText: 'PLA Preto Fosco Minha Marca Nova 001' }).count() === 1, 'rolo salvo não apareceu com o nome gerado')
  ok(await page.locator('td[data-label="Compra"]', { hasText: '28/04/2025' }).count() === 1, `data salva inesperada`)
  await page.screenshot({ path: `${OUT}/${s.n}-fluxo-3-salvo.png`, fullPage: true })
  ok((await overflow()) <= 1, 'tela após salvar com rolagem horizontal')
  await ctx.close()
}
await browser.close(); server.kill()
if (problems.length) { console.log('PROBLEMAS:\n' + problems.join('\n')); process.exit(1) }
console.log(`OK: ${sizes.length * routes.length} capturas em ${OUT}/, sem rolagem horizontal nem erros de console.`)
