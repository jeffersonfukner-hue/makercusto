import type {ReactNode} from 'react';

type Props={
 title:string;
 subtitle?:string;
 metrics?:{label:string;value:string}[];
 children:ReactNode;
};

/** Barra de ações contextual: somente o formulário ativo a renderiza. */
export function FormActionDock({title,subtitle,metrics,children}:Props){
 return <div className="form-action-dock" role="group" aria-label={'Ações de '+title}>
  <div className="form-action-dock-inner">
   <div className="form-action-dock-context">
    <strong title={title}>{title}</strong>
    {subtitle&&<small>{subtitle}</small>}
   </div>
   {metrics&&<div className="mc-dock-metrics">{metrics.map(metric=><div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}</div>}
   <div className="form-action-dock-buttons">{children}</div>
  </div>
 </div>;
}
