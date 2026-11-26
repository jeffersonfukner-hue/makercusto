import {prepareEnergyDraft,type EnergyInterval} from './l4-energy-draft';
import type {EnergyEvidence} from '../data/supabase';

/** P07 uses Brazilian civil dates for the workshop tariff; no default tariff. */
export type IntegralEnergyMeasurement={start:string;end:string;kwh:string;reference:string};
export function prepareRecordedEnergy(evidence:EnergyEvidence,start:string,end:string,measurement?:IntegralEnergyMeasurement){
 const startMs=Date.parse(start),endMs=Date.parse(end);
 // Explicit Brazil time offset for the current BR-only application.
 const bounds=(date:string)=>Date.parse(date+'T00:00:00-03:00');
 const applicable=evidence.tariffs.filter(t=>bounds(t.valid_from)<=startMs&&bounds(t.valid_until)>=endMs);
 const t=applicable.length===1?applicable[0]:null;
 const intervals:EnergyInterval[]=evidence.intervals.map(i=>{
  const reference=i.reference??'';
  const source:EnergyInterval['source']=i.source_kind==='unknown'?{kind:'unknown'}:
   i.source_kind==='measured'?{kind:'measured',kwh:i.kwh??'',reference}:
   {kind:i.source_kind,watts:i.watts??'',reference};
  return {id:i.id,startMs:Date.parse(i.start_at),endMs:Date.parse(i.end_at),phase:i.phase,pauseCondition:i.pause_condition??undefined,source};
 });
 return prepareEnergyDraft({executionId:evidence.execution_id,startMs,endMs,intervals,
  integralMeasurement:measurement?{startMs:Date.parse(measurement.start),endMs:Date.parse(measurement.end),kwh:measurement.kwh,reference:measurement.reference}:undefined,
  tariff:t?{brlPerKwh:t.price,reference:t.id+' — '+t.reference,validFromMs:bounds(t.valid_from),validUntilMs:bounds(t.valid_until)}:null});
}
