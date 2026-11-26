import {useId, type ReactNode} from 'react';

export function CalculatorHelp({label,children}: {label:string; children:ReactNode}) {
 const id=useId();
 return <span className="mc-help">
  <button type="button" aria-label={'Ajuda: '+label} aria-describedby={id} onClick={event=>event.currentTarget.focus()}
   onKeyDown={event=>{if(event.key==='Escape')event.currentTarget.blur();}}>ⓘ</button>
  <span className="mc-tooltip" role="tooltip" id={id}>{children}</span>
 </span>;
}

export function FieldWithHelp({label,help,children}:{
 label:string;help:ReactNode;children:(id:string)=>ReactNode;
}){
 const id=useId();
 return <div className="mc-field-with-help">
  <div className="mc-field-caption"><label htmlFor={id}>{label}</label><CalculatorHelp label={label}>{help}</CalculatorHelp></div>
  {children(id)}
 </div>;
}
