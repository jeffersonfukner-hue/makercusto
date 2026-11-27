import { useState } from 'react'
import { MATERIALS, pricePerKg, type Filament, type FilamentDraft } from './domain/filament'
import type { Supplier } from './domain/supplier'
import { money } from './format'

const today = () => new Date().toISOString().slice(0, 10)
const toCents = (s: string) => Math.round(Number(s.replace(',', '.')) * 100)
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const empty = () => ({ name: '', supplier: '', brand: '', material: 'PLA', color: '', price: '', weight: '1000', boughtAt: today(), nozzle: '', bed: '' })

export function Filamentos({ list, suppliers = [], onAdd, onRemove, msg: cloudMsg }: { list: Filament[]; suppliers?: Supplier[]; onAdd: (d: FilamentDraft) => Promise<void>; onRemove: (id: string) => void; msg: string }) {
  const [f, setF] = useState(empty)
  const [msg, setMsg] = useState('')
  const set = (k: keyof ReturnType<typeof empty>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const save = async () => {
    try {
      await onAdd({
        name: f.name, supplier: f.supplier, brand: f.brand, material: f.material, color: f.color,
        nozzleC: f.nozzle.trim() === '' ? undefined : Number(f.nozzle), bedC: f.bed.trim() === '' ? undefined : Number(f.bed),
        priceCents: f.price.trim() === '' ? NaN : toCents(f.price),
        weightG: f.weight.trim() === '' ? NaN : Number(f.weight.replace(',', '.')),
        boughtAt: f.boughtAt,
      })
      setF({ ...empty(), supplier: f.supplier, brand: f.brand, material: f.material }); setMsg('Salvo.')
    } catch (e) { setMsg((e as Error).message) }
  }
  const repeat = (r: Filament) => {
    setF({ name: r.name, supplier: r.supplier, brand: r.brand, nozzle: r.nozzleC === undefined ? '' : String(r.nozzleC), bed: r.bedC === undefined ? '' : String(r.bedC), material: r.material, color: r.color,
      price: String(r.priceCents / 100).replace('.', ','), weight: String(r.weightG), boughtAt: today() })
    setMsg('Dados copiados. Mude o nome e o preço e salve como novo rolo.')
  }

  return (
    <div className="dash">
      <section className="card">
        <h2>Novo rolo</h2>
        <form onSubmit={(e) => { e.preventDefault(); void save() }} noValidate>
          <label><span>Nome</span><span className="input"><input value={f.name} onChange={set('name')} placeholder="Ex.: PLA preto 001" /></span></label>
          <label><span>Fornecedor (opcional)</span><span className="input"><input list="fornecedores" value={f.supplier} onChange={set('supplier')} /></span>
            <small>{suppliers.length ? 'Escolha da lista ou digite um novo.' : <>Cadastre em <a href="#/fornecedores">Fornecedores</a> para escolher da lista.</>}</small></label>
          <datalist id="fornecedores">{suppliers.map((x) => <option key={x.id} value={x.name} />)}</datalist>
          <label><span>Marca (opcional)</span><span className="input"><input value={f.brand} onChange={set('brand')} placeholder="Ex.: Masterprint" /></span></label>
          <label><span>Material</span>
            <span className="input"><select value={f.material} onChange={set('material')}>{MATERIALS.map((m) => <option key={m}>{m}</option>)}</select></span></label>
          <label><span>Cor (opcional)</span><span className="input"><input value={f.color} onChange={set('color')} placeholder="Ex.: preto" /></span></label>
          <label><span>Preço pago no rolo</span><span className="input"><input inputMode="decimal" value={f.price} onChange={set('price')} /><em>R$</em></span></label>
          <label><span>Peso do rolo</span><span className="input"><input inputMode="numeric" value={f.weight} onChange={set('weight')} /><em>g</em></span>
            <small>Rolo comum: 1000 g (1 kg).</small></label>
          <div className="two">
            <label><span>Temperatura do bico (opcional)</span><span className="input"><input inputMode="numeric" value={f.nozzle} onChange={set('nozzle')} /><em>°C</em></span></label>
            <label><span>Temperatura da mesa (opcional)</span><span className="input"><input inputMode="numeric" value={f.bed} onChange={set('bed')} /><em>°C</em></span></label>
          </div>
          <label><span>Data da compra</span><span className="input"><input type="date" value={f.boughtAt} onChange={set('boughtAt')} /></span></label>
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
    </div>
  )
}
