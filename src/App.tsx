import { useEffect, useRef, useState } from 'react'
import { Composition } from './Composition'
import { Dashboard } from './Dashboard'
import { calculateCost, validate, type CostInput, type CostResult } from './domain/cost'
import { addSaved, KINDS, summarize, type Kind, type SavedCalc } from './domain/saved'
import { money, pct } from './format'
import { fromHMS, toHMS } from './domain/time'
import { addFilament, filamentLabel, pricePerKg, type Filament, type FilamentDraft } from './domain/filament'
import { addPrinter, type UserPrinter, type UserPrinterDraft } from './domain/printers'
import { addSavedProduct, type ProductInput, type SavedProduct } from './domain/product'
import { addSupplier, type Supplier, type SupplierDraft } from './domain/supplier'
import { addBrand, addColor, type Brand, type BrandDraft, type Color, type ColorDraft } from './domain/marca'
import { addSupply, type Supply, type SupplyDraft } from './domain/supply'
import { AJUDA } from './ajuda'
import { Fld, Info } from './Campos'
import { ImportGcode } from './ImportGcode'
import { QuickFilament, QuickPrinter } from './Rapido'
import { Estoque } from './Estoque'
import { Cores } from './Cores'
import { Filamentos } from './Filamentos'
import { Marcas } from './Marcas'
import { Fornecedores } from './Fornecedores'
import { LandingHero, LandingSections } from './Landing'
import { Impressoras } from './Impressoras'
import { ImportBar } from './ImportBar'
import { Produto } from './Produto'
import { useList } from './useList'
import { ESSENTIAL, inputForMode, type Mode } from './modes'
import { cloud, onUser, signInWithGoogle, signOut, supabase } from './supabase'
import { readBrands, readColors, writeBrands, writeColors, readFilaments, readMode, readPrinters, readProducts, readSaved, readStartPage, readSuppliers, readSupplies, writeFilaments, writeMode, writePrinters, writeProducts, writeSaved, writeStartPage, writeSuppliers, writeSupplies } from './storage'

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))

function useRoute() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const r = hash.replace(/^#\/?/, '')
  return (['painel', 'filamentos', 'produto', 'impressoras', 'fornecedores', 'marcas', 'cores', 'estoque', 'inicio'] as const).find((x) => x === r) ?? 'calculadora'
}

type Work = { name: string; kind: Kind }
const toForm = (i: CostInput): Form => {
  const t = (n: number) => String(n).replace('.', ',')
  return {
    grams: t(i.grams), pricePerKg: t(i.pricePerKg), timeH: String(toHMS(i.hours).h), timeM: String(toHMS(i.hours).m), timeS: String(toHMS(i.hours).s), watts: t(i.watts), tariff: t(i.tariff),
    printerPrice: t(i.printerPrice), lifetimeHours: t(i.lifetimeHours), laborMinutes: t(i.laborMinutes),
    laborRate: t(i.laborRate), failurePct: t(i.failurePct), quantity: t(i.quantity), marginPct: t(i.marginPct),
    soldPrice: i.soldPrice === undefined ? '' : t(i.soldPrice),
  }
}

