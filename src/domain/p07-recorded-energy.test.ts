import {describe,expect,it} from 'vitest';
import {prepareRecordedEnergy} from './p07-recorded-energy';
import type {EnergyEvidence} from '../data/supabase';
const start='2026-11-23T10:00:00-03:00',end='2026-11-23T11:00:00-03:00';
const evidence:EnergyEvidence={workspace_id:'w',execution_id:'p',printer_id:'printer',current_average_watts:'900',start_at:start,end_at:end,posting_allowed:false,
 tariffs:[{id:'t',name:'Novembro',price:'1.03',valid_from:'2026-11-01',valid_until:'2026-12-01',reference:'conta'}],
 intervals:[{id:'i',start_at:start,end_at:end,phase:'printing',pause_condition:null,source_kind:'measured',reference:'medidor',kwh:'0.5',watts:null}]};
describe('persisted P07 evidence',()=>{
 it('uses measured energy and historical tariff, not current machine watts',()=>{
  const result=prepareRecordedEnergy(evidence,start,end);
  expect(result.categoryCents).toBe('52');
  expect(result.tariff?.reference).toBe('t — conta');
  expect(result.postingAllowed).toBe(false);
 });
 it('does not choose a tariff without full period coverage',()=>{
  expect(prepareRecordedEnergy({...evidence,tariffs:[]},start,end).categoryCents).toBeNull();
  expect(prepareRecordedEnergy({...evidence,tariffs:[{...evidence.tariffs[0],valid_until:'2026-11-23'}]},start,end).categoryCents).toBeNull();
  expect(prepareRecordedEnergy({...evidence,tariffs:[...evidence.tariffs,{...evidence.tariffs[0],id:'duplicate'}]},start,end).categoryCents).toBeNull();
 });
 it('does not fill missing phases with the current printer estimate',()=>{
  expect(prepareRecordedEnergy({...evidence,intervals:[]},start,end).categoryCents).toBeNull();
 });
});

describe('medição integral P07',()=>{
 it('substitui o consumo por fase sem somar duas vezes',()=>{
  const result=prepareRecordedEnergy(evidence,start,end,{start,end,kwh:'0.91',reference:'medidor integral'});
  expect(result.categoryCents).toBe('94');
  expect(result.energySource).toBe('measured_integral');
  expect(result.postingAllowed).toBe(false);
  expect(result.intervals).toHaveLength(1);
 });
 it('rejeita período divergente e referência ausente',()=>{
  expect(()=>prepareRecordedEnergy(evidence,start,end,{start,end:'2026-11-23T10:59:00-03:00',kwh:'0.91',reference:'medidor'})).toThrow();
  expect(()=>prepareRecordedEnergy(evidence,start,end,{start,end,kwh:'0.91',reference:' '})).toThrow();
 });
 it('conserva lacunas de classificação mesmo quando existe medição integral',()=>{
  const result=prepareRecordedEnergy({...evidence,intervals:[]},start,end,{start,end,kwh:'0.91',reference:'medidor'});
  expect(result.categoryCents).toBe('94');
  expect(result.issues).toContain('UNCOVERED_INTERVAL');
 });
});
