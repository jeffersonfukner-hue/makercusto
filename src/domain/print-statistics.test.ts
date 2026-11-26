import {describe,expect,it} from 'vitest';
import {summarizePrints} from './print-statistics';

const now=new Date('2026-11-26T02:00:00Z');

describe('estatísticas da oficina',()=>{
 it('usa o dia de Brasília e inclui o primeiro dia do período',()=>{
  const prints=[
   {created_at:'2026-11-19T02:59:59Z',status:'completed',outputs:[{good:10,failed:0}]},
   {created_at:'2026-11-19T03:00:00Z',status:'completed',outputs:[{good:3,failed:1}]},
   {created_at:'2026-11-26T01:00:00Z',status:'cancelled',outputs:[{good:0,failed:2}]},
   {created_at:'2026-11-26T03:00:00Z',status:'completed',outputs:[{good:100,failed:0}]},
   {created_at:'inválida',status:'completed',outputs:[]}
  ];
  expect(summarizePrints(prints,7,now)).toEqual({
   registered:2,completed:1,good:3,rejected:3,confirmed:6,yieldRate:0.5
  });
  expect(summarizePrints(prints,30,now).registered).toBe(3);
 });
 it('distingue falta de peças confirmadas de aproveitamento igual a zero',()=>{
  const print={created_at:'2026-11-25T10:00:00Z',status:'failed'};
  expect(summarizePrints([{...print,outputs:[]}],30,now).yieldRate).toBeNull();
  expect(summarizePrints([{...print,outputs:[{good:0,failed:1}]}],30,now).yieldRate).toBe(0);
 });
});