export default function App() {
  const route = useRoute()
  const [form, setForm] = useState<Form>(initial)
  const [saved, setSaved] = useState<SavedCalc[]>(readSaved)
  const [mode, setModeState] = useState<Mode>(readMode)
  const [work, setWork] = useState<Work>({ name: '', kind: 'produto' })
  const [user, setUser] = useState<string | null>(null)
  const [cloudMsg, setCloudMsg] = useState('')
  const setMode = (m: Mode) => { setModeState(m); writeMode(m) }
  const update = (next: SavedCalc[]) => { setSaved(next); writeSaved(next) }
  const account: Account = supabase ? { user, signIn: signInWithGoogle, signOut } : null

  useEffect(() => onUser(setUser), [])
  const fil = useList<Filament, FilamentDraft>({ read: readFilaments, write: writeFilaments, user, api: cloud?.filaments ?? null,
    addLocal: addFilament, toDraft: ({ id: _id, ...d }) => d })
  const prn = useList<UserPrinter, UserPrinterDraft>({ read: readPrinters, write: writePrinters, user, api: cloud?.printers ?? null,
    addLocal: addPrinter, toDraft: ({ id: _id, ...d }) => d })
  const prod = useList<SavedProduct, { name: string; input: ProductInput }>({ read: readProducts, write: writeProducts, user, api: cloud?.products ?? null,
    addLocal: (l, d, id) => addSavedProduct(l, d.name, d.input, id, new Date().toISOString()), toDraft: (p) => ({ name: p.name, input: p.input }) })
  const sup = useList<Supplier, SupplierDraft>({ read: readSuppliers, write: writeSuppliers, user, api: cloud?.suppliers ?? null,
    addLocal: addSupplier, toDraft: ({ id: _id, ...d }) => d })
  const brd = useList<Brand, BrandDraft>({ read: readBrands, write: writeBrands, user, api: cloud?.brands ?? null,
    addLocal: addBrand, toDraft: ({ id: _id, ...d }) => d })
  const col = useList<Color, ColorDraft>({ read: readColors, write: writeColors, user, api: cloud?.colors ?? null,
    addLocal: addColor, toDraft: ({ id: _id, ...d }) => d })
  const stock = useList<Supply, SupplyDraft>({ read: readSupplies, write: writeSupplies, user, api: cloud?.supplies ?? null,
    addLocal: addSupply, toDraft: ({ id: _id, ...d }) => d })
  // Ao entrar na conta, abre a tela que a pessoa escolheu (padrão: a calculadora).
  const prevUser = useRef<string | null>(null)
  useEffect(() => {
    if (user && !prevUser.current && readStartPage() === 'inicio' && (location.hash === '' || location.hash === '#/' || location.hash === '#/calculadora')) location.hash = '#/inicio'
    prevUser.current = user
  }, [user])
  const localCalcs = user && cloud ? readSaved().length : 0
  const importCalcs = async () => {
    if (!(user && cloud)) return
    const local = readSaved(); let sent = 0
    try {
      for (const c of [...local].reverse()) { await cloud.save(c.name, c.input); sent++ }
      writeSaved([]); setCloudMsg(`${sent} cálculos enviados para a nuvem.`)
    } catch (e) { writeSaved(local.slice(0, local.length - sent)); setCloudMsg((e as Error).message) }
    setSaved(await cloud.list())
  }
  useEffect(() => {
    if (!cloud) return
    if (!user) { setSaved(readSaved()); setCloudMsg(''); return }
    cloud.list().then((l) => { setSaved(l); setCloudMsg('') }).catch((e: Error) => setCloudMsg(e.message))
  }, [user])

  const onSave = async (name: string, input: CostInput, kind: Kind) => {
    if (user && cloud) { await cloud.save(name, input, kind); setSaved(await cloud.list()); return }
    update(addSaved(saved, name, input, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, new Date().toISOString(), kind))
  }
  const onDelete = async (id: string) => {
    if (!(user && cloud)) return update(saved.filter((x) => x.id !== id))
    try { await cloud.remove(id); setSaved(await cloud.list()); setCloudMsg('') } catch (e) { setCloudMsg((e as Error).message) }
  }

  if (route === 'calculadora') {
    return <Calculator onAddFilament={fil.add} onAddPrinter={prn.add} form={form} setForm={setForm} onSave={onSave} work={work} setWork={setWork} mode={mode} setMode={setMode} account={account} filaments={fil.items} printers={prn.items} user={user} />
  }
  if (route === 'filamentos') {
    return (
      <main className="wrap">
        <Nav route="filamentos" account={account} />
        <h1>Meus filamentos</h1>
        <p className="lead">Cadastre cada rolo com o preço que você pagou. Na calculadora (modo Avançado) você escolhe o rolo e o custo já vem certo.</p>
        <ImportBar count={fil.localCount} what="filamentos" onImport={fil.importLocal} />
        <Filamentos list={fil.items} suppliers={sup.items} brands={brd.items} colors={col.items} onAdd={fil.add} onRemove={fil.remove}
          onAddSupplier={sup.add} onAddBrand={brd.add} onAddColor={col.add} msg={fil.msg} />
      </main>
    )
  }
  if (route === 'fornecedores') {
    return (
      <main className="wrap">
        <Nav route="fornecedores" account={account} />
        <h1>Fornecedores</h1>
        <p className="lead">De onde vêm seus filamentos e insumos. Marcas e lojas diferentes têm preços e condições diferentes.</p>
        <ImportBar count={sup.localCount} what="fornecedores" onImport={sup.importLocal} />
        <Fornecedores list={sup.items} onAdd={sup.add} onRemove={sup.remove} msg={sup.msg} />
      </main>
    )
  }
  if (route === 'marcas') {
    return (
      <main className="wrap">
        <Nav route="marcas" account={account} />
        <h1>Marcas</h1>
        <p className="lead">Marcas de filamento além das sugestões, com site e as temperaturas que o fabricante recomenda.</p>
        <ImportBar count={brd.localCount} what="marcas" onImport={brd.importLocal} />
        <Marcas list={brd.items} onAdd={brd.add} onRemove={brd.remove} msg={brd.msg} />
      </main>
    )
  }
  if (route === 'cores') {
    return (
      <main className="wrap">
        <Nav route="cores" account={account} />
        <h1>Cores</h1>
        <p className="lead">Cores além da lista de sugestões. Elas aparecem na busca ao cadastrar um filamento.</p>
        <ImportBar count={col.localCount} what="cores" onImport={col.importLocal} />
        <Cores list={col.items} onAdd={col.add} onRemove={col.remove} msg={col.msg} />
      </main>
    )
  }
  if (route === 'estoque') {
    return (
      <main className="wrap">
        <Nav route="estoque" account={account} />
        <h1>Estoque de insumos</h1>
        <p className="lead">Chaveiros, copos de alumínio, LEDs, ímãs e tudo que você compra pronto. Esses itens também aparecem no produto com partes.</p>
        <ImportBar count={stock.localCount} what="itens de estoque" onImport={stock.importLocal} />
        <Estoque list={stock.items} suppliers={sup.items} onAdd={stock.add} onUpdate={stock.update} onRemove={stock.remove} onAddSupplier={sup.add} msg={stock.msg} />
      </main>
    )
  }
  if (route === 'impressoras') {
    return (
      <main className="wrap">
        <Nav route="impressoras" account={account} />
        <h1>Impressoras</h1>
        <p className="lead">Cadastre a sua impressora com o consumo, o preço e a vida útil. Na calculadora e no produto você escolhe e os campos já vêm preenchidos.</p>
        <ImportBar count={prn.localCount} what="impressoras" onImport={prn.importLocal} />
        <Impressoras list={prn.items} onAdd={prn.add} onRemove={prn.remove} msg={prn.msg} />
      </main>
    )
  }
  if (route === 'produto') {
    return (
      <main className="wrap">
        <Nav route="produto" account={account} />
        <h1>Produto com partes</h1>
        <p className="lead">Para produtos feitos de várias impressões, com várias cores e itens comprados. Copie do fatiador o tempo e o peso de cada cor.</p>
        <ImportBar count={prod.localCount} what="produtos" onImport={prod.importLocal} />
        <Produto filaments={fil.items} printers={prn.items} supplies={stock.items} products={prod.items} msg={prod.msg}
          onSave={(name, input) => prod.add({ name, input })} onDelete={prod.remove}
          onAddFilament={fil.add} onAddPrinter={prn.add} onAddSupply={stock.add} savedParts={saved.filter((x) => x.kind === 'parte')} />
      </main>
    )
  }
  if (route === 'painel') {
    const onOpen = (id: string) => {
      const s = saved.find((x) => x.id === id)
      if (s) { setForm(toForm(s.input)); setWork({ name: s.name, kind: s.kind === 'parte' ? 'parte' : 'produto' }); location.hash = '#/calculadora' }
    }
    return (
      <main className="wrap">
        <Nav route="painel" account={account} />
        <h1>Painel</h1>
        <p className="lead">
          {user ? `Seus cálculos na nuvem, na conta ${user}. Os que você salvou antes de entrar continuam só neste navegador.`
            : account ? 'Seus cálculos salvos neste navegador. Entre com Google para guardar na nuvem.' : 'Seus cálculos salvos neste navegador.'}
        </p>
        <ImportBar count={localCalcs} what="cálculos" onImport={importCalcs} />
        {cloudMsg && <p className="errors" role="alert">{cloudMsg}</p>}
        <Dashboard jobs={saved.map(summarize)} onOpen={onOpen} onDelete={onDelete} />
      </main>
    )
  }
  return <Home account={account} />
}

