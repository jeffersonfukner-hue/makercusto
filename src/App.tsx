import { useState } from 'react';
import { calculateCost, referenceCase, type CostInput, type MaterialLine } from './domain/cost';

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const numeric = (value: string) => value === '' ? NaN : Number(value);
const standardColors = ['Branco','Preto','Cinza','Prata','Azul','Azul-claro','Azul-marinho','Vermelho','Verde','Verde-claro','Amarelo','Laranja','Rosa','Roxo','Lilás','Marrom','Bege','Dourado','Cobre','Transparente','Natural'];
const colorKey = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '');
const uniqueColors = (values: string[]) => {
  const keys = new Set<string>();
  return values.map(value => value.trim()).filter(value => {
    const key = colorKey(value);
    if (!key || keys.has(key)) return false;
    keys.add(key);
    return true;
  });
};
const catalogKey = 'makercusto:cores-personalizadas:v1';
function readSavedColors(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(catalogKey) || '[]');
    return Array.isArray(parsed) ? uniqueColors(parsed.filter((v): v is string => typeof v === 'string').slice(0, 100)) : [];
  } catch { return []; }
}
type NumericKey = Exclude<keyof CostInput, 'materials'>;
const fields: { key: NumericKey; label: string; step: string }[] = [
  { key: 'hours', label: 'Tempo de impressão (horas)', step: '0.01' },
  { key: 'quantity', label: 'Unidades finalizadas no lote', step: '1' },
  { key: 'averageWatts', label: 'Consumo médio (W)', step: '1' },
  { key: 'pricePerKwh', label: 'Tarifa elétrica (R$/kWh)', step: '0.01' },
  { key: 'printerPrice', label: 'Valor da impressora (R$)', step: '1' },
  { key: 'lifetimeHours', label: 'Vida útil estimada (horas)', step: '1' },
  { key: 'accessoryPerUnit', label: 'Acessórios por unidade (R$)', step: '0.01' },
  { key: 'assemblyMinutesPerUnit', label: 'Montagem por unidade (min)', step: '0.1' },
  { key: 'laborPerHour', label: 'Mão de obra (R$/h)', step: '0.01' },
  { key: 'salePrice', label: 'Preço de venda por unidade (R$)', step: '0.01' }
];
const materialFields: { key: 'grams' | 'wasteGrams' | 'pricePerKg'; label: string }[] = [
  { key: 'grams', label: 'Modelo (g)' },
  { key: 'wasteGrams', label: 'Purga e perdas (g)' },
  { key: 'pricePerKg', label: 'R$/kg' }
];
export default function App() {
  const [form, setForm] = useState<CostInput>(referenceCase);
  const [nextId, setNextId] = useState(1);
  const [savedColors, setSavedColors] = useState<string[]>(readSavedColors);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>('blue');
  const update = (key: NumericKey, value: string) =>
    setForm(previous => ({ ...previous, [key]: numeric(value) }));
  const updateMaterial = (id: string, key: keyof MaterialLine, value: string) =>
    setForm(previous => ({
      ...previous,
      materials: (previous.materials ?? []).map(item =>
        item.id === id ? { ...item, [key]: key === 'name' ? value : numeric(value) } : item)
    }));
  const rememberColor = (name: string) => {
    const clean = name.trim();
    if (!clean || colorKey(clean) === colorKey('Nova cor')) return;
    const next = uniqueColors([...standardColors, ...savedColors, clean]);
    const customs = next.slice(standardColors.length);
    setSavedColors(customs);
    try { window.localStorage.setItem(catalogKey, JSON.stringify(customs)); } catch { /* Sem armazenamento disponível: uso apenas nesta sessão. */ }
  };
  const addMaterial = () => {
    // Um cadastro incompleto deve ser retomado, nunca multiplicado.
    const pending = (form.materials ?? []).find(item =>
      item.id.startsWith('extra-') &&
      (!item.name.trim() || colorKey(item.name) === colorKey('Nova cor') ||
        !Number.isFinite(item.grams) || item.grams <= 0 ||
        !Number.isFinite(item.pricePerKg) || item.pricePerKg <= 0 ||
        !Number.isFinite(item.wasteGrams) || item.wasteGrams < 0)
    );
    if (pending) {
      setActiveMaterialId(pending.id);
      return;
    }
    const id = 'extra-' + nextId;
    setNextId(value => value + 1);
    setActiveMaterialId(id);
    setForm(previous => ({
      ...previous,
      materials: [{ id, name: '', grams: 0, wasteGrams: 0, pricePerKg: 100 },
        ...(previous.materials ?? [])]
    }));
  };
  const removeMaterial = (id: string) => {
    setForm(previous => ({
      ...previous, materials: (previous.materials ?? []).filter(item => item.id !== id)
    }));
    setActiveMaterialId(previous => previous === id ? null : previous);
  };
  const restoreExample = () => { setForm(referenceCase); setActiveMaterialId('blue'); setNextId(1); };
  let result: ReturnType<typeof calculateCost> | undefined;
  let error = '';
  try { result = calculateCost(form); } catch (e) { error = (e as Error).message; }

  return <>
    <header className="site-header"><div className="shell brand">
      <span className="brand-mark" aria-hidden="true">M</span>
      <div><strong>MakerCusto</strong><small>Conheça seu custo. Defina seu preço.</small></div>
      <span className="phase">Protótipo · v0.1.0</span>
    </div></header>
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">CÁLCULO DE IMPRESSÃO 3D</p>
        <h1>Quanto custa produzir? Quanto sobra na venda?</h1>
        <p>Simule um lote completo com materiais de cores e preços diferentes, desperdício, energia, máquina, acessórios e montagem. Tudo é calculado no navegador.</p>
      </section>
      <div className="workspace">
        <section className="panel">
          <div className="panel-heading"><div>
            <h2>Dados de produção</h2>
            <p>Exemplo: chaveiro Nossa Senhora, 20 unidades, 3 cores.</p>
          </div><button type="button" onClick={restoreExample}>Restaurar exemplo</button></div>
          <section aria-labelledby="materials-title" className="materials">
            <div className="materials-heading">
              <h3 id="materials-title">Materiais por cor</h3>
              <button type="button" onClick={addMaterial}>+ Adicionar cor</button>
            </div>
            <datalist id="makercusto-cores">{uniqueColors([...standardColors, ...savedColors]).map(color => <option key={colorKey(color)} value={color} />)}</datalist>
            {(form.materials ?? []).map((item, index) => {
              const expanded = activeMaterialId === item.id;
              const valid = [item.grams, item.wasteGrams, item.pricePerKg].every(value => Number.isFinite(value) && value >= 0) && item.name.trim() !== '';
              const weight = item.grams + item.wasteGrams;
              return <div className="material-row" key={item.id}>
                <button type="button" className="material-toggle" aria-expanded={expanded}
                  aria-controls={`material-fields-${item.id}`}
                  onClick={() => setActiveMaterialId(expanded ? null : item.id)}>
                  <span><strong>{item.name.trim() || `Material ${index + 1}`}</strong>
                    <small>{valid ? `${weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} g · ${money(item.pricePerKg)}/kg · ${money(weight * item.pricePerKg / 1000)}` : 'Preenchimento pendente'}</small>
                  </span><span aria-hidden="true">{expanded ? '▴' : '▾'}</span>
                </button>
                {expanded && <div id={`material-fields-${item.id}`} className="material-fields">
                  <label>Cor / material
                    <input list="makercusto-cores" onBlur={e => rememberColor(e.target.value)} aria-label={`Nome do material ${index + 1}`} value={item.name}
                      onChange={e => updateMaterial(item.id, 'name', e.target.value)} />
                  </label>
                  <div className="material-numbers">
                    {materialFields.map(field => <label key={field.key}>
                      {field.label}
                      <input type="number" min="0" step="0.01"
                        data-testid={`material-${item.id}-${field.key}`}
                        value={Number.isNaN(item[field.key]) ? '' : item[field.key]}
                        onChange={e => updateMaterial(item.id, field.key, e.target.value)} />
                    </label>)}
                  </div>
                  <button type="button" className="remove-material" disabled={form.materials?.length === 1}
                    onClick={() => removeMaterial(item.id)} aria-label={`Remover material ${index + 1}`}>Remover cor</button>
                </div>}
              </div>;
            })}
            <p className="footnote">Peso do modelo e purga são valores separados. Coloque na purga apenas o material adicional não incluído no peso do fatiador. Se o relatório já incluir desperdícios, use 0 para não duplicar.</p>
          </section>
          <div className="fields">{fields.map(field => <label key={field.key}>
            {field.label}
            <input data-testid={field.key} type="number"
              min={field.key === 'quantity' || field.key === 'lifetimeHours' ? '1' : '0'}
              step={field.step} value={Number.isNaN(form[field.key]) ? '' : form[field.key]}
              onChange={e => update(field.key, e.target.value)} />
          </label>)}</div>
          <p className="footnote">Consumo elétrico, tarifa, preço da máquina, vida útil e montagem são hipóteses editáveis deste exemplo; não são medições ou tarifas oficiais.</p>
        </section>
        <section className="panel result-panel" aria-live="polite">
          <h2>Resultado da simulação</h2>
          {error ? <p className="error" role="alert">{error}</p> : result && <>
            <div className="hero-amount">
              <span>Custo de produção por unidade</span>
              <strong data-testid="unitCost">{money(result.unitCost)}</strong>
              <small>Total do lote: {money(result.lotCost)}</small>
            </div>
            <h3>Composição do lote</h3>
            <dl className="cost-list">
              {([
                ['Filamento (todas as cores)', result.material],
                ['Energia', result.energy],
                ['Depreciação', result.depreciation],
                ['Acessórios', result.accessories],
                ['Montagem', result.assembly]
              ] as const).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{money(value)}</dd></div>)}
            </dl>
            <details className="breakdown" open>
              <summary>Detalhamento dos materiais</summary>
              <p className="footnote">Modelo: {result.modelGrams.toFixed(2)} g · Purga/perdas: {result.wasteGrams.toFixed(2)} g</p>
              <dl className="cost-list">
                {result.materialBreakdown.map(material => <div key={material.id}>
                  <dt>{material.name} ({material.totalGrams.toFixed(2)} g)</dt>
                  <dd>{money(material.cost)}</dd>
                </div>)}
              </dl>
            </details>
            <div className="summary">
              <div><span>Faturamento do lote</span><strong>{money(result.lotRevenue)}</strong></div>
              <div><span>Lucro bruto estimado</span><strong data-testid="grossProfit" className={result.grossProfit < 0 ? 'negative' : 'positive'}>{money(result.grossProfit)}</strong></div>
              <div><span>Margem bruta</span><strong data-testid="margin">{result.marginPercent.toFixed(1).replace('.', ',')}%</strong></div>
              <div><span>Markup sobre custo</span><strong>{result.markupPercent.toFixed(1).replace('.', ',')}%</strong></div>
            </div>
            <p className="footnote">Não inclui embalagem, frete, taxas de marketplace, tributos ou despesas administrativas. Lucro bruto não é lucro líquido. Valores arredondados somente na apresentação.</p>
          </>}
        </section>
      </div>
    </main>
    <footer className="shell footer">MakerCusto · Fundação técnica em avaliação · Sem conta e sem envio de dados</footer>
  </>;
}
