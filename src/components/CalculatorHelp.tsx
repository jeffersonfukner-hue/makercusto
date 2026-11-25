import {useId, type ReactNode} from 'react';

export function CalculatorHelp({label,children}: {label:string; children:ReactNode}) {
 const id=useId();
 return <span className="mc-help">
  <button type="button" aria-label={'Ajuda: '+label} aria-describedby={id} onClick={event=>event.currentTarget.focus()}
   onKeyDown={event=>{if(event.key==='Escape')event.currentTarget.blur();}}>ⓘ</button>
  <span className="mc-tooltip" role="tooltip" id={id}>{children}</span>
 </span>;
}
