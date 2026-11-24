import {reconcilePrintAllocation, type AllocationRequest, type AllocationSnapshot, type AllocationCategory} from './print-allocation';

/**
 * L4-F: preparação auditável, SEM postagem ou persistência, de um fechamento de
 * custos. Não confundir rateio aritmeticamente conciliado com custo industrial
 * final: preço de L3 tem 6 decimais e fontes adicionais podem estar ausentes.
 */
export type HistoricConsumptionSource = {
 consumption_id:string;
 confirmation_id:string;
 lot_id:string|null;
 cost_status:'known'|'estimated'|'unknown';
 model_g:string;
 purge_g:string;
 loss_g:string;
 unit_cost_snapshot:string|null;
};
export type FinancialDraftIssue = {
 code:'SOURCE_NOT_LOADED'|'UNKNOWN_LOT_COST'|'ESTIMATED_LOT_COST'|'HISTORICAL_PRECISION'
 |'UNALLOCATED_CONSUMPTION'|'DUPLICATE_CONSUMPTION'|'UNVERIFIED_MANUAL_SOURCE'|'COST_CATEGORY_UNREVIEWED'
 |'SOURCE_CATEGORY_MISMATCH'|'DUPLICATE_ENERGY_SOURCE';
 sourceId?:string;
 category?:AllocationCategory;
 description:string;
};
export type FinancialDraft = {
 schemaVersion:'l4-financial-draft-v1';
 executionId:string;
 status:'pending_financial_close';
 currency:'BRL';
 allocation:AllocationSnapshot;
 historicSourcesLoaded:boolean;
 expectedConsumptionCount:number;
 assignedConsumptionCount:number;
 issues:FinancialDraftIssue[];
 /** Bloqueio explícito: este tipo nunca pode conter um snapshot financeiro final. */
 financialSnapshot:null;
};

const historicKey=(id:string,category:'model'|'purge'|'loss')=>`historico:${id}:${category}`;
const positive=(decimal:string):boolean=>{
 const value=decimal.trim();
 if(!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) throw new Error('Massa histórica inválida: '+decimal);
 return /[1-9]/.test(value);
};

/**
 * Verifica a cobertura de categorias efetivamente consumidas, sem tomar preço
 * desconhecido como zero ou distribuir por adivinhação. NUNCA retorna 'final'.
 */
export function preparePrintFinancialDraft(input:{
 allocationRequest:AllocationRequest;
 historicalSources:HistoricConsumptionSource[]|null;
 /** Categorias adicionais a revisar; a oficina informa o que se aplica. */
 categoriesToReview?:AllocationCategory[];
}):FinancialDraft{
 const allocation=reconcilePrintAllocation(input.allocationRequest);
 const issues:FinancialDraftIssue[]=[];
 const sources=input.historicalSources;
 const included=new Set<string>();
 const energyLines=new Set<string>();
 for(const line of input.allocationRequest.lines){
  const version=line.sourceVersion;
  if(version.startsWith('historico:')){
   // A chave da confirmação só vale para a categoria realmente confirmada.
   // Não aceitar uma origem de modelo rotulada como energia ou purga.
   const match=/^historico:([^:]+):(model|purge|loss)$/.exec(version);
   if(!match||match[2]!==line.category){
    issues.push({code:'SOURCE_CATEGORY_MISMATCH',sourceId:version,category:line.category,
     description:'Origem histórica incompatível com a categoria declarada; revise antes do fechamento.'});
   }
   if(included.has(version)){
    issues.push({code:'DUPLICATE_CONSUMPTION',sourceId:version,
     description:'Origem histórica repetida na mesma categoria; verifique dupla apropriação.'});
   }
   included.add(version);
  }else{
   // Uma prévia P07 não é evidência financeira verificada pelo servidor.
   // Preservar o bloqueio de fechamento mesmo quando a prévia traz referência.
   issues.push({code:'UNVERIFIED_MANUAL_SOURCE',sourceId:line.id,category:line.category,
    description:version.startsWith('p07:')?
     'Prévia energética P07 ainda não foi verificada para fechamento financeiro.':
     'Custo manual precisa de comprovação de origem antes de fechar.'});
   if(version.startsWith('p07:')&&line.category!=='energy'){
    issues.push({code:'SOURCE_CATEGORY_MISMATCH',sourceId:version,category:line.category,
     description:'Origem P07 só pode representar a categoria energia.'});
   }
  }
  if(line.category==='energy'){
   energyLines.add(line.id);
  }
 }
 if(energyLines.size>1){
  issues.push({code:'DUPLICATE_ENERGY_SOURCE',category:'energy',
   description:'Mais de uma linha de energia na execução: risco de contabilização duplicada.'});
 }
 if(sources===null){
  issues.push({code:'SOURCE_NOT_LOADED',description:'Histórico de consumo não foi consultado ou falhou.'});
 }
 const expected=new Set<string>();
 const sourceIds=new Set<string>();
 for(const source of sources??[]){
  if(sourceIds.has(source.consumption_id))throw new Error('Confirmação de consumo repetida no histórico.');
  sourceIds.add(source.consumption_id);
  if(!source.confirmation_id||!source.consumption_id)throw new Error('Histórico sem identificação de confirmação.');
  let hasMass=false;
  for(const category of ['model','purge','loss'] as const){
   const grams=category==='model'?source.model_g:category==='purge'?source.purge_g:source.loss_g;
   if(!positive(grams))continue;
   hasMass=true;
   const key=historicKey(source.consumption_id,category);
   expected.add(key);
   if(!included.has(key)){
    issues.push({code:'UNALLOCATED_CONSUMPTION',sourceId:key,category,
     description:'Massa confirmada sem categoria correspondente na prévia.'});
   }
  }
  if(hasMass&&(!source.lot_id||source.unit_cost_snapshot===null||source.cost_status==='unknown')){
   issues.push({code:'UNKNOWN_LOT_COST',sourceId:source.consumption_id,
    description:'Consumo físico tem custo histórico desconhecido, não igual a zero.'});
  }else if(hasMass&&source.cost_status==='estimated'){
   issues.push({code:'ESTIMATED_LOT_COST',sourceId:source.consumption_id,
    description:'Custo da bobina é estimado, não comprovado por compra.'});
  }
  if(hasMass&&source.unit_cost_snapshot!==null){
   issues.push({code:'HISTORICAL_PRECISION',sourceId:source.consumption_id,
    description:'Preço de confirmação L3 possui apenas seis casas decimais; falta origem exata P06.'});
  }
 }
 for(const key of included){
  if(sources!==null&&!expected.has(key)){
   issues.push({code:'UNALLOCATED_CONSUMPTION',sourceId:key,
    description:'Categoria importada não corresponde a uma massa confirmada desta execução.'});
  }
 }
 const required=new Set(input.categoriesToReview??[]);
 for(const category of required){
  if(!input.allocationRequest.lines.some(l=>l.category===category)){
   issues.push({code:'COST_CATEGORY_UNREVIEWED',category,
    description:'Categoria declarada como relevante ainda não foi informada.'});
  }
 }
 return {
  schemaVersion:'l4-financial-draft-v1',executionId:input.allocationRequest.executionId,
  status:'pending_financial_close',currency:'BRL',
  allocation,historicSourcesLoaded:sources!==null,expectedConsumptionCount:expected.size,
  assignedConsumptionCount:[...expected].filter(k=>included.has(k)).length,
  issues,financialSnapshot:null
 };
}
