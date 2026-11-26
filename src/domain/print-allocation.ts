import {parseExactDecimal,roundPositiveCentsHalfUp,reduceRational,type Rational} from './decimal-exact';
/**
 * L4 — reconciliação local e determinística de rateios por execução (P05/P06).
 * Sem efeitos de banco, sem distribuição automática de perdas ou preços presumidos.
 * Valores monetários e pesos são strings decimais; BigInt é a fonte exata.
 */
export type AllocationCategory =
 | 'model' | 'purge' | 'energy' | 'machine' | 'labor' | 'accessory' | 'tool' | 'loss' | 'rework' | 'other';
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

function decimal(value:string,label:string){
 try{return parseExactDecimal(value);}
 catch(e){throw new Error(label+': '+(e as Error).message);}
}
const zero:Rational={numerator:0n,denominator:1n};
const add=(a:Rational,b:Rational)=>reduceRational({
 numerator:a.numerator*b.denominator+b.numerator*a.denominator,
 denominator:a.denominator*b.denominator
});

function splitCents(total:bigint,weights:{id:string;weight:Rational}[]){
 const weightSum=weights.reduce((sum,{weight})=>add(sum,weight),zero);
 const quotas=weights.map(({id,weight})=>{
  const numerator=total*weight.numerator*weightSum.denominator;
  const denominator=weightSum.numerator===0n?1n:weight.denominator*weightSum.numerator;
  return {id,cents:numerator/denominator,remainder:numerator%denominator,denominator,residualCent:false};
 });
 let residual=total-quotas.reduce((sum,quota)=>sum+quota.cents,0n);
 quotas.sort((a,b)=>{
  const left=a.remainder*b.denominator,right=b.remainder*a.denominator;
  return left===right?a.id.localeCompare(b.id):left>right?-1:1;
 });
 for(const quota of quotas){
  if(residual===0n)break;
  quota.cents++;quota.residualCent=true;residual--;
 }
 if(residual!==0n)throw new Error('Centavos residuais não conciliados.');
 return quotas;
}

type Contribution={lineId:string;outputId:string;weight:Rational};

function closeCategory(contributions:Contribution[]){
 const byOutput=new Map<string,Contribution[]>();
 for(const item of contributions){
  const group=byOutput.get(item.outputId)??[];
  group.push(item);byOutput.set(item.outputId,group);
 }
 const weights=[...byOutput].map(([id,group])=>({id,weight:group.reduce((sum,item)=>add(sum,item.weight),zero)}));
 const total=roundPositiveCentsHalfUp(weights.reduce((sum,{weight})=>add(sum,weight),zero));
 return splitCents(total,weights).flatMap(output=>{
  const group=byOutput.get(output.id)!;
  return splitCents(output.cents,group.map(({lineId,weight})=>({id:lineId,weight}))).map(line=>({
   lineId:line.id,outputId:output.id,cents:line.cents,
   residualCent:group.filter(item=>item.weight.numerator>0n).length<=1?output.residualCent&&line.cents>0n:line.residualCent
  }));
 });
}
const validId = (v: string) => Boolean(v && v.trim() === v && v.trim().length > 0);
const expectUnique = (xs: string[], label: string) => {
 if (new Set(xs).size !== xs.length || xs.some(x => !validId(x))) throw new Error(label + ': identificadores obrigatórios e únicos.');
};

/**
 * Custo de cada categoria é fechado UMA VEZ; depois os centavos são divididos
 * pelos maiores restos entre os destinos e detalha a parcela por fonte (P06-D).
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
 const groups=new Map<AllocationCategory,Contribution[]>();
 const prepared = request.lines.map(line => {
  if (!line.source.trim() || !line.sourceVersion.trim() || !line.category ||
      !['direct', 'shared'].includes(line.method) ||
      !['model','purge','energy','machine','labor','accessory','tool','loss','rework','other'].includes(line.category)) {
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
  const bases = line.destinations.map(d => decimal(d.basis, 'Base do destino ' + d.outputId));
  if (bases.some(b => b.numerator <= 0n)) throw new Error('Base deve ser positiva e explicitamente informada.');
  const weightSum=bases.reduce(add,zero);
  const group=groups.get(line.category)??[];
  for(const [i,{outputId}] of line.destinations.entries()){
   const basis=bases[i];
   group.push({lineId:line.id,outputId,weight:reduceRational({
    numerator:amount.numerator*basis.numerator*weightSum.denominator,
    denominator:amount.denominator*basis.denominator*weightSum.numerator
   })});
  }
  groups.set(line.category,group);
  return line;
 });
 const allocationsByLine=new Map<string,ReturnType<typeof closeCategory>>();
 for(const contributions of groups.values()){
  for(const allocation of closeCategory(contributions)){
   const list=allocationsByLine.get(allocation.lineId)??[];
   list.push(allocation);allocationsByLine.set(allocation.lineId,list);
  }
 }
 const categoryTotals=prepared.map(line=>{
  const distributed=allocationsByLine.get(line.id)!;
  let cents=0n;
  const allocations=line.destinations.map(destination=>{
   const value=distributed.find(item=>item.outputId===destination.outputId)!;
   totals.set(destination.outputId,(totals.get(destination.outputId)??0n)+value.cents);
   cents+=value.cents;
   return {...destination,cents:value.cents.toString(),residualCent:value.residualCent};
  });
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