type Account = { user: string | null; signIn: () => void; signOut: () => void } | null

function Nav({ route, account }: { route: string; account?: Account }) {
  const ref = useRef<HTMLElement>(null)
  // O cabeçalho é fixo: guarda a altura para o card de resultado ficar logo abaixo dele.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const set = () => document.documentElement.style.setProperty('--navh', `${el.offsetHeight}px`)
    set()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const cur = (r: string) => (route === r ? 'page' : undefined)
  const close = (e: { currentTarget: Element }) => e.currentTarget.closest('details')?.removeAttribute('open')
  const registers = ['filamentos', 'marcas', 'cores', 'fornecedores', 'estoque', 'impressoras']
  return (
    <nav className="nav" ref={ref}>
      <a className="brand" href="#/">MakerCusto</a>
      <a href="#/calculadora" aria-current={cur('calculadora')}>Calculadora</a>
      <a href="#/produto" aria-current={cur('produto')}>Produto</a>
      <a href="#/painel" aria-current={cur('painel')}>Painel</a>
      <details className="more">
        <summary aria-current={registers.includes(route) ? 'page' : undefined}>Cadastros</summary>
        <div className="menu">
          <a href="#/filamentos" aria-current={cur('filamentos')} onClick={close}>Filamentos</a>
          <a href="#/marcas" aria-current={cur('marcas')} onClick={close}>Marcas</a>
          <a href="#/cores" aria-current={cur('cores')} onClick={close}>Cores</a>
          <a href="#/fornecedores" aria-current={cur('fornecedores')} onClick={close}>Fornecedores</a>
          <a href="#/estoque" aria-current={cur('estoque')} onClick={close}>Estoque</a>
          <a href="#/impressoras" aria-current={cur('impressoras')} onClick={close}>Impressoras</a>
          <a href="#/inicio" aria-current={cur('inicio')} onClick={close}>Início e preferências</a>
        </div>
      </details>
      {account && (account.user
        ? <span className="acct"><span title={account.user}>{account.user}</span><button type="button" onClick={account.signOut}>Sair</button></span>
        : <button type="button" className="acct" onClick={account.signIn}>Entrar com Google</button>)}
    </nav>
  )
}

