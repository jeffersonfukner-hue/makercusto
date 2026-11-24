import type {prepareRecordedEnergy} from './p07-recorded-energy';

type EnergyDraft=ReturnType<typeof prepareRecordedEnergy>;

/** Converte apenas prévia P07 íntegra para entrada manual P05; nunca contabiliza. */
export function energyAllocationCandidate(draft:EnergyDraft){
 if(draft.postingAllowed!==false||draft.status!=='pending_financial_close'||draft.financialSnapshot!==null||
    draft.categoryCents===null||draft.issues.length>0||!draft.tariff?.reference?.trim()||
    !draft.executionId.trim())return null;
 const cents=BigInt(draft.categoryCents);
 if(cents<=0n)return null;
 const sourceVersion='p07:'+draft.executionId+':'+draft.startMs+':'+draft.endMs+':'+
  draft.tariff.reference+':'+draft.intervals.map(i=>i.id).join(',');
 return {
  amountBrl:(cents/100n).toString()+'.'+(cents%100n).toString().padStart(2,'0'),
  source:'P07 '+draft.energySource+' · '+draft.tariff.reference+' · simulação sem contabilização',
  sourceVersion,
  estimated:draft.energySource==='contains_estimates'
 };
}
