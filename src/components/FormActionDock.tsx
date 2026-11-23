import type {ReactNode} from 'react';

type Props={
 title:string;
 subtitle?:string;
 children:ReactNode;
};

/** Barra de ações contextual: somente o formulário ativo a renderiza. */
export function FormActionDock({title,subtitle,children}:Props){
 return <div className="form-action-dock" role="group" aria-label={'Ações de '+title}>
  <div className="form-action-dock-inner">
   <div className="form-action-dock-context">
    <strong title={title}>{title}</strong>
    {subtitle&&<small>{subtitle}</small>}
   </div>
   <div className="form-action-dock-buttons">{children}</div>
  </div>
 </div>;
}
