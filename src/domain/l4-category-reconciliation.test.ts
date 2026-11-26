import {describe,expect,it} from 'vitest';
import {reconcileExactMaterialCategories,type SourceAssignment} from './l4-category-reconciliation';
import type {ExactOrigin} from './l4-exact-origin';
import type {AllocationOutput} from './print-allocation';

const outputs:AllocationOutput[]=[
 {id:'guirlanda',name:'Guirlanda',outcome:'good',quantity:1},
 {id:'estrela-grande',name:'Estrela grande',outcome:'good',quantity:1},
 {id:'estrela-pequena',name:'Estrela pequena',outcome:'good',quantity:1},
 {id:'rejeito',name:'Peça rejeitada',outcome:'rejected',quantity:1}
];
type Source=ExactOrigin&{purchase_line_id?:string|null};
const origin=(consumption_id:string,amount:string|null,mass:string,patch:Partial<Source>={}):Source=>({
 consumption_id,lot_id:'lot-'+consumption_id,
 status:amount===null?'unknown':'known',
 purchase_line_id:'purchase-'+consumption_id,
 original_total_cost_brl:amount,original_quantity_g:'1',
 model_g:mass,purge_g:'0',loss_g:'0',...patch
});
const assign=(consumptionId:string,category:'model'|'purge'|'loss',destinations:{outputId:string;weight:string}[],
 method:'direct'|'shared'='direct'):SourceAssignment=>({
 consumptionId,category,method,destinations,rationale:'Pesagem e proporcionalidade explícitas'
});
const run=(origins:Source[],assignments:SourceAssignment[],out=outputs)=>
 reconcileExactMaterialCategories({executionId:'mesa-001',outputs:out,origins,assignments});

