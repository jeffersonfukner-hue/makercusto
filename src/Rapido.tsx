// Cadastros rápidos (o "+" ao lado da etiqueta). Cada um pede só o essencial e devolve o nome salvo,
// para a tela de origem escolher o item novo e a pessoa continuar de onde parou.
import { AJUDA } from './ajuda'
import { QuickForm } from './Campos'
import { MATERIALS, type FilamentDraft } from './domain/filament'
import type { UserPrinterDraft } from './domain/printers'
import type { SupplyDraft } from './domain/supply'
import { titleCase } from './domain/texto'

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))
const cents = (s: string) => Math.round(num(s) * 100)

export function QuickFilament({ onAdd, onSaved, onClose }: { onAdd: (d: FilamentDraft) => Promise<void>; onSaved: (name: string) => void; onClose: () => void }) {
  return (
    <QuickForm title="Novo filamento" onClose={onClose} note="Só o essencial. Cor, marca, fornecedor e temperaturas você completa depois, em Filamentos."
      fields={[
        { key: 'name', label: 'Nome', info: AJUDA.nomeFilamento },
        { key: 'material', label: 'Material', info: AJUDA.material, kind: 'select', options: [...MATERIALS], initial: 'PLA' },
        { key: 'price', label: 'Preço pago no rolo', info: AJUDA.precoRolo, kind: 'number', unit: 'R$' },
        { key: 'weight', label: 'Peso do rolo', info: AJUDA.pesoRolo, kind: 'number', unit: 'g', initial: '1000' },
      ]}
      onSave={async (v) => {
        const name = titleCase(v.name)
        await onAdd({ name, supplier: '', brand: '', material: v.material, color: '', priceCents: cents(v.price), weightG: Math.round(num(v.weight)), boughtAt: new Date().toISOString().slice(0, 10) })
        onSaved(name)
      }} />
  )
}

export function QuickPrinter({ onAdd, onSaved, onClose, defaults }: {
  onAdd: (d: UserPrinterDraft) => Promise<void>; onSaved: (name: string) => void; onClose: () => void; defaults: { watts: string; price: string; life: string }
}) {
  return (
    <QuickForm title="Nova impressora" onClose={onClose}
      fields={[
        { key: 'name', label: 'Nome', info: AJUDA.nomeImpressora },
        { key: 'watts', label: 'Consumo médio', info: AJUDA.wattsImpressora, kind: 'number', unit: 'W', initial: defaults.watts },
        { key: 'price', label: 'Preço pago', info: AJUDA.precoImpressora, kind: 'number', unit: 'R$', initial: defaults.price },
        { key: 'life', label: 'Vida útil', info: AJUDA.vidaImpressora, kind: 'number', unit: 'h', initial: defaults.life },
      ]}
      onSave={async (v) => {
        const name = titleCase(v.name)
        await onAdd({ name, watts: num(v.watts), priceCents: cents(v.price), lifetimeHours: num(v.life) })
        onSaved(name)
      }} />
  )
}

export function QuickSupply({ onAdd, onSaved, onClose }: { onAdd: (d: SupplyDraft) => Promise<void>; onSaved: (name: string) => void; onClose: () => void }) {
  return (
    <QuickForm title="Novo item de estoque" onClose={onClose} note="Só o essencial. Categoria, fornecedor e estoque mínimo você completa depois, em Estoque."
      fields={[
        { key: 'name', label: 'Nome do item', info: AJUDA.nomeItem },
        { key: 'cost', label: 'Custo de cada', info: AJUDA.custoUnidade, kind: 'number', unit: 'R$' },
        { key: 'qty', label: 'Quantidade agora', info: AJUDA.qtdAgora, kind: 'number', unit: 'un', initial: '0' },
      ]}
      onSave={async (v) => {
        const name = titleCase(v.name)
        await onAdd({ name, category: '', qty: Math.round(num(v.qty)), min: 0, costCents: cents(v.cost), supplier: '' })
        onSaved(name)
      }} />
  )
}