function Home({ account }: { account?: Account }) {
  const [start, setStart] = useState(readStartPage)
  const pick = (v: 'calculadora' | 'inicio') => { setStart(v); writeStartPage(v) }
  return (
    <main className="wrap home">
      <Nav route="inicio" account={account} />
      <h1>MakerCusto</h1>
      <p className="lead">Descubra quanto custa cada peça impressa e qual preço cobrar.</p>
      <fieldset className="startpref"><legend>Ao entrar na conta, abrir</legend>
        <label><input type="radio" name="start" checked={start === 'calculadora'} onChange={() => pick('calculadora')} /> a calculadora</label>
        <label><input type="radio" name="start" checked={start === 'inicio'} onChange={() => pick('inicio')} /> esta tela, com atalhos</label>
      </fieldset>
      <div className="choices">
        <a className="choice main" href="#/calculadora">
          <strong>Calculadora</strong>
          <span>Custo por peça, preço sugerido e lucro.</span>
        </a>
        <a className="choice" href="#/produto">
          <strong>Produto com partes</strong>
          <span>Várias impressões, cores, purga e itens comprados.</span>
        </a>
        <a className="choice" href="#/impressoras">
          <strong>Impressoras</strong>
          <span>Catálogo com fonte e a sua impressora cadastrada.</span>
        </a>
        <a className="choice" href="#/filamentos">
          <strong>Filamentos</strong>
          <span>Cada rolo com o preço pago, marca e temperaturas.</span>
        </a>
        <a className="choice" href="#/marcas">
          <strong>Marcas e cores</strong>
          <span>Além das sugestões, com site e temperaturas.</span>
        </a>
        <a className="choice" href="#/fornecedores">
          <strong>Fornecedores</strong>
          <span>De onde vêm filamentos e insumos.</span>
        </a>
        <a className="choice" href="#/estoque">
          <strong>Estoque</strong>
          <span>Insumos para montar o produto, com aviso de estoque baixo.</span>
        </a>
        <a className="choice" href="#/painel">
          <strong>Painel</strong>
          <span>Seus cálculos salvos, margens e lucro por hora.</span>
        </a>
      </div>
    </main>
  )
}

