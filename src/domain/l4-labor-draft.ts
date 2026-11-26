import {parseExactDecimal,multiplyDivide,reduceRational,roundPositiveCentsHalfUp,type Rational} from './decimal-exact';
export type LaborActivity={id:string;activity:string;minutes:string;hourlyRate:string;reference:string;basis:'measured'|'estimated';serviceId?:string};
export const isLaborSource=(v:string)=>v.startsWith('labor-draft:')||v.startsWith('labor-evidence:');
/** Uma categoria por execução: soma as atividades antes de arredondar. */
export function laborCandidate(executionId:string,activities:LaborActivity[]){
 if(!executionId.trim()||activities.length===0)throw new Error('Informe execução e atividades.');
 const ids=new Set<string>(),refs=new Set<string>();
 let total:Rational={numerator:0n,denominator:1n};
 for(const a of activities){
  if(!a.id.trim()||ids.has(a.id)||!a.activity.trim()||!a.reference.trim()||!['measured','estimated'].includes(a.basis))throw new Error('Atividade duplicada ou origem incompleta.');
  const reference=a.reference.trim().toLowerCase();
  if(refs.has(reference))throw new Error('Referência de atividade repetida.');
  ids.add(a.id);refs.add(reference);
  const time=parseExactDecimal(a.minutes),rate=parseExactDecimal(a.hourlyRate);
  if(time.numerator<=0n||rate.numerator<=0n)throw new Error('Tempo e tarifa devem ser positivos; zero exige revisão explícita.');
  const cost=multiplyDivide(rate,time,{numerator:60n,denominator:1n});
  total=reduceRational({numerator:total.numerator*cost.denominator+cost.numerator*total.denominator,denominator:total.denominator*cost.denominator});
 }
 const cents=roundPositiveCentsHalfUp(total);
 return {amountBrl:(cents/100n).toString()+'.'+(cents%100n).toString().padStart(2,'0'),
  importable:cents>0n,sourceVersion:'labor-draft:'+JSON.stringify([executionId,activities]),
  source:'Mão de obra: '+activities.map(a=>a.activity+' ('+a.minutes+' min × R$ '+a.hourlyRate+'/h; '+a.basis+'; '+a.reference+')').join(' | ')+' · declaração local, não comprovante financeiro'};
}

/** A revisão utiliza a versão efetivamente consultada; nunca reconstitui evidência antiga. */
export function validateLaborRevision(draft:{evidenceId:string;priorId:string;key:string;minutes:string;hourlyRate:string;basis:LaborActivity['basis'];reason:string}){
 if(!draft.evidenceId.trim()||!draft.priorId.trim()||!draft.key.trim()||!['measured','estimated'].includes(draft.basis)||draft.reason.trim().length<3||draft.reason.trim().length>1000)throw new Error('Informe uma versão válida e o motivo da revisão (3 a 1000 caracteres).');
 for(const value of [draft.minutes,draft.hourlyRate]){
  const n=parseExactDecimal(value);
  if(n.numerator<=0n||n.numerator>1000000n*n.denominator||(n.numerator*1000000n)%n.denominator!==0n)throw new Error('Minutos e tarifa devem ser positivos, até 1.000.000 e com no máximo seis casas decimais.');
 }
 return {...draft,reason:draft.reason.trim()};
}
