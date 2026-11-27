import { useMemo, useState } from 'react'
import { DateParts, Combo, Label, QuickAdd } from './Campos'
import { BRANDS, COLORS, canonical, mergeOptions } from './domain/catalogo'
import { MATERIALS, generateName, lastPurchase, lastTemps, pricePerKg, type Filament, type FilamentDraft } from './domain/filament'
import type { Brand, BrandDraft, Color, ColorDraft } from './domain/marca'
import type { Supplier, SupplierDraft } from './domain/supplier'
import { foldText, titleCase } from './domain/texto'
import { money } from './format'

const today = () => new Date().toISOString().slice(0, 10)
const toCents = (s: string) => Math.round(Number(s.replace(',', '.')) * 100)
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const comma = (n: number) => String(n).replace('.', ',')
const empty = () => ({ supplier: '', brand: '', material: 'PLA', color: '', price: '', weight: '1000', boughtAt: today(), nozzle: '', bed: '' })
type Form = ReturnType<typeof empty>
type Kind = 'supplier' | 'brand' | 'color'

export function Filamentos({ list, suppliers = [], brands = [], colors = [], onAdd, onRemove, onAddSupplier, onAddBrand, onAddColor, msg: cloudMsg }: {
  list: Filament[]; suppliers?: Supplier[]; brands?: Brand[]; colors?: Color[]
  onAdd: (d: FilamentDraft) => Promise<void>; onRemove: (id: string) => void
  onAddSupplier?: (d: SupplierDraft) => Promise<void>; onAddBrand?: (d: BrandDraft) => Promise<void>; onAddColor?: (d: ColorDraft) => Promise<void>
  msg: string
}) {
  const [f, setF] = useState<Form>(empty)
  const [msg, setMsg] = useState('')
  const [customName, setCustomName] = useState(false)
  const [name, setName] = useState('')
  const [priceAuto, setPriceAuto] = useState(false)
  const [tempAuto, setTempAuto] = useState(false)
  const [modal, setModal] = useState<{ kind: Kind; initial: string } | null>(null)

  const supplierOpts = useMemo(() => suppliers.map((s) => s.name), [suppliers])
  const brandOpts = useMemo(() => mergeOptions(BRANDS, brands.map((b) => b.name)), [brands])
  const colorOpts = useMemo(() => [...new Map([...colors.map((c) => c.name), ...COLORS].map((c) => [foldText(c), c])).values()], [colors])

  const autoName = generateName(list, { material: f.material, color: f.color, brand: f.brand })

  // Escolher fornecedor, marca, material ou cor puxa o último preço daquele fornecedor e as temperaturas já usadas.
  // O que a pessoa digitou à mão nunca é sobrescrito.
  const change = (patch: Partial<Form>) => {
    const next = { ...f, ...patch }
    const last = lastPurchase(list, next)
    if (last && (next.price === '' || priceAuto)) { next.price = comma(last.priceCents / 100); next.weight = String(last.weightG); setPriceAuto(true) }
    const own = brands.find((b) => foldText(b.name) === foldText(next.brand))
    const t = lastTemps(list, next) ?? (own && (own.nozzleC !== undefined || own.bedC !== undefined) ? { nozzleC: own.nozzleC, bedC: own.bedC } : undefined)
    if (t && ((next.nozzle === '' && next.bed === '') || tempAuto)) {
      next.nozzle = t.nozzleC === undefined ? '' : String(t.nozzleC); next.bed = t.bedC === undefined ? '' : String(t.bedC); setTempAuto(true)
    }
    setF(next)
  }
  const last = lastPurchase(list, f)

  const save = async () => {
    try {
      const clean = { supplier: canonical(supplierOpts, f.supplier), brand: canonical(brandOpts, f.brand), color: canonical(colorOpts, f.color) }
      const finalName = customName ? titleCase(name) : generateName(list, { material: f.material, color: clean.color, brand: clean.brand })
      await onAdd({
        name: finalName, supplier: clean.supplier, brand: clean.brand, material: f.material, color: clean.color,
        nozzleC: f.nozzle.trim() === '' ? undefined : Number(f.nozzle), bedC: f.bed.trim() === '' ? undefined : Number(f.bed),
        priceCents: f.price.trim() === '' ? NaN : toCents(f.price),
        weightG: f.weight.trim() === '' ? NaN : Number(f.weight.replace(',', '.')),
        boughtAt: f.boughtAt,
      })
      // Próximo rolo costuma ser da mesma compra: mantém fornecedor, marca, material, preço e peso.
      setF({ ...empty(), supplier: clean.supplier, brand: clean.brand, material: f.material, price: f.price, weight: f.weight })
      setPriceAuto(true); setTempAuto(false); setCustomName(false); setName(''); setMsg('Salvo.')
    } catch (e) { setMsg((e as Error).message) }
  }
  const repeat = (r: Filament) => {
    setF({ supplier: r.supplier, brand: r.brand, nozzle: r.nozzleC === undefined ? '' : String(r.nozzleC), bed: r.bedC === undefined ? '' : String(r.bedC), material: r.material, color: r.color,
      price: comma(r.priceCents / 100), weight: String(r.weightG), boughtAt: today() })
    setCustomName(false); setPriceAuto(true); setTempAuto(false)
    setMsg('Dados copiados. O nome ganha o próximo código. Confira o preço e salve como novo rolo.')
  }

  // Cadastro rápido: se o nome já existe na lista, só escolhe; senão cadastra e escolhe.
  const quick = async (kind: Kind, typed: string) => {
    const opts = kind === 'supplier' ? supplierOpts : kind === 'brand' ? brandOpts : colorOpts
    const existing = opts.find((o) => foldText(o) === foldText(typed))
    if (existing) { change({ [kind]: existing } as Partial<Form>); return }
    const nm = titleCase(typed)
    if (kind === 'supplier') await onAddSupplier?.({ name: nm, contact: '', site: '', notes: '' })
    else if (kind === 'brand') await onAddBrand?.({ name: nm, site: '' })
    else await onAddColor?.({ name: nm })
    change({ [kind]: nm } as Partial<Form>)
  }
  const plus = (kind: Kind, label: string, has: boolean) => has ? { label, onClick: () => setModal({ kind, initial: '' }) } : undefined
  const onCreate = (kind: Kind, has: boolean) => has ? (typed: string) => setModal({ kind, initial: typed }) : undefined
  const titles: Record<Kind, [string, string, string]> = {
    supplier: ['Novo fornecedor', 'Nome do fornecedor', 'Ex.: Masterprint'], brand: ['Nova marca', 'Nome da marca', 'Ex.: Voolt3D'], color: ['Nova cor', 'Nome da cor', 'Ex.: Azul Bebê'],
  }

  return (
    <div className="dash">
      <section className="card">
        <h2>Novo rolo</h2>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <div className="field">
            <Label htmlFor="f-material">Material</Label>
            <span className="input"><select id="f-material" value={f.material} onChange={(e) => change({ material: e.target.value })}>{MATERIALS.map((m) => <option key={m}>{m}</option>)}</select></span>
          </div>
          <div className="field">
            <Label htmlFor="f-cor" plus={plus('color', 'Cadastrar nova cor', !!onAddColor)}>Cor (opcional)</Label>
            <Combo id="f-cor" value={f.color} onChange={(v) => change({ color: v })} options={colorOpts} placeholder="Digite para buscar: preto, azul, dual..." onCreate={onCreate('color', !!onAddColor)} />
          </div>
          <div className="field">
            <Label htmlFor="f-marca" plus={plus('brand', 'Cadastrar nova marca', !!onAddBrand)}>Marca (opcional)</Label>
            <Combo id="f-marca" value={f.brand} onChange={(v) => change({ brand: v })} options={brandOpts} placeholder="Ex.: Masterprint" onCreate={onCreate('brand', !!onAddBrand)} />
          </div>
          <div className="field">
            <Label htmlFor="f-forn" plus={plus('supplier', 'Cadastrar novo fornecedor', !!onAddSupplier)}>Fornecedor (opcional)</Label>
            <Combo id="f-forn" value={f.supplier} onChange={(v) => change({ supplier: v })} options={supplierOpts} onCreate={onCreate('supplier', !!onAddSupplier)} />
            <small>Ao escolher o fornecedor, o último preço pago nele é preenchido.</small>
          </div>
          <div className="field">
            <div className="lab">
              <label htmlFor="f-nome">Nome</label>
              <button type="button" className="textbtn" onClick={() => { if (!customName) setName(autoName); setCustomName(!customName) }}>
                {customName ? 'Voltar ao automático' : 'Personalizar'}
              </button>
            </div>
            <span className="input">
              <input id="f-nome" value={customName ? name : autoName} readOnly={!customName} maxLength={60}
                onChange={(e) => setName(e.target.value)} onBlur={() => { if (customName) setName(titleCase(name)) }} />
            </span>
            <small>{customName ? 'Nome escrito por você.' : 'Montado com material, cor, marca e um código que sobe a cada rolo novo.'}</small>
          </div>
          <label><span>Preço pago no rolo</span><span className="input"><input inputMode="decimal" value={f.price} onChange={(e) => { setPriceAuto(false); setF({ ...f, price: e.target.value }) }} /><em>R$</em></span>
            {last && <small>Último preço neste fornecedor: {money(last.priceCents)} em {new Date(last.boughtAt + 'T12:00:00').toLocaleDateString('pt-BR')} ({last.name}).</small>}</label>
          <label><span>Peso do rolo</span><span className="input"><input inputMode="numeric" value={f.weight} onChange={(e) => { setPriceAuto(false); setF({ ...f, weight: e.target.value }) }} /><em>g</em></span>
            <small>Rolo comum: 1000 g (1 kg).</small></label>
          <div className="two">
            <label><span>Temperatura do bico (opcional)</span><span className="input"><input inputMode="numeric" value={f.nozzle} onChange={(e) => { setTempAuto(false); setF({ ...f, nozzle: e.target.value }) }} /><em>°C</em></span></label>
            <label><span>Temperatura da mesa (opcional)</span><span className="input"><input inputMode="numeric" value={f.bed} onChange={(e) => { setTempAuto(false); setF({ ...f, bed: e.target.value }) }} /><em>°C</em></span></label>
          </div>
          <DateParts legend="Data da compra" value={f.boughtAt} onChange={(v) => setF({ ...f, boughtAt: v })} />
          <p><button type="submit" className="primary">Salvar rolo</button></p>
          {msg && <p className="note" role="status">{msg}</p>}
        </form>
      </section>
      <section className="card wide">
        <h2>Meus filamentos</h2>
        {cloudMsg && <p className="errors" role="alert">{cloudMsg}</p>}
        {!list.length ? (
          <p>Nenhum rolo cadastrado. Cadastre um e ele aparece na calculadora (modo Avançado).</p>
        ) : (
          <div className="scroll stack"><table>
            <thead><tr>{['Nome', 'Marca e material', 'Fornecedor', 'Temp. bico/mesa', 'Compra', 'Rolo', 'Preço por kg', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>{list.map((r) => (
              <tr key={r.id}>
                <td data-label="Nome">{r.name}</td>
                <td data-label="Marca e material">{[r.brand, r.material, r.color].filter(Boolean).join(' ')}</td>
                <td data-label="Fornecedor">{r.supplier || '-'}</td>
                <td data-label="Temp. bico/mesa">{r.nozzleC === undefined && r.bedC === undefined ? '-' : `${r.nozzleC ?? '?'} / ${r.bedC ?? '?'} °C`}</td>
                <td data-label="Compra">{new Date(r.boughtAt + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                <td data-label="Rolo">{money(r.priceCents)} · {r.weightG} g</td>
                <td data-label="Preço por kg"><strong>{brl(pricePerKg(r))}</strong></td>
                <td>
                  <div className="rowacts">
                    <button type="button" onClick={() => repeat(r)}>Novo rolo igual</button>
                    <button type="button" onClick={() => { if (confirm(`Excluir "${r.name}"?`)) onRemove(r.id) }}>Excluir</button>
                  </div>
                </td>
              </tr>))}</tbody>
          </table></div>
        )}
        <p className="note">Cada compra é um registro, com o preço que você pagou. Os cálculos já salvos não mudam quando você cadastra um preço novo.</p>
      </section>
      {modal && <QuickAdd title={titles[modal.kind][0]} label={titles[modal.kind][1]} placeholder={titles[modal.kind][2]} initial={modal.initial}
        onSave={(n) => quick(modal.kind, n)} onClose={() => setModal(null)} />}
    </div>
  )
}
