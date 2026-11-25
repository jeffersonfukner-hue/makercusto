import type {ReactNode} from 'react';

export type DurationDraft={hours:string;minutes:string};
export const emptyDuration:DurationDraft={hours:'',minutes:''};

export function splitPrintDuration(hours:number):DurationDraft {
 const minutes=Math.round(hours*60);
 if(!Number.isFinite(minutes))return emptyDuration;
 return {hours:String(Math.floor(minutes/60)),minutes:String(minutes%60)};
}

export function printDurationInHours({hours,minutes}:DurationDraft):number|null {
 if(hours===''&&minutes==='')return null;
 const wholeHours=Number(hours), wholeMinutes=Number(minutes);
 if(!Number.isSafeInteger(wholeHours)||wholeHours<0||!Number.isInteger(wholeMinutes)||wholeMinutes<0||wholeMinutes>59)return NaN;
 return wholeHours+wholeMinutes/60;
}

export function PrintDurationFields({label,value,onChange,children}:{
 label:string;value:DurationDraft;onChange:(value:DurationDraft)=>void;children?:ReactNode;
}){
 return <fieldset className="mc-print-duration">
  <legend>{label}</legend>
  <div className="mc-print-duration-fields">
   <label>Horas<input type="number" inputMode="numeric" min="0" step="1" value={value.hours}
    onChange={event=>onChange({...value,hours:event.target.value})}/></label>
   <label>Minutos<input type="number" inputMode="numeric" min="0" max="59" step="1" value={value.minutes}
    onChange={event=>onChange({...value,minutes:event.target.value})}/></label>
  </div>
  {children}
 </fieldset>;
}