// Valores de exemplo: troque pelos seus. Consumo, tarifa e vida útil são hipóteses.
const initial = {
  grams: '50', pricePerKg: '100', timeH: '3', timeM: '0', timeS: '0', watts: '150', tariff: '1,03',
  printerPrice: '3500', lifetimeHours: '3000', laborMinutes: '10', laborRate: '20',
  failurePct: '10', quantity: '1', marginPct: '50', soldPrice: '',
}
type Form = typeof initial
type Field = { key: keyof Form | 'hours'; label: string; unit: string; help: string }

const groups: { title: string; fields: Field[] }[] = [
  { title: 'Material', fields: [
    { key: 'grams', label: 'Peso total do lote', unit: 'g', help: AJUDA.grams },
    { key: 'pricePerKg', label: 'Preço do filamento', unit: 'R$/kg', help: AJUDA.pricePerKg } ] },
  { title: 'Impressão', fields: [
    { key: 'hours', label: 'Tempo de impressão do lote', unit: '', help: AJUDA.hours },
    { key: 'watts', label: 'Consumo médio', unit: 'W', help: AJUDA.watts },
    { key: 'tariff', label: 'Tarifa de energia', unit: 'R$/kWh', help: AJUDA.tariff } ] },
  { title: 'Impressora', fields: [
    { key: 'printerPrice', label: 'Preço da impressora', unit: 'R$', help: AJUDA.printerPrice },
    { key: 'lifetimeHours', label: 'Vida útil estimada', unit: 'h', help: AJUDA.lifetimeHours } ] },
  { title: 'Seu tempo e riscos', fields: [
    { key: 'laborMinutes', label: 'Trabalho manual no lote', unit: 'min', help: AJUDA.laborMinutes },
    { key: 'laborRate', label: 'Valor da sua hora', unit: 'R$/h', help: AJUDA.laborRate },
    { key: 'failurePct', label: 'Impressões que falham', unit: '%', help: AJUDA.failurePct } ] },
  { title: 'Venda', fields: [
    { key: 'quantity', label: 'Peças no lote', unit: 'un', help: AJUDA.quantity },
    { key: 'marginPct', label: 'Margem desejada', unit: '%', help: AJUDA.marginPct },
    { key: 'soldPrice', label: 'Preço que você cobra (opcional)', unit: 'R$/peça', help: AJUDA.soldPrice } ] },
]

function toInput(f: Form): CostInput {
  const sold = num(f.soldPrice)
  return {
    grams: num(f.grams), pricePerKg: num(f.pricePerKg), hours: fromHMS(f.timeH, f.timeM, f.timeS), watts: num(f.watts),
    tariff: num(f.tariff), printerPrice: num(f.printerPrice), lifetimeHours: num(f.lifetimeHours),
    laborMinutes: num(f.laborMinutes), laborRate: num(f.laborRate), failurePct: num(f.failurePct),
    quantity: num(f.quantity), marginPct: num(f.marginPct), soldPrice: f.soldPrice.trim() === '' ? undefined : sold,
  }
}

