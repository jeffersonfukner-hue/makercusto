/**
 * L4 — reconciliação local e determinística de rateios por execução (P05/P06).
 * Sem efeitos de banco, sem distribuição automática de perdas ou preços presumidos.
 * Valores monetários e pesos são strings decimais; BigInt é a fonte exata.
 */
export type AllocationCategory =
 | 'model' | 'purge' | 'energy' | 'machine' | 'labor' | 'accessory' | 'loss' | 'rework' | 'other';
export type AllocationMethod = 'direct' | 'shared';
export type AllocationDestination = {
 outputId: string;
 /** Peso proporcional declarado (ex.: gramas de modelo ou minutos atribuíveis). */
 basis: string;
};
export type AllocationLine = {
 id: string;
 category: AllocationCategory;
 /** Custo global POSITIVO da categoria, em BRL, antes do fechamento em centavos. */
 amountBrl: string;
 source: string;
 sourceVersion: string;
 method: AllocationMethod;
 /** Explica a base e eventual uso de estimativa; é obrigatório em rateios compartilhados. */
 rationale: string;
 /** Quando method=direct, exatamente um destino; shared: no mínimo dois. */
 destinations: AllocationDestination[];
 /** A purga/perda já incluída no custo do modelo não pode ser adicionada novamente. */
 separatelyMeasured: boolean;
};
export type AllocationOutput = {
 id: string;
 name: string;
 /** Falhas e retrabalhos não são distribuídos automaticamente às peças boas. */
 outcome: 'good' | 'rejected' | 'rework';
 quantity: number;
};
export type AllocationRequest = {
 executionId: string;
 outputs: AllocationOutput[];
 lines: AllocationLine[];
};
export type AllocationSnapshot = {
 schemaVersion: 'l4-allocation-v1';
 executionId: string;
 currency: 'BRL';
 rounding: 'half-up-largest-remainder-id';
 status: 'reconciled' | 'pending';
 totalCents: string;
 outputTotals: {outputId: string; outcome: AllocationOutput['outcome']; totalCents: string}[];
 categoryTotals: {
  lineId: string;
  category: AllocationCategory;
  source: string;
  sourceVersion: string;
  method: AllocationMethod;
  rationale: string;
  originalAmountBrl: string;
  closedCents: string;
  allocations: {outputId: string; basis: string; cents: string; residualCent: boolean}[];
 }[];
};

/** Converte um decimal estrito, não negativo, sem usar Number. */
function decimal(value: string, label: string) {
 const v = value.trim();
 if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v) || v.length > 64) {
  throw new Error(label + ': informe decimal não negativo usando ponto, sem notação científica.');
 }
 const [integer, fraction = ''] = v.split('.');
 if (integer.length > 15 || fraction.length > 18) throw new Error(label + ': magnitude ou precisão não suportada.');
 const unit = 10n ** BigInt(fraction.length);
 return {numerator: BigInt(integer) * unit + BigInt(fraction || '0'), denominator: unit};
}
const centsHalfUp = (value: ReturnType<typeof decimal>) =>
 (value.numerator * 100n * 2n + value.denominator) / (2n * value.denominator);
const validId = (v: string) => Boolean(v && v.trim() === v && v.trim().length > 0);
const expectUnique = (xs: string[], label: string) => {
 if (new Set(xs).size !== xs.length || xs.some(x => !validId(x))) throw new Error(label + ': identificadores obrigatórios e únicos.');
};

/**
 * Custo de cada categoria é fechado UMA VEZ; depois os centavos são divididos
 * pelo maior resto, desempate lexical por ID do destino (P06-D).
 * Não calcula custo da energia, potência ou bobina: recebe custo de origem explícito.
 */
