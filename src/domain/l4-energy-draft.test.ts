import {describe,it,expect} from 'vitest';
import {prepareEnergyDraft,type EnergyInterval} from './l4-energy-draft';
const minute=60000;
const intervals:EnergyInterval[]=[
 {id:'heat',startMs:0,endMs:10*minute,phase:'heating',source:{kind:'maker_estimate',watts:'600',reference:'teste'}},
 {id:'print',startMs:10*minute,endMs:250*minute,phase:'printing',source:{kind:'maker_estimate',watts:'150',reference:'teste'}},
 {id:'pause',startMs:250*minute,endMs:280*minute,phase:'pause',pauseCondition:'heated',source:{kind:'maker_estimate',watts:'80',reference:'teste'}},
 {id:'resume',startMs:280*minute,endMs:292*minute,phase:'resume',source:{kind:'maker_estimate',watts:'500',reference:'teste'}}
];
const input={executionId:'test',startMs:0,endMs:292*minute,intervals,tariff:{brlPerKwh:'1.03',reference:'tarifa teste',validFromMs:0,validUntilMs:292*minute}};
describe('P07 energy draft',()=>{
 it('reproduces approved phases and rounds only once',()=>{
  const result=prepareEnergyDraft(input);
  expect(result.exactKwh).toEqual({numerator:'21',denominator:'25'});
  expect(result.categoryCents).toBe('87');
  expect(result.energySource).toBe('contains_estimates');
  expect(result.financialSnapshot).toBeNull();
  expect(result.postingAllowed).toBe(false);
 });
 it('integral measurement replaces estimates',()=>{
  const result=prepareEnergyDraft({...input,integralMeasurement:{startMs:0,endMs:input.endMs,kwh:'0.91',reference:'medidor'}});
  expect(result.exactKwh).toEqual({numerator:'91',denominator:'100'});
  expect(result.categoryCents).toBe('94');
  expect(result.energySource).toBe('measured_integral');
 });
 it('keeps gaps and unknown costs unresolved',()=>{
  expect(prepareEnergyDraft({...input,intervals:intervals.slice(1)}).categoryCents).toBeNull();
  expect(prepareEnergyDraft({...input,tariff:null}).categoryCents).toBeNull();
  expect(prepareEnergyDraft({...input,tariff:{...input.tariff,validUntilMs:1}}).categoryCents).toBeNull();
 });
 it('rejects overlapping phases and partial integral coverage',()=>{
  expect(()=>prepareEnergyDraft({...input,intervals:[...intervals,{...intervals[0],id:'overlap'}]})).toThrow();
  expect(()=>prepareEnergyDraft({...input,integralMeasurement:{startMs:1,endMs:input.endMs,kwh:'1',reference:'medidor'}})).toThrow();
 });
 it('does not assume zero for an unknown pause',()=>{
  const unknown=intervals.map(i=>i.phase==='pause'?{...i,pauseCondition:'unknown' as const,source:{kind:'unknown' as const}}:i);
  const result=prepareEnergyDraft({...input,intervals:unknown});
  expect(result.categoryCents).toBeNull();
  expect(result.issues).toContain('UNKNOWN_PAUSE_CONDITION');
 });
});
