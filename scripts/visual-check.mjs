// Checagem visual automática: abre o build em 3 larguras, tira capturas e falha se houver
// rolagem horizontal, erro de console ou texto cortado. Uso: npm run build && npm run visual
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome'
const OUT = process.env.SHOTS_DIR || 'visual-out'
const PORT = 4173
const sizes = [{ n: 'celular-360', w: 360, h: 780 }, { n: 'tablet-768', w: 768, h: 900 }, { n: 'desktop-1280', w: 1280, h: 900 }]
const routes = ['#/', '#/calculadora', '#/painel', '#/filamentos', '#/calculadora?avancado', '#/produto', '#/impressoras']
const sample = { grams: 50, pricePerKg: 100, hours: 3, watts: 150, tariff: 1.03, printerPrice: 3500, lifetimeHours: 3000,
  laborMinutes: 10, laborRate: 20, failurePct: 10, quantity: 1, marginPct: 50 }
const seed = JSON.stringify([
  { id: 'a', name: 'Chaveiro azul', savedAt: '2026-11-27T10:00:00Z', input: { ...sample, soldPrice: 35 } },
  { id: 'b', name: 'Suporte de fone com nome bem comprido para testar quebra', savedAt: '2026-11-26T10:00:00Z', input: sample },
])

const fil = JSON.stringify([
  { id: 'f1', name: 'PLA preto 002', supplier: 'Fornecedor com nome bem comprido', material: 'PLA', color: 'preto', priceCents: 7500, weightG: 1000, boughtAt: '2026-11-20' },
  { id: 'f2', name: 'PLA preto 001', supplier: 'Fornecedor com nome bem comprido', material: 'PLA', color: 'preto', priceCents: 6800, weightG: 1000, boughtAt: '2026-10-01' },
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

mkdirSync(OUT, { recursive: true })
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const base = `http://localhost:${PORT}/`
for (let i = 0; i < 40; i++) { try { if ((await fetch(base)).ok) break } catch {} await new Promise((r) => setTimeout(r, 250)) }

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const problems = []
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, locale: 'pt-BR' })
  await ctx.addInitScript(([v, f, d, p]) => { try { localStorage.setItem('makercusto:calculos', v); localStorage.setItem('makercusto:filamentos', f); localStorage.setItem('makercusto:rascunho-produto', d); localStorage.setItem('makercusto:impressoras', p) } catch {} }, [seed, fil, draft, prns])
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
  await ctx.close()
}
await browser.close(); server.kill()
if (problems.length) { console.log('PROBLEMAS:\n' + problems.join('\n')); process.exit(1) }
console.log(`OK: ${sizes.length * routes.length} capturas em ${OUT}/, sem rolagem horizontal nem erros de console.`)
