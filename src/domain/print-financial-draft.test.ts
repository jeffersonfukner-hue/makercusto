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
 it('não inventa massa em campos de origem inválidos',()=>{
  expect(()=>preparePrintFinancialDraft({allocationRequest:request([model]),
   historicalSources:[source({model_g:'NaN'})]})).toThrow(/Massa histórica inválida/);
 });
});
