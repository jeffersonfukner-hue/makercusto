import {describe, expect, it} from 'vitest';
import {reconcilePrintAllocation, type AllocationRequest, type AllocationLine} from './print-allocation';

const outputs: AllocationRequest['outputs'] = [
 {id:'guirlanda',name:'Guirlanda',outcome:'good',quantity:1},
 {id:'estrela-grande',name:'Estrela grande',outcome:'good',quantity:1},
 {id:'estrela-pequena',name:'Estrela pequena',outcome:'good',quantity:1}
];
const line=(patch:Partial<AllocationLine>={}):AllocationLine=>({
 id:'energia',category:'energy',amountBrl:'10.00',source:'medição da mesa',
 sourceVersion:'leitura-1',method:'shared',rationale:'Massa como proxy explicitamente declarada',
 destinations:[{outputId:'guirlanda',basis:'1'},{outputId:'estrela-grande',basis:'1'},{outputId:'estrela-pequena',basis:'1'}],
 separatelyMeasured:false,...patch
});
const request=(lines:AllocationLine[]):AllocationRequest=>({executionId:'mesa-001',outputs,lines});
describe('L4 — rateio homologado P05 e precisão P06',()=>{
 it('fecha R$10,00 com maior resto e desempate por ID estável, independentemente da ordem',()=>{
  const a=reconcilePrintAllocation(request([line()]));
  expect(a.totalCents).toBe('1000');
  expect(Object.fromEntries(a.outputTotals.map(x=>[x.outputId,x.totalCents]))).toEqual({
   guirlanda:'333','estrela-grande':'334','estrela-pequena':'333'
  });
  const b=reconcilePrintAllocation(request([line({destinations:[...line().destinations].reverse()})]));
  expect(Object.fromEntries(a.outputTotals.map(x=>[x.outputId,x.totalCents])))
   .toEqual(Object.fromEntries(b.outputTotals.map(x=>[x.outputId,x.totalCents])));
  expect(a.categoryTotals[0].allocations.filter(x=>x.residualCent)).toHaveLength(1);
 });
 it('distribui filamento diretamente, energia com base declarada, sem dividir igualmente por peça',()=>{
  const a=reconcilePrintAllocation(request([
   line({id:'modelo-guirlanda',category:'model',amountBrl:'6.20',source:'bobina PETG',method:'direct',
    rationale:'massa atribuída à guirlanda',destinations:[{outputId:'guirlanda',basis:'1'}]}),
   line({id:'modelo-grande',category:'model',amountBrl:'2.10',source:'bobina PETG',method:'direct',
    rationale:'massa atribuída à estrela',destinations:[{outputId:'estrela-grande',basis:'1'}]}),
   line({id:'modelo-pequena',category:'model',amountBrl:'0.80',source:'bobina PETG',method:'direct',
    rationale:'massa atribuída à estrela',destinations:[{outputId:'estrela-pequena',basis:'1'}]}),
   line({id:'energia',amountBrl:'1.00',destinations:[
    {outputId:'guirlanda',basis:'60'},{outputId:'estrela-grande',basis:'30'},{outputId:'estrela-pequena',basis:'10'}]})
  ]));
  expect(a.outputTotals.map(x=>x.totalCents)).toEqual(['680','240','90']);
  expect(a.totalCents).toBe('1010');
  expect(a.categoryTotals.reduce((s,x)=>s+BigInt(x.closedCents),0n)).toBe(1010n);
 });
 it('fecha metade do centavo em half-up sem arredondamento antecipado',()=>{
  const a=reconcilePrintAllocation(request([line({amountBrl:'1.235',method:'direct',
   destinations:[{outputId:'guirlanda',basis:'1'}]})]));
  expect(a.totalCents).toBe('124');
 });
 it('mantém falha isolada e não repassa automaticamente custo às peças boas',()=>{
  const failure:AllocationRequest['outputs'][number]={id:'rejeitada',name:'Teste com falha',outcome:'rejected',quantity:1};
  const a=reconcilePrintAllocation({executionId:'mesa-002',outputs:[...outputs,failure],lines:[
   line({id:'perda',category:'loss',amountBrl:'1.50',method:'direct',rationale:'falha identificada',
    destinations:[{outputId:'rejeitada',basis:'1'}],separatelyMeasured:true})
  ]});
  expect(a.outputTotals.find(x=>x.outputId==='rejeitada')?.totalCents).toBe('150');
  expect(a.outputTotals.filter(x=>x.outcome==='good').every(x=>x.totalCents==='0')).toBe(true);
 });
 it('bloqueia dupla contagem de purga/perda e rateios sem origem, base ou justificativa',()=>{
  expect(()=>reconcilePrintAllocation(request([line({category:'purge'})]))).toThrow(/dupla contagem/);
  expect(()=>reconcilePrintAllocation(request([line({rationale:'  '})]))).toThrow(/justificativa/);
  expect(()=>reconcilePrintAllocation(request([line({source:''})]))).toThrow(/origem/);
  expect(()=>reconcilePrintAllocation(request([line({destinations:[
   {outputId:'guirlanda',basis:'0'},{outputId:'estrela-pequena',basis:'1'}]})]))).toThrow(/positiva/);
  expect(()=>reconcilePrintAllocation(request([line({destinations:[
   {outputId:'guirlanda',basis:'1'},{outputId:'inexistente',basis:'1'}]})]))).toThrow(/não pertence/);
  expect(()=>reconcilePrintAllocation(request([line({destinations:[
   {outputId:'guirlanda',basis:'1'},{outputId:'guirlanda',basis:'1'}]})]))).toThrow(/únicos/);
 });
 it('recusa entrada numérica inválida e preserva exatamente centavos em quantias pequenas',()=>{
  for(const amount of ['-1','1e3','NaN','1,20','1.','12345678901234567890.00']){
   expect(()=>reconcilePrintAllocation(request([line({amountBrl:amount})]))).toThrow();
  }
  const a=reconcilePrintAllocation(request([line({amountBrl:'0.01',destinations:[
   {outputId:'guirlanda',basis:'0.0001'},{outputId:'estrela-grande',basis:'0.0001'},
   {outputId:'estrela-pequena',basis:'0.0001'}]})]));
  expect(a.outputTotals.map(x=>x.totalCents)).toEqual(['0','1','0']);
 });
 it('rejeita categorias duplicadas, método direto com múltiplos destinos e saída sem quantidade',()=>{
  expect(()=>reconcilePrintAllocation(request([line(),line()]))).toThrow(/identificadores/);
  expect(()=>reconcilePrintAllocation(request([line({method:'direct'})]))).toThrow(/incompatíveis/);
  expect(()=>reconcilePrintAllocation({...request([line()]),outputs:[...outputs,{id:'xyz',name:'X',outcome:'good',quantity:0}]})).toThrow(/Saída inválida/);
 });
});
