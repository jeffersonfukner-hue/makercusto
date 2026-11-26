import {describe,it,expect} from 'vitest';
import {historicalMachineCandidate} from './l4-machine-origin';
import type {MachineOriginEvidence} from '../data/supabase';
const data:MachineOriginEvidence={schema_version:'l4-machine-origin-v1',workspace_id:'w',execution_id:'e',actual_hours:'3',posting_allowed:false,printer_matches:true,
 origin:{printer_id:'p',printer_name:'Máquina',purchase_price:'3500',lifetime_hours:'3000',maintenance_per_hour:'0.5',captured_at:'2026-11-24',author_id:'u'}};
describe('G11C — origem congelada da máquina',()=>{
 it('soma depreciação e manutenção antes de fechar centavos',()=>{
  expect(historicalMachineCandidate(data,'w','e')).toMatchObject({amountBrl:'5.00',depreciationBrl:'3.50',maintenanceBrl:'1.50',importable:true});
  expect(historicalMachineCandidate({...data,actual_hours:'1',origin:{...data.origin!,purchase_price:'0.004',lifetime_hours:'1',maintenance_per_hour:'0.004'}},'w','e')?.amountBrl).toBe('0.01');
 });
 it('não inventa origem ou duração ausente',()=>{
  expect(historicalMachineCandidate({...data,origin:null},'w','e')).toBeNull();
  expect(historicalMachineCandidate({...data,actual_hours:null},'w','e')).toBeNull();
 });
 it('bloqueia oficina ou equipamento incompatível',()=>{
  expect(historicalMachineCandidate(data,'other','e')).toBeNull();
  expect(historicalMachineCandidate({...data,printer_matches:false},'w','e')).toBeNull();
 });
 it('distingue zero calculado de desconhecido, sem importar zero',()=>{
  expect(historicalMachineCandidate({...data,origin:{...data.origin!,purchase_price:'0',maintenance_per_hour:'0'}},'w','e')).toMatchObject({amountBrl:'0.00',importable:false});
 });
});