const flat = groups.flatMap((g) => g.fields)
const byKey = (k: string) => flat.find((f) => f.key === k)!
const isEssential = (k: string) => (ESSENTIAL as readonly string[]).includes(k)

function Calculator({ form, setForm, onSave, work, setWork, mode, setMode, account, filaments, printers, user, onAddFilament, onAddPrinter }: {
  user: string | null; filaments: Filament[]; printers: UserPrinter[]; form: Form; setForm: (f: Form) => void; onSave: (name: string, i: CostInput, kind: Kind) => Promise<void>; work: Work; setWork: (w: Work) => void; mode: Mode; setMode: (m: Mode) => void; account: Account
  onAddFilament?: (d: FilamentDraft) => Promise<void>; onAddPrinter?: (d: UserPrinterDraft) => Promise<void>
}) {
  const input = inputForMode(toInput(form), mode)
  const errors = validate(input)
  const result = errors.length ? null : calculateCost(input)
  const basic = mode === 'basico'
  const [fil, setFil] = useState('')
  const [prn, setPrn] = useState('')
  const [quick, setQuick] = useState<'fil' | 'prn' | null>(null)
  const pendingFil = useRef<string | null>(null)
  const pendingPrn = useRef<string | null>(null)
  const formRef = useRef(form)
  formRef.current = form
  const pickPrinter = (id: string, list = printers) => {
    setPrn(id)
    const p = list.find((x) => x.id === id)
    if (p) setForm({ ...formRef.current, watts: String(p.watts).replace('.', ','), printerPrice: String(p.priceCents / 100).replace('.', ','), lifetimeHours: String(p.lifetimeHours).replace('.', ',') })
  }
  const pickFilament = (id: string, list = filaments) => {
    setFil(id)
    const f = list.find((x) => x.id === id)
    if (f) setForm({ ...formRef.current, pricePerKg: String(pricePerKg(f)).replace('.', ',') })
  }
  // Depois do cadastro rápido, o item novo já fica escolhido.
  useEffect(() => {
    if (pendingFil.current) { const f = filaments.find((x) => x.name === pendingFil.current); if (f) { pendingFil.current = null; pickFilament(f.id, filaments) } }
    if (pendingPrn.current) { const p = printers.find((x) => x.name === pendingPrn.current); if (p) { pendingPrn.current = null; pickPrinter(p.id, printers) } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filaments, printers])

  const field = (f: Field) => f.key === 'hours' ? (
    <fieldset key="hours" className="time">
      <legend className="lab">{f.label}<Info label={f.label} text={f.help} /></legend>
      <div className="hms">
        {([['timeH', 'h'], ['timeM', 'min'], ['timeS', 's']] as const).map(([k, l]) => (
          <span className="input" key={k}>
            <input inputMode="numeric" aria-label={`${f.label}, ${{ h: 'horas', min: 'minutos', s: 'segundos' }[l]}`} value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            <em>{l}</em>
          </span>
        ))}
      </div>
    </fieldset>
  ) : (
    <Fld key={f.key} label={f.label} info={f.help} unit={f.unit} value={form[f.key as keyof Form]}
      onChange={(v) => { if (f.key === 'pricePerKg') setFil(''); setForm({ ...form, [f.key as keyof Form]: v }) }} />
  )
  const filSelect = (
    <Fld label="Filamento cadastrado" info={AJUDA.filamentoCadastrado}
      plus={onAddFilament ? { label: 'Cadastrar novo filamento', onClick: () => setQuick('fil') } : undefined}>
      <select value={fil} onChange={(e) => pickFilament(e.target.value)}>
        <option value="">Digitar o preço</option>
        {filaments.map((x) => <option key={x.id} value={x.id}>{filamentLabel(x)}</option>)}
      </select>
    </Fld>
  )
  const prnSelect = (
    <Fld label="Minha impressora" info={AJUDA.impressoraCadastrada}
      plus={onAddPrinter ? { label: 'Cadastrar nova impressora', onClick: () => setQuick('prn') } : undefined}>
      <select value={prn} onChange={(e) => pickPrinter(e.target.value)}>
        <option value="">Digitar abaixo</option>
        {printers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
    </Fld>
  )
  const adjust = groups
    .map((g) => ({ ...g, fields: g.fields.filter((f) => !isEssential(f.key) && f.key !== 'soldPrice') }))
    .filter((g) => g.fields.length)
  const g = (t: string) => groups.find((x) => x.title === t)!.fields

  return (
    <main className="wrap">
      <Nav route="calculadora" account={account} />
      {!user && <LandingHero />}
      <header className="top">
        {user ? <h1>Calculadora</h1> : <h2>Calculadora</h2>}
        <div className="modes" role="group" aria-label="Modo da calculadora">
          <button type="button" aria-pressed={basic} onClick={() => setMode('basico')}>Básico</button>
          <button type="button" aria-pressed={!basic} onClick={() => setMode('avancado')}>Avançado</button>
        </div>
      </header>
      <p className="lead">
        {basic ? 'O essencial para chegar a um preço.' : 'Todos os custos, o preço que você cobra e o lucro real.'} Os valores são exemplos. Troque pelos seus.
      </p>
      <div className="layout compact">
        <div className="result" aria-live="polite">
          {result ? <Hero r={result} margin={input.marginPct} /> : (
            <div className="hero errors"><strong>Corrija para ver o resultado:</strong>
              <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
          )}
          {result && <Details r={result} basic={basic} work={work} setWork={setWork} onSave={(n, k) => onSave(n, input, k)} />}
        </div>
        <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
          <section className="card2 start"><h2>Comece pelo nome e pelo tipo</h2>
            <div className="startrow">
              <Fld label="Nome do trabalho" info={AJUDA.nomeTrabalho} mode="text" value={work.name} onChange={(v) => setWork({ ...work, name: v })} placeholder="Ex.: Brasão do Flamengo" maxLength={60} />
              <KindPick value={work.kind} onChange={(k) => setWork({ ...work, kind: k })} />
            </div>
            <ImportGcode label="Importar do fatiador (.gcode)" onResults={([r]) => {
              const { h, m, s: sec } = toHMS(r.hours)
              setForm({ ...form, grams: String(r.totalG).replace('.', ','), timeH: String(h), timeM: String(m), timeS: String(sec) })
              setFil('')
              if (!work.name.trim()) setWork({ ...work, name: r.name })
            }} />
          </section>
          {basic ? (
            <>
              <section className="card2"><h2>Seu lote</h2>
                <div className="pair">{ESSENTIAL.slice(0, 2).map((k) => field(byKey(k)))}</div>
                {filSelect}
                {field(byKey('hours'))}
                <div className="pair">{ESSENTIAL.slice(3).map((k) => field(byKey(k)))}</div>
              </section>
              <details className="adj">
                <summary>Ajustes da oficina</summary>
                <p className="note">Energia, impressora, seu tempo e falhas. Já vêm preenchidos com exemplos. Confira com os seus dados.</p>
                <div className="cards">{adjust.map((x) => <section className="card2" key={x.title}><h2>{x.title}</h2>{x.fields.map(field)}</section>)}</div>
              </details>
            </>
          ) : (
            <div className="cards">
              <section className="card2"><h2>Material</h2>
                <div className="pair">{g('Material').map(field)}</div>
                {filSelect}
              </section>
              <section className="card2"><h2>Impressão</h2>
                {field(g('Impressão')[0])}
                <div className="pair">{g('Impressão').slice(1).map(field)}</div>
              </section>
              <section className="card2"><h2>Impressora</h2>
                {prnSelect}
                <div className="pair">{g('Impressora').map(field)}</div>
              </section>
              <section className="card2"><h2>Seu tempo e riscos</h2>
                <div className="pair">{g('Seu tempo e riscos').slice(0, 2).map(field)}</div>
                {field(g('Seu tempo e riscos')[2])}
              </section>
              <section className="card2 full"><h2>Venda</h2>
                <div className="trio">{g('Venda').map(field)}</div>
              </section>
            </div>
          )}
        </form>
      </div>
      {quick === 'fil' && onAddFilament && <QuickFilament onAdd={onAddFilament} onClose={() => setQuick(null)} onSaved={(n) => { pendingFil.current = n }} />}
      {quick === 'prn' && onAddPrinter && <QuickPrinter onAdd={onAddPrinter} onClose={() => setQuick(null)} onSaved={(n) => { pendingPrn.current = n }} defaults={{ watts: form.watts, price: form.printerPrice, life: form.lifetimeHours }} />}
      {!user && <LandingSections />}
    </main>
  )
}

function Hero({ r, margin }: { r: CostResult; margin: number }) {
  return (
    <div className="hero">
      <div><small>Custo por peça</small><strong>{money(r.unit)}</strong></div>
      <div className="sug"><small>Preço sugerido ({pct(margin / 100)} de margem)</small><strong>{money(r.suggestedPrice)}</strong></div>
    </div>
  )
}

function Details({ r, basic, onSave, work, setWork }: { r: CostResult; basic: boolean; work: Work; setWork: (w: Work) => void; onSave: (name: string, kind: Kind) => Promise<void> }) {
  return (
    <div className="details">
      {!basic && (
        <>
          <h2>Para onde vai o custo</h2>
          <Composition r={r} />
          <div className="price">
            {r.priceIsSuggested ? <p className="note">Informe o preço que você cobra para ver o lucro real.</p> : (
              <div><small>Com o preço que você cobra ({money(r.price)})</small>
                <strong className={r.profitPerUnit < 0 ? 'loss' : ''}>Lucro {money(r.profitPerUnit)} por peça</strong>
                <span>Margem {pct(r.margin)} · Markup {pct(r.markup)} · {money(r.profitPerHour)} por hora de máquina</span>
                {r.profitPerUnit < 0 && <span className="loss">Esse preço está abaixo do custo.</span>}
              </div>
            )}
          </div>
        </>
      )}
      <p className="note">Margem é lucro ÷ preço. Markup é lucro ÷ custo. Falhas entram como custo ÷ (1 − taxa): as peças boas pagam as que falharam.</p>
      <SaveBox onSave={onSave} work={work} setWork={setWork} />
    </div>
  )
}

function KindPick({ value, onChange }: { value: Kind; onChange: (k: Kind) => void }) {
  return (
    <fieldset className="kind">
      <legend className="lab">Tipo<Info label="Tipo" text={AJUDA.tipoTrabalho} /></legend>
      <div className="kindopts">
        {KINDS.map((k) => (
          <button type="button" key={k.value} aria-pressed={value === k.value} onClick={() => onChange(k.value)}>
            <strong>{k.label}</strong><span>{k.text}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function SaveBox({ onSave, work, setWork }: { onSave: (name: string, kind: Kind) => Promise<void>; work: Work; setWork: (w: Work) => void }) {
  const [msg, setMsg] = useState('')
  const save = async () => {
    try { await onSave(work.name, work.kind); setMsg('Salvo.'); setWork({ name: '', kind: work.kind }) } catch (e) { setMsg((e as Error).message) }
  }
  const label = work.kind === 'parte' ? 'Salvar como parte' : 'Salvar como produto final'
  return (
    <div className="save">
      <Fld label="Nome do trabalho" info={AJUDA.nomeTrabalho} mode="text" value={work.name} onChange={(v) => setWork({ ...work, name: v })} placeholder="Ex.: Chaveiro Azul" maxLength={60} />
      <KindPick value={work.kind} onChange={(k) => setWork({ ...work, kind: k })} />
      <button type="button" onClick={save}>{label}</button>
      {msg && <p role="status">{msg} {msg === 'Salvo.' && <a href="#/painel">Ver no painel</a>}</p>}
    </div>
  )
}
