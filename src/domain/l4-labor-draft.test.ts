import {describe,it,expect} from 'vitest';
import {laborCandidate,validateLaborRevision,type LaborActivity} from './l4-labor-draft';
const a:LaborActivity={id:'1',activity:'Acabamento',minutes:'15',hourlyRate:'20',reference:'registro-1',basis:'measured'};
describe('L4-G12A — mão de obra',()=>{
 it('calcula tempo de trabalho e não tempo da impressora',()=>expect(laborCandidate('p',[a]).amountBrl).toBe('5.00'));
 it('soma antes de arredondar',()=>expect(laborCandidate('p',[{...a,minutes:'1',hourlyRate:'0.24'},{...a,id:'2',reference:'registro-2',minutes:'1',hourlyRate:'0.24'}]).amountBrl).toBe('0.01'));
 it('rejeita tempo ou tarifa zero e referência ausente',()=>{
  expect(()=>laborCandidate('p',[{...a,minutes:'0'}])).toThrow();
  expect(()=>laborCandidate('p',[{...a,hourlyRate:'0'}])).toThrow();
  expect(()=>laborCandidate('p',[{...a,reference:''}])).toThrow();
 });
 it('rejeita duplicidade da referência mesmo com outro ID',()=>expect(()=>laborCandidate('p',[a,{...a,id:'2'}])).toThrow(/repetida/));
});

describe('L4-G12D — revisão de mão de obra',()=>{
 const draft={evidenceId:'original',priorId:'v2',key:'request',minutes:'12.125',hourlyRate:'25.50',basis:'measured' as const,reason:' Conferência '};
 it('preserva a versão e chave e normaliza justificativa',()=>expect(validateLaborRevision(draft)).toEqual({...draft,reason:'Conferência'}));
 it('rejeita versão ausente e justificativa curta',()=>{expect(()=>validateLaborRevision({...draft,priorId:''})).toThrow();expect(()=>validateLaborRevision({...draft,reason:' x '})).toThrow();});
 it('rejeita zero, valor acima do limite e precisão incompatível',()=>{for(const minutes of ['0','1000001','1.0000001'])expect(()=>validateLaborRevision({...draft,minutes})).toThrow();});
 it('recalcula o valor vigente sem somar o original',()=>expect(laborCandidate('p',[{...a,minutes:'12',hourlyRate:'25'}]).amountBrl).toBe('5.00'));
});
