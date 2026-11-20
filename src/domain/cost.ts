export interface CostInput { grams:number; pricePerKg:number; hours:number; averageWatts:number; pricePerKwh:number; printerPrice:number; lifetimeHours:number; quantity:number; accessoryPerUnit:number; assemblyMinutesPerUnit:number; laborPerHour:number; salePrice:number; }
export interface CostResult {material:number;energy:number;depreciation:number;accessories:number;assembly:number;lotCost:number;unitCost:number;lotRevenue:number;grossProfit:number;marginPercent:number;markupPercent:number;}
export function calculateCost(input: CostInput): CostResult {
  const fields = Object.values(input);
  if (fields.some(v=>!Number.isFinite(v)||v<0)||!Number.isInteger(input.quantity)||input.quantity<1||input.lifetimeHours<=0) throw new Error('Confira os parâmetros: valores não negativos, quantidade inteira e vida útil maior que zero.');
  const material=input.grams*input.pricePerKg/1000;
  const energy=input.averageWatts/1000*input.hours*input.pricePerKwh;
  const depreciation=input.printerPrice/input.lifetimeHours*input.hours;
  const accessories=input.accessoryPerUnit*input.quantity;
  const assembly=input.assemblyMinutesPerUnit/60*input.laborPerHour*input.quantity;
  const lotCost=material+energy+depreciation+accessories+assembly;
  const unitCost=lotCost/input.quantity;
  const lotRevenue=input.salePrice*input.quantity;
  const grossProfit=lotRevenue-lotCost;
  return {material,energy,depreciation,accessories,assembly,lotCost,unitCost,lotRevenue,grossProfit,marginPercent:lotRevenue?grossProfit/lotRevenue*100:0,markupPercent:lotCost?grossProfit/lotCost*100:0};
}
export const referenceCase:CostInput={grams:151.58,pricePerKg:100,hours:11+14/60,averageWatts:150,pricePerKwh:1.03,printerPrice:3500,lifetimeHours:3000,quantity:20,accessoryPerUnit:.35,assemblyMinutesPerUnit:2,laborPerHour:20,salePrice:7.9};
