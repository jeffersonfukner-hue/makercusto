import {multiplyDivide,parseExactDecimal,roundPositiveCentsHalfUp} from './decimal-exact';
import type {PrintRecord,StoredPrinter} from '../data/supabase';

/** Estimativa explícita com ficha ATUAL da máquina, nunca origem histórica. */
export function machineCostCandidate(print:PrintRecord,printer:StoredPrinter|null){
 if(!printer||printer.id!==print.printer_id||!print.id.trim())return null;
 const {purchase_price:price,lifetime_hours:life}=printer;
 const hours=print.actual_hours;
 if(price===null||life===null||hours===null||![price,life,hours].every(Number.isFinite)||
    price<=0||life<=0||hours<=0)return null;
 // O cadastro atual retorna Number; não alegar precisão histórica P06.
 try{
  const exact=multiplyDivide(parseExactDecimal(String(price)),parseExactDecimal(String(hours)),parseExactDecimal(String(life)));
  const cents=roundPositiveCentsHalfUp(exact);
  if(cents<=0n)return null;
  return {amountBrl:(cents/100n).toString()+'.'+(cents%100n).toString().padStart(2,'0'),
   sourceVersion:'machine-estimate:'+JSON.stringify([print.id,printer.id,price,life,hours]),
   source:'Estimativa de máquina '+printer.name+' — ficha atual R$ '+price+' / '+life+' h × '+hours+' h registradas; sem origem histórica congelada'};
 }catch{return null;}
}
