import {multiplyDivide,parseExactDecimal,reduceRational,roundPositiveCentsHalfUp} from './decimal-exact';
import type {MachineOriginEvidence} from '../data/supabase';
export const isMachineSource=(version:string)=>version.startsWith('machine-estimate:')||version.startsWith('machine-origin:');
const money=(v:bigint)=>(v/100n).toString()+'.'+(v%100n).toString().padStart(2,'0');
/** Parâmetros congelados não comprovam aquisição nem manutenção efetiva. */
export function historicalMachineCandidate(data:MachineOriginEvidence,workspaceId:string,executionId:string){
 const o=data.origin;
 if(data.schema_version!=='l4-machine-origin-v1'||data.posting_allowed!==false||data.workspace_id!==workspaceId||
 data.execution_id!==executionId||!data.printer_matches||!o||!o.printer_id||!o.captured_at||
 o.purchase_price===null||o.lifetime_hours===null||data.actual_hours===null)return null;
 try{
  const price=parseExactDecimal(o.purchase_price),life=parseExactDecimal(o.lifetime_hours),
   hours=parseExactDecimal(data.actual_hours),maintenance=parseExactDecimal(o.maintenance_per_hour);
  if(life.numerator<=0n||hours.numerator<=0n)return null;
  const depreciation=multiplyDivide(price,hours,life);
  const upkeep=multiplyDivide(maintenance,hours,{numerator:1n,denominator:1n});
  const total=reduceRational({numerator:depreciation.numerator*upkeep.denominator+upkeep.numerator*depreciation.denominator,
   denominator:depreciation.denominator*upkeep.denominator});
  const cents=roundPositiveCentsHalfUp(total);
  return {amountBrl:money(cents),depreciationBrl:money(roundPositiveCentsHalfUp(depreciation)),maintenanceBrl:money(roundPositiveCentsHalfUp(upkeep)),
   sourceVersion:'machine-origin:'+JSON.stringify([executionId,o.printer_id,o.captured_at,o.purchase_price,o.lifetime_hours,o.maintenance_per_hour,data.actual_hours]),
   source:'Parâmetros congelados de '+o.printer_name+' em '+o.captured_at+' · '+data.actual_hours+' h registradas · depreciação + manutenção parametrizada (não comprovante de despesa)',
   importable:cents>0n};
 }catch{return null;}
}
