import {useEffect,useState,type ReactNode} from 'react';

export type SystemSection='overview'|'products'|'assemblies'|'calculator';
export type ProductTab='all'|'parts';
type Props={
 authenticated:boolean;workspaceName:string;email:string;section:SystemSection;
 productTab:ProductTab;onProductTab:(tab:ProductTab)=>void;
 onNavigate:(section:SystemSection)=>void;onLogout:()=>void;children:ReactNode
};
const menu=[
 {label:'Início',symbol:'▦',section:'overview'},
 {label:'Produtos',symbol:'▣',section:'products'},
 {label:'Impressões',symbol:'▤',section:null},
 {label:'Materiais',symbol:'◈',section:null},
 {label:'Estoque',symbol:'▥',section:null},
 {label:'Custos',symbol:'◷',section:'calculator'},
 {label:'Relatórios',symbol:'▧',section:null},
 {label:'Configurações',symbol:'⚙',section:null}
] as const;
export function SystemNavigation({authenticated,workspaceName,email,section,productTab,onProductTab,onNavigate,onLogout,children}:Props){
 const [open,setOpen]=useState(false);
 const [collapsed,setCollapsed]=useState(false);
 useEffect(()=>{setOpen(false);},[section]);
 useEffect(()=>{
  if(!open)return;
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
  window.addEventListener('keydown',close);
  return()=>window.removeEventListener('keydown',close);
 },[open]);
 if(!authenticated)return <>{children}</>;
 const title=section==='overview'?'Visão geral da oficina':section==='calculator'?'Custos e precificação':'Produtos e componentes';
 const navigate=(next:SystemSection)=>{onNavigate(next);setOpen(false);};
 return <div className={'system-shell'+(collapsed?' is-collapsed':'')}>
  <header className="system-topbar">
   <div className="system-brand"><span className="system-logo" aria-hidden="true">M</span><span><strong>MakerCusto</strong><small>Sistema da oficina</small></span></div>
   <button className="system-mobile-menu" type="button" aria-label="Abrir menu do sistema" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button>
   <div className="system-topbar-center"><span className="system-workshop-name">{workspaceName}</span><span className="system-test-badge">Ambiente de teste</span></div>
   <div className="system-account"><span className="system-email" title={email}>{email}</span><span className="system-avatar" aria-hidden="true">{email.trim().slice(0,1).toUpperCase()||'U'}</span><button type="button" onClick={onLogout}>Sair</button></div>
  </header>
  <div className="system-frame">
   {open&&<button className="system-backdrop" type="button" aria-label="Fechar menu do sistema" onClick={()=>setOpen(false)}/>}
   <aside className={'system-sidebar'+(open?' mobile-open':'')} aria-label="Menu lateral do MakerCusto">
    <div className="system-sidebar-top"><span>MENU PRINCIPAL</span><button type="button" className="system-collapse-button" aria-label={collapsed?'Expandir menu lateral':'Recolher menu lateral'} onClick={()=>setCollapsed(v=>!v)}>{collapsed?'»':'«'}</button></div>
    <nav aria-label="Módulos do MakerCusto">
     {menu.map(item=><button key={item.label} type="button" disabled={!item.section} title={!item.section?'Módulo em desenvolvimento':item.label} className={item.section===section?'system-nav-active':''} aria-current={item.section===section?'page':undefined}
      onClick={()=>item.section&&navigate(item.section)}><span className="system-nav-icon" aria-hidden="true">{item.symbol}</span><span className="system-nav-text">{item.label}</span>{!item.section&&<span className="system-soon">Em breve</span>}</button>)}
    </nav>
    <div className="system-sidebar-bottom"><span className="system-nav-icon" aria-hidden="true">◈</span><span className="system-nav-text">Oficina conectada</span></div>
   </aside>
   <div className="system-content">
    <div className="system-section-header">
     <div><p className="system-breadcrumb">MakerCusto / {section==='overview'?'Início':section==='calculator'?'Custos':'Produtos'}</p><h1>{title}</h1>
      <p>{section==='overview'?'Cadastros, indicadores e próximos passos.':section==='calculator'?'Simule custos e confira os parâmetros de produção.':'Produtos fabricados, peças e conjuntos da sua oficina.'}</p></div>
     {section==='overview'&&<button className="system-primary-link" type="button" onClick={()=>navigate('assemblies')}>+ Novo conjunto</button>}
    </div>
    <div className="system-tabs" role="navigation" aria-label={'Abas de '+title}>
     {section==='overview'&&<button className="system-tab-active" aria-current="page" type="button">Visão geral</button>}
     {(section==='products'||section==='assemblies')&&<>
      <button type="button" className={section==='products'&&productTab==='all'?'system-tab-active':''} aria-current={section==='products'&&productTab==='all'?'page':undefined} onClick={()=>{onProductTab('all');navigate('products');}}>Todos os produtos</button>
      <button type="button" className={section==='products'&&productTab==='parts'?'system-tab-active':''} aria-current={section==='products'&&productTab==='parts'?'page':undefined} onClick={()=>{onProductTab('parts');navigate('products');}}>Peças</button>
      <button type="button" className={section==='assemblies'?'system-tab-active':''} aria-current={section==='assemblies'?'page':undefined} onClick={()=>navigate('assemblies')}>Conjuntos</button>
      <button type="button" disabled title="Biblioteca STL em desenvolvimento">Biblioteca STL <small>Em breve</small></button>
     </>}
     {section==='calculator'&&<><button type="button" aria-current="page" className="system-tab-active">Calculadora</button><button type="button" disabled>Histórico <small>Em breve</small></button></>}
    </div>
    <div className="system-module-body">{children}</div>
    <footer className="system-footer">MakerCusto · Dados da oficina no Supabase · Ambiente em desenvolvimento</footer>
   </div>
  </div>
 </div>;
}
