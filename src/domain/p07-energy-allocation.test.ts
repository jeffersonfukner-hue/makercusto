import {describe,expect,it} from 'vitest';
import {prepareEnergyDraft} from './l4-energy-draft';
import {energyAllocationCandidate} from './p07-energy-allocation';

const base=()=>prepareEnergyDraft({
 executionId:'exec-1',startMs:1000,endMs:3601000,
 intervals:[{id:'fase-1',startMs:1000,endMs:3601000,phase:'printing',
  source:{kind:'measured',kwh:'0.5',reference:'medidor'}}],
 tariff:{brlPerKwh:'1.03',reference:'tarifa-2026:conta',validFromMs:0,validUntilMs:4000000}
});

describe('L4 P07 → P05 sem postagem',()=>{
 it('importa custo fechado uma vez com origem e bloqueio financeiro preservados',()=>{
  const draft=base();const value=energyAllocationCandidate(draft);
  expect(value?.amountBrl).toBe('0.52');
  expect(value?.sourceVersion).toContain('exec-1');
  expect(value?.estimated).toBe(false);
  expect(draft.postingAllowed).toBe(false);
  expect(draft.financialSnapshot).toBeNull();
 });
 it('não transforma lacuna energética em custo zero',()=>{
  const draft=prepareEnergyDraft({executionId:'exec-1',startMs:1000,endMs:3601000,
   intervals:[],tariff:{brlPerKwh:'1.03',reference:'conta',validFromMs:0,validUntilMs:4000000}});
  expect(energyAllocationCandidate(draft)).toBeNull();
 });
 it('não importa fase não classificada ainda que haja custo calculado',()=>{
  const draft=base();
  expect(energyAllocationCandidate({...draft,issues:['UNCLASSIFIED_PHASE']})).toBeNull();
 });
 it('identifica estimativa explicitamente e recusa valores zero',()=>{
  const estimated=prepareEnergyDraft({executionId:'exec-1',startMs:1000,endMs:3601000,
   intervals:[{id:'fase-1',startMs:1000,endMs:3601000,phase:'printing',
    source:{kind:'maker_estimate',watts:'900',reference:'cadastro da impressora'}}],
   tariff:{brlPerKwh:'1.03',reference:'conta',validFromMs:0,validUntilMs:4000000}});
  expect(energyAllocationCandidate(estimated)?.estimated).toBe(true);
  expect(energyAllocationCandidate({...base(),categoryCents:'0'})).toBeNull();
 });
});
