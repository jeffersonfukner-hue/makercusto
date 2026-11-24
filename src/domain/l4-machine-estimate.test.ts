import {describe,it,expect} from 'vitest';
import {machineCostCandidate} from './l4-machine-estimate';
import type {PrintRecord,StoredPrinter} from '../data/supabase';
const printer:StoredPrinter={id:'p',workspace_id:'w',model_id:null,name:'Máquina',purchase_price:3500,average_watts:null,lifetime_hours:3000,active:true};
const print:PrintRecord={id:'e',status:'completed',printer_id:'p',printer_name:'Máquina',planned_hours:12,actual_hours:3,notes:null,created_at:'',outputs:[]};
describe('G11A — custo indicativo da máquina',()=>{
 it('usa horas registradas e ficha atual, com centavos exatos a partir dos números disponíveis',()=>{
  expect(machineCostCandidate(print,printer)?.amountBrl).toBe('3.50');
  expect(machineCostCandidate(print,printer)?.source).toContain('sem origem histórica');
 });
 it('não substitui tempo real ausente pelo planejado',()=>{
  expect(machineCostCandidate({...print,actual_hours:null},printer)).toBeNull();
 });
 it('não usa outra máquina nem parâmetros ausentes ou inválidos',()=>{
  expect(machineCostCandidate(print,{...printer,id:'outra'})).toBeNull();
  expect(machineCostCandidate(print,{...printer,lifetime_hours:0})).toBeNull();
  expect(machineCostCandidate(print,{...printer,purchase_price:null})).toBeNull();
 });
 it('muda a identidade da estimativa quando muda a fonte',()=>{
  expect(machineCostCandidate(print,printer)?.sourceVersion).not.toBe(machineCostCandidate({...print,actual_hours:4},printer)?.sourceVersion);
 });
});
