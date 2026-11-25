import type {ReactNode} from 'react';

export type DurationDraft={hours:string;minutes:string;seconds?:string};
export const emptyDuration:DurationDraft={hours:'',minutes:''};

export function splitPrintDuration(hours:number,includeSeconds=false):DurationDraft {
 if(includeSeconds&&Number.isFinite(hours)){
  const seconds=Math.round(hours*3600);
  return {hours:String(Math.floor(seconds/3600)),minutes:String(Math.floor(seconds/60)%60),seconds:String(seconds%60)};
 }
 const minutes=Math.round(hours*60);
 if(!Number.isFinite(minutes))return emptyDuration;
 return {hours:String(Math.floor(minutes/60)),minutes:String(minutes%60)};
}

export function printDurationInHours({hours,minutes,seconds=''}:DurationDraft):number|null {
 if(hours===''&&minutes===''&&seconds==='')return null;
 const wholeHours=Number(hours), wholeMinutes=Number(minutes), wholeSeconds=Number(seconds);
 if(!Number.isSafeInteger(wholeHours)||wholeHours<0||!Number.isInteger(wholeMinutes)||wholeMinutes<0||wholeMinutes>59||!Number.isInteger(wholeSeconds)||wholeSeconds<0||wholeSeconds>59)return NaN;
 return (wholeHours*3600+wholeMinutes*60+wholeSeconds)/3600;
}

export function PrintDurationFields({label,value,onChange,children,includeSeconds=false,disabled=false}:{
 label:string;value:DurationDraft;onChange:(value:DurationDraft)=>void;children?:ReactNode;includeSeconds?:boolean;disabled?:boolean;
}){
 return <fieldset className="mc-print-duration" disabled={disabled}>
  <legend>{label}</legend>
  <div className={includeSeconds?"mc-print-duration-fields mc-print-duration-seconds":"mc-print-duration-fields"}>
   <label><span>Horas</span><input type="number" inputMode="numeric" min="0" step="1" value={value.hours}
    onChange={event=>onChange({...value,hours:event.target.value})}/></label>
   <label><span>Minutos</span><input type="number" inputMode="numeric" min="0" max="59" step="1" value={value.minutes}
    onChange={event=>onChange({...value,minutes:event.target.value})}/></label>
   {includeSeconds&&<label><span>Segundos</span><input type="number" inputMode="numeric" min="0" max="59" step="1" value={value.seconds??''}
    onChange={event=>onChange({...value,seconds:event.target.value})}/></label>}
  </div>
  {children}
 </fieldset>;
}