describe('L4-G04 — fechamento exato POR CATEGORIA, ainda não persistido',()=>{
 it('soma origens subcentavo antes de fechar categoria, nunca fecha cada fonte isoladamente',()=>{
  const a=run([origin('a','0.004','1'),origin('b','0.004','1')],[
   assign('a','model',[{outputId:'guirlanda',weight:'1'}]),
   assign('b','model',[{outputId:'estrela-grande',weight:'1'}])
  ]);
  expect(a.categories[0]).toMatchObject({category:'model',exactNumerator:'1',
   exactDenominator:'125',closedCents:'1'});
  expect(a.totalCents).toBe('1');
  expect(a.outputTotals).toEqual([
   {outputId:'guirlanda',cents:'0'},
   {outputId:'estrela-grande',cents:'1'},
   {outputId:'estrela-pequena',cents:'0'},
   {outputId:'rejeito',cents:'0'}
  ]);
  expect(a.financialSnapshot).toBeNull();
  expect(a.status).toBe('pending_financial_close');
 });
 it('mesa de três peças distribui R$10,00 pela massa declarada e centavo residual por ID',()=>{
  const a=run([origin('energia-simulada','10.00','1')],[
   assign('energia-simulada','model',[
    {outputId:'guirlanda',weight:'1'},
    {outputId:'estrela-grande',weight:'1'},
    {outputId:'estrela-pequena',weight:'1'}],'shared')
  ]);
  expect(a.categories[0].closedCents).toBe('1000');
  expect(Object.fromEntries(a.outputTotals.map(x=>[x.outputId,x.cents]))).toEqual({
   guirlanda:'333','estrela-grande':'334','estrela-pequena':'333',rejeito:'0'
  });
  const b=run([origin('energia-simulada','10.00','1')],[
   assign('energia-simulada','model',[
    {outputId:'estrela-pequena',weight:'1'},
    {outputId:'estrela-grande',weight:'1'},
    {outputId:'guirlanda',weight:'1'}],'shared')
  ]);
  expect(b.outputTotals).toEqual(a.outputTotals);
 });
 it('preserva razão periódica e purga em categoria separada, sem dupla inclusão',()=>{
  const a=run([origin('filamento','1.00','1',{original_quantity_g:'3',
   purge_g:'1',loss_g:'1'})],[
   assign('filamento','model',[{outputId:'guirlanda',weight:'1'}]),
   assign('filamento','purge',[{outputId:'estrela-grande',weight:'1'}]),
   assign('filamento','loss',[{outputId:'rejeito',weight:'1'}])
  ]);
  expect(a.categories.map(x=>[x.category,x.exactNumerator,x.exactDenominator,x.closedCents]))
   .toEqual([['model','1','3','33'],['purge','1','3','33'],['loss','1','3','33']]);
  expect(a.totalCents).toBe('99');
  expect(a.expectedAssignments).toBe(3);
  expect(a.coveredAssignments).toBe(3);
 });
 it('a mesma categoria com lotes distintos mantém as origens separadas sem fechar cedo',()=>{
  const a=run([
   origin('branco','68.00','0.35',{original_quantity_g:'1000'}),
   origin('dourado','100.00','0.04',{original_quantity_g:'1000'})
  ],[
   assign('branco','model',[{outputId:'guirlanda',weight:'1'}]),
   assign('dourado','model',[{outputId:'estrela-grande',weight:'1'}])
  ]);
  // R$0,0238 + R$0,0040 = R$0,0278 => R$0,03 em UMA categoria.
  expect(a.categories[0]).toMatchObject({exactNumerator:'139',exactDenominator:'5000',
   closedCents:'3'});
  expect(a.categories[0].sources).toHaveLength(2);
  expect(a.totalCents).toBe('3');
 });
 it('não confunde desconhecido com zero e não apresenta subtotal como total definitivo',()=>{
  const a=run([origin('sem-custo',null,'1')],[
   assign('sem-custo','model',[{outputId:'guirlanda',weight:'1'}])
  ]);
  expect(a.totalCents).toBeNull();
  expect(a.issues.map(x=>x.code)).toContain('UNKNOWN_COST');
  expect(a.financialSnapshot).toBeNull();
  const b=run([origin('conhecido','2.00','1'),origin('sem-custo',null,'1')],[
   assign('conhecido','model',[{outputId:'guirlanda',weight:'1'}]),
   assign('sem-custo','model',[{outputId:'estrela-grande',weight:'1'}])
  ]);
  expect(b.categories[0].closedCents).toBe('200');
  expect(b.totalCents).toBeNull();
 });
 it('massa não atribuída mantém total pendente; rejeita referências repetidas ou inexistentes',()=>{
  const a=run([origin('a','2.00','1')],[]);
  expect(a.totalCents).toBeNull();
  expect(a.expectedAssignments).toBe(1);
  expect(a.coveredAssignments).toBe(0);
  expect(a.issues.map(x=>x.code)).toContain('MISSING_ASSIGNMENT');
  expect(()=>run([origin('a','2','1')],[
   assign('wrong','model',[{outputId:'guirlanda',weight:'1'}])
  ])).toThrow(/não corresponde/);
  expect(()=>run([origin('a','2','1')],[
   assign('a','model',[{outputId:'guirlanda',weight:'1'}]),
   assign('a','model',[{outputId:'estrela-grande',weight:'1'}])
  ])).toThrow(/repetidos/);
  expect(()=>run([origin('a','2','1'),origin('a','3','1')],[])).toThrow(/repetidos/);
 });
 it('não joga custo de perdas para peças boas e valida bases compartilhadas',()=>{
  const o=origin('loss','1.00','0',{loss_g:'1'});
  expect(()=>run([o],[assign('loss','loss',[{outputId:'guirlanda',weight:'1'}])]))
   .toThrow(/peças boas/);
  expect(()=>run([origin('a','2','1')],[
   assign('a','model',[{outputId:'guirlanda',weight:'0'},{outputId:'estrela-grande',weight:'1'}],'shared')
  ])).toThrow(/positiva/);
  expect(()=>run([origin('a','2','1')],[
   assign('a','model',[{outputId:'não-existe',weight:'1'}])
  ])).toThrow(/fora da execução/);
 });
 it('marcadores de custo estimado/sem compra nunca habilitam snapshot definitivo',()=>{
  const result=run([
   origin('estimated','1','1',{status:'estimated'}),
   origin('no-purchase','1','1',{purchase_line_id:null})
  ],[
   assign('estimated','model',[{outputId:'guirlanda',weight:'1'}]),
   assign('no-purchase','model',[{outputId:'estrela-grande',weight:'1'}])
  ]);
  expect(result.issues.map(x=>x.code)).toContain('ESTIMATED_COST');
  expect(result.issues.map(x=>x.code)).toContain('MISSING_PURCHASE_EVIDENCE');
  expect(result.financialSnapshot).toBeNull();
  expect(result.status).toBe('pending_financial_close');
 });
});