export function reconcilePrintAllocation(request: AllocationRequest): AllocationSnapshot {
 if (!validId(request.executionId)) throw new Error('Identificador da execução obrigatório.');
 if (!request.outputs.length || !request.lines.length) throw new Error('Informe saídas e custos de origem.');
 expectUnique(request.outputs.map(o => o.id), 'Saídas');
 expectUnique(request.lines.map(l => l.id), 'Categorias de custo');
 if (request.outputs.some(o => !o.name.trim() || !Number.isSafeInteger(o.quantity) || o.quantity < 1 ||
  !['good', 'rejected', 'rework'].includes(o.outcome))) throw new Error('Saída inválida: nome, estado e quantidade obrigatórios.');
 const outputIds = new Set(request.outputs.map(o => o.id));
 const totals = new Map(request.outputs.map(o => [o.id, 0n]));
 let total = 0n;
 const categoryTotals = request.lines.map(line => {
  if (!line.source.trim() || !line.sourceVersion.trim() || !line.category ||
      !['direct', 'shared'].includes(line.method) ||
      !['model','purge','energy','machine','labor','accessory','loss','rework','other'].includes(line.category)) {
   throw new Error('Categoria ' + line.id + ': origem, versão, natureza e método obrigatórios.');
  }
  if (line.category === 'purge' || line.category === 'loss') {
   if (!line.separatelyMeasured) throw new Error('Purga/perda não separada do modelo: risco de dupla contagem.');
  }
  if (line.method === 'shared' && !line.rationale.trim()) {
   throw new Error('Categoria ' + line.id + ': base compartilhada exige justificativa.');
  }
  if (line.destinations.length !== (line.method === 'direct' ? 1 : line.destinations.length) ||
      (line.method === 'shared' && line.destinations.length < 2) || !line.destinations.length) {
   throw new Error('Categoria ' + line.id + ': destinos incompatíveis com método.');
  }
  expectUnique(line.destinations.map(d => d.outputId), 'Destinos da categoria ' + line.id);
  if (line.destinations.some(d => !outputIds.has(d.outputId))) throw new Error('Destino não pertence à execução.');
  const amount = decimal(line.amountBrl, 'Custo da categoria ' + line.id);
  const cents = centsHalfUp(amount);
  const bases = line.destinations.map(d => decimal(d.basis, 'Base do destino ' + d.outputId));
  if (bases.some(b => b.numerator <= 0n)) throw new Error('Base deve ser positiva e explicitamente informada.');
  const denominator = bases.reduce((s,b) => s*b.denominator, 1n);
  const weights = bases.map(b => b.numerator*(denominator/b.denominator));
  const sum = weights.reduce((s,b) => s+b, 0n);
  const quotas = weights.map(w => ({floor: cents*w/sum, remainder: cents*w%sum}));
  let residual = cents - quotas.reduce((s,q) => s+q.floor, 0n);
  const order = quotas.map((q,i) => ({i, remainder:q.remainder, id:line.destinations[i].outputId}))
   .sort((a,b)=>a.remainder===b.remainder?a.id.localeCompare(b.id):a.remainder>b.remainder?-1:1);
  const extras = new Set<number>();
  for (const item of order) {
   if (residual <= 0n) break;
   extras.add(item.i);
   residual--;
  }
  const allocations = line.destinations.map((d,i) => {
   const value = quotas[i].floor + (extras.has(i)?1n:0n);
   totals.set(d.outputId, (totals.get(d.outputId)??0n)+value);
   return {outputId:d.outputId, basis:d.basis, cents:value.toString(), residualCent:extras.has(i)};
  });
  if (allocations.reduce((s,a)=>s+BigInt(a.cents),0n)!==cents) throw new Error('Falha de conciliação da categoria.');
  total+=cents;
  return {lineId:line.id,category:line.category,source:line.source,sourceVersion:line.sourceVersion,
   method:line.method,rationale:line.rationale,originalAmountBrl:line.amountBrl,
   closedCents:cents.toString(),allocations};
 });
 const outputTotals = request.outputs.map(o=>({outputId:o.id,outcome:o.outcome,totalCents:(totals.get(o.id)??0n).toString()}));
 if(outputTotals.reduce((s,o)=>s+BigInt(o.totalCents),0n)!==total) throw new Error('Falha de conciliação da execução.');
 return {schemaVersion:'l4-allocation-v1',executionId:request.executionId,currency:'BRL',
  rounding:'half-up-largest-remainder-id',status:'reconciled',totalCents:total.toString(),
  outputTotals,categoryTotals};
}
