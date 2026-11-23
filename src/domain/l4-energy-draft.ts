import {parseExactDecimal,reduceRational,roundPositiveCentsHalfUp,type Rational} from './decimal-exact';

export type EnergyInterval={
 id:string;startMs:number;endMs:number;
 phase:'heating'|'printing'|'pause'|'resume'|'unclassified';
 pauseCondition?:'heated'|'partially_heated'|'motors_on'|'standby'|'off'|'unknown';
 source:{kind:'measured';kwh:string;reference:string}|{kind:'maker_estimate'|'manufacturer_estimate';watts:string;reference:string}|{kind:'unknown'};
};
const zero:Rational={numerator:0n,denominator:1n};
const add=(a:Rational,b:Rational)=>reduceRational({numerator:a.numerator*b.denominator+b.numerator*a.denominator,denominator:a.denominator*b.denominator});
const mul=(a:Rational,b:Rational)=>reduceRational({numerator:a.numerator*b.numerator,denominator:a.denominator*b.denominator});
const serialize=(a:Rational)=>({numerator:a.numerator.toString(),denominator:a.denominator.toString()});

/** P07/P06: explicit nonoverlapping coverage; no posting or machine wear inference. */
export function prepareEnergyDraft(input:{
 executionId:string;startMs:number;endMs:number;intervals:EnergyInterval[];
 tariff:{brlPerKwh:string;reference:string;validFromMs:number;validUntilMs:number}|null;
 integralMeasurement?:{kwh:string;reference:string;startMs:number;endMs:number};
}){
 const {startMs,endMs}=input;
 const validTime=(t:number)=>Number.isSafeInteger(t)&&t>=0;
 if(!input.executionId.trim()||!validTime(startMs)||!validTime(endMs)||endMs<=startMs)throw new Error('Período da execução inválido.');
 const issues:string[]=[];
 const sorted=[...input.intervals].sort((a,b)=>a.startMs-b.startMs);
 let cursor=startMs,energy=zero,estimated=false,missing=false;
 const ids=new Set<string>();
 const details=sorted.map(i=>{
  if(!i.id.trim()||ids.has(i.id)||!validTime(i.startMs)||!validTime(i.endMs)||i.startMs<cursor||i.endMs<=i.startMs||i.endMs>endMs)throw new Error('Intervalo inválido, duplicado ou sobreposto.');
  ids.add(i.id);
  if(i.startMs>cursor){missing=true;issues.push('UNCOVERED_INTERVAL');}
  cursor=i.endMs;
  if(i.phase==='unclassified')issues.push('UNCLASSIFIED_PHASE');
  if(i.phase==='pause'&&(!i.pauseCondition||i.pauseCondition==='unknown'))issues.push('UNKNOWN_PAUSE_CONDITION');
  let value:Rational|null=null;
  if(i.source.kind==='unknown'){missing=true;issues.push('UNKNOWN_ENERGY');}
  else {
   if(!i.source.reference.trim())throw new Error('Fonte de energia obrigatória.');
   if(i.source.kind==='measured')value=parseExactDecimal(i.source.kwh);
   else {
    estimated=true;
    value=mul(parseExactDecimal(i.source.watts),{numerator:BigInt(i.endMs-i.startMs),denominator:3600000000n});
   }
   energy=add(energy,value);
  }
  return {...i,exactKwh:value===null?null:serialize(value)};
 });
 if(cursor<endMs){missing=true;issues.push('UNCOVERED_INTERVAL');}
 const integral=input.integralMeasurement;
 if(integral){
  if(integral.startMs!==startMs||integral.endMs!==endMs||!integral.reference.trim())throw new Error('Medição integral deve cobrir toda a execução.');
  energy=parseExactDecimal(integral.kwh);estimated=false;
 }
 const completeEnergy=Boolean(integral)||!missing;
 let cost:Rational|null=null;
 const tariff=input.tariff;
 if(!tariff)issues.push('MISSING_TARIFF');
 else{
  const rate=parseExactDecimal(tariff.brlPerKwh);
  if(!tariff.reference.trim()||!validTime(tariff.validFromMs)||!validTime(tariff.validUntilMs)||tariff.validFromMs>startMs||tariff.validUntilMs<endMs)issues.push('TARIFF_COVERAGE_MISSING');
  else if(completeEnergy)cost=mul(energy,rate);
 }
 return {schemaVersion:'l4-p07-energy-v1' as const,executionId:input.executionId,status:'pending_financial_close' as const,financialSnapshot:null,postingAllowed:false as const,
  startMs,endMs,intervals:details,tariff,integralMeasurement:integral??null,
  energySource:integral?'measured_integral':estimated?'contains_estimates':'measured_intervals',
  exactKwh:completeEnergy?serialize(energy):null,exactCost:cost===null?null:serialize(cost),
  categoryCents:cost===null?null:roundPositiveCentsHalfUp(cost).toString(),issues:[...new Set(issues)]};
}
