import {describe,expect,it} from 'vitest';
import {preparePrintFinancialDraft,type HistoricConsumptionSource} from './print-financial-draft';
import type {AllocationRequest} from './print-allocation';
const source=(overrides:Partial<HistoricConsumptionSource>={}):HistoricConsumptionSource=>({
 consumption_id:'cons-01',confirmation_id:'confirmation-01',lot_id:'lot-01',
 cost_status:'known',model_g:'15.000',purge_g:'2.000',loss_g:'0',
 unit_cost_snapshot:'0.064000',...overrides
});
const request=(versions:string[]=[]):AllocationRequest=>({
 executionId:'print-01',
 outputs:[{id:'guirlanda',name:'Guirlanda',outcome:'good',quantity:1},
  {id:'estrela',name:'Estrela',outcome:'good',quantity:1}],
 lines:versions.map((version,i)=>({
  id:'line-'+i,category:version.endsWith(':purge')?'purge' as const:'model' as const,
  amountBrl:'0.960000',source:'consumo confirmado',sourceVersion:version,
  method:'shared' as const,rationale:'Massa de modelo declarada (estimativa)',
  separatelyMeasured:true,
  destinations:[{outputId:'guirlanda',basis:'2'},{outputId:'estrela',basis:'1'}]
 }))
});
const model='historico:cons-01:model',purge='historico:cons-01:purge';
describe('L4 — diagnóstico de fechamento financeiro, não persistido',()=>{
 it('nunca transforma rateio matemático em snapshot financeiro final',()=>{
  const result=preparePrintFinancialDraft({allocationRequest:request([model,purge]),
   historicalSources:[source()]});
  expect(result.status).toBe('pending_financial_close');
  expect(result.financialSnapshot).toBeNull();
  expect(result.expectedConsumptionCount).toBe(2);
  expect(result.assignedConsumptionCount).toBe(2);
  expect(result.issues.map(x=>x.code)).toContain('HISTORICAL_PRECISION');
  expect(result.allocation.totalCents).toBe('192');
 });
 it('impede classificação de preço desconhecido como zero',()=>{
  const result=preparePrintFinancialDraft({allocationRequest:request([model]),
   historicalSources:[source({unit_cost_snapshot:null,cost_status:'unknown'})]});
  expect(result.issues.map(x=>x.code)).toContain('UNKNOWN_LOT_COST');
  expect(result.issues.map(x=>x.code)).toContain('UNALLOCATED_CONSUMPTION');
 });
 it('registra custo estimado e categorias relevantes não declaradas',()=>{
  const result=preparePrintFinancialDraft({allocationRequest:request([model,purge]),
   historicalSources:[source({cost_status:'estimated'})],categoriesToReview:['energy','machine']});
  expect(result.issues.map(x=>x.code)).toContain('ESTIMATED_LOT_COST');
  expect(result.issues.filter(x=>x.code==='COST_CATEGORY_UNREVIEWED')).toHaveLength(2);
 });
 it('exige buscar fontes e não inventa zero para erro de consulta',()=>{
  const result=preparePrintFinancialDraft({allocationRequest:request([model]),historicalSources:null});
  expect(result.historicSourcesLoaded).toBe(false);
  expect(result.issues.map(x=>x.code)).toContain('SOURCE_NOT_LOADED');
  expect(result.financialSnapshot).toBeNull();
 });
 it('detecta categorias importadas repetidas e linhas alheias',()=>{
  const r=request([model,model,'historico:outra:model']);
  const result=preparePrintFinancialDraft({allocationRequest:r,historicalSources:[source()]});
  expect(result.issues.map(x=>x.code)).toContain('DUPLICATE_CONSUMPTION');
  expect(result.issues.filter(x=>x.code==='UNALLOCATED_CONSUMPTION')).toHaveLength(2);
 });
 it('identifica entrada manual sem fonte verificada',()=>{
  const r=request();
  r.lines.push({id:'energia',category:'energy',amountBrl:'3.00',
   source:'potência não medida',sourceVersion:'entrada-local-1',
   rationale:'massa como proxy declarada',method:'shared',separatelyMeasured:false,
   destinations:[{outputId:'guirlanda',basis:'2'},{outputId:'estrela',basis:'1'}]});
  const result=preparePrintFinancialDraft({allocationRequest:r,historicalSources:[source()]});
  expect(result.issues.map(x=>x.code)).toContain('UNVERIFIED_MANUAL_SOURCE');
  expect(result.status).toBe('pending_financial_close');
 });
 it('rejeita consumo histórico duplicado e mantém conciliação aritmética do motor',()=>{
  expect(()=>preparePrintFinancialDraft({allocationRequest:request([model]),
   historicalSources:[source(),source()]})).toThrow(/repetida/);
  const result=preparePrintFinancialDraft({allocationRequest:request([model]),historicalSources:[source()]});
  expect(result.allocation.categoryTotals[0].allocations.reduce((total,x)=>total+BigInt(x.cents),0n))
   .toBe(BigInt(result.allocation.totalCents));
 });
 it('sinaliza categoria incompatível com fonte histórica e mantém fechamento bloqueado',()=>{
  const r=request([model]);
  r.lines[0].category='energy';
  const result=preparePrintFinancialDraft({allocationRequest:r,historicalSources:[source()]});
  expect(result.issues.map(x=>x.code)).toContain('SOURCE_CATEGORY_MISMATCH');
  expect(result.financialSnapshot).toBeNull();
 });
 it('detecta duas linhas energéticas mesmo com versões P07 distintas',()=>{
  const r=request();
  for(const version of ['p07:print-01:version-a','p07:print-01:version-b']){
   r.lines.push({id:version,category:'energy',amountBrl:'1.23',source:'simulação P07',
    sourceVersion:version,rationale:'rateio por tempo declarado',method:'shared',
    separatelyMeasured:false,destinations:[{outputId:'guirlanda',basis:'2'},{outputId:'estrela',basis:'1'}]});
  }
  const result=preparePrintFinancialDraft({allocationRequest:r,historicalSources:[]});
  expect(result.issues.map(x=>x.code)).toContain('DUPLICATE_ENERGY_SOURCE');
  expect(result.issues.filter(x=>x.code==='UNVERIFIED_MANUAL_SOURCE')).toHaveLength(2);
  expect(result.financialSnapshot).toBeNull();
 });
 it('não aceita origem energética como material mesmo com referência P07',()=>{
  const r=request();
  r.lines.push({id:'energia-como-modelo',category:'model',amountBrl:'1.23',source:'P07',
   sourceVersion:'p07:print-01:sample',rationale:'',method:'direct',
   separatelyMeasured:false,destinations:[{outputId:'guirlanda',basis:'1'}]});
  const result=preparePrintFinancialDraft({allocationRequest:r,historicalSources:[]});
  expect(result.issues.map(x=>x.code)).toContain('SOURCE_CATEGORY_MISMATCH');
 });
 it('não conta categoria histórica trocada como cobertura válida',()=>{
  const r=request([model]);r.lines[0].category='energy';
  const result=preparePrintFinancialDraft({allocationRequest:r,historicalSources:[source()]});
  expect(result.assignedConsumptionCount).toBe(0);
 });
 it('distingue categoria não aplicável de zero sem comprovante e desconhecido',()=>{
  const result=preparePrintFinancialDraft({allocationRequest:request([model]),historicalSources:[source()],
   categoriesToReview:['machine','energy','labor'],categoryReviews:[
    {category:'machine',state:'not_applicable',reason:'Equipamento externo'},
    {category:'energy',state:'zero',reason:'Sem cobrança'},
    {category:'labor',state:'unknown',reason:''}
   ]});
  expect(result.issues.filter(x=>x.code==='COST_CATEGORY_UNREVIEWED').map(x=>x.category)).toEqual(['energy','labor']);
  expect(result.issues.filter(x=>x.code==='CATEGORY_REVIEW_UNVERIFIED')).toHaveLength(2);
  expect(result.financialSnapshot).toBeNull();
 });
 it('detecta declaração contraditória de categoria com custo',()=>{
  const result=preparePrintFinancialDraft({allocationRequest:request([model]),historicalSources:[source()],
   categoryReviews:[{category:'model',state:'zero',reason:'Alegado',reference:'doc-1'}]});
  expect(result.issues.map(x=>x.code)).toContain('CATEGORY_REVIEW_CONFLICT');
 });
 it('não inventa massa em campos de origem inválidos',()=>{
  expect(()=>preparePrintFinancialDraft({allocationRequest:request([model]),
   historicalSources:[source({model_g:'NaN'})]})).toThrow(/Massa histórica inválida/);
 });
});
