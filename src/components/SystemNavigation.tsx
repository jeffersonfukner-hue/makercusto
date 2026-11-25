import {useEffect,useRef,useState,type ReactNode} from 'react';

export type SystemSection='overview'|'products'|'assemblies'|'materials'|'prints'|'orders'|'customers'|'suppliers'|'calculator'|'printers'|'workshop'|'library'|'tips';
export type ProductTab='all'|'parts';
export type OverviewTab='general'|'activities'|'pending';
type Props={
 authenticated:boolean;workspaceName:string;email:string;section:SystemSection;
 productTab:ProductTab;onProductTab:(tab:ProductTab)=>void;
 overviewTab:OverviewTab;onOverviewTab:(tab:OverviewTab)=>void;
 onNavigate:(section:SystemSection)=>void;onLogout:()=>void;children:ReactNode
};
const menu=[
 {label:'Visão geral',symbol:'▦',section:'overview'},
 {label:'Calculadora de custos',symbol:'◷',section:'calculator'},
 {label:'Produtos',symbol:'▣',section:'products'},
 {label:'Impressoras',symbol:'▤',section:'printers'},
 {label:'Filamentos',symbol:'◈',section:'materials'},
 {label:'Impressões',symbol:'▧',section:'prints'},
 {label:'Pedidos',symbol:'▤',section:'orders'},
 {label:'Clientes',symbol:'▣',section:'customers'},
 {label:'Fornecedores',symbol:'◇',section:'suppliers'},
 {label:'Conjuntos',symbol:'◇',section:'assemblies'},
 {label:'Oficina',symbol:'⚙',section:'workshop'},
 {label:'Biblioteca STL',symbol:'▥',section:'library'},
 {label:'Dicas de impressão',symbol:'◇',section:'tips'}
] as const;
const groups=[
 {label:'Comercial',sections:['orders','customers']},
 {label:'Produção',sections:['prints','products','assemblies']},
 {label:'Oficina',sections:['workshop','printers','materials','suppliers']},
 {label:'Recursos',sections:['library','tips']}
] as const;
const overviewShortcutSections=['calculator','orders','library','tips'] as const;
const overviewShortcuts=overviewShortcutSections.map(section=>menu.find(item=>item.section===section)!);

export function SystemNavigation({authenticated,workspaceName,email,section,productTab,onProductTab,overviewTab,onOverviewTab,onNavigate,onLogout,children}:Props){
 const [open,setOpen]=useState(false);
 const [activeGroup,setActiveGroup]=useState('');
 const groupToggle=useRef<HTMLButtonElement|null>(null);
 const menuButton=useRef<HTMLButtonElement>(null);
 const stickyHeader=useRef<HTMLDivElement>(null);

 useEffect(()=>{setOpen(false);setActiveGroup('');},[section]);
 useEffect(()=>{
  if(!open&&!activeGroup)return;
  const close=(event:KeyboardEvent)=>{
   if(event.key!=='Escape')return;
   if(activeGroup){setActiveGroup('');groupToggle.current?.focus();}
   else{setOpen(false);menuButton.current?.focus();}
  };
  const closeOutside=(event:PointerEvent)=>{
   if(event.target instanceof Node&&!stickyHeader.current?.contains(event.target)){setOpen(false);setActiveGroup('');}
  };
  window.addEventListener('keydown',close);
  document.addEventListener('pointerdown',closeOutside);
  return()=>{
   window.removeEventListener('keydown',close);
   document.removeEventListener('pointerdown',closeOutside);
  };
 },[open,activeGroup]);
 if(!authenticated)return <>{children}</>;
 const title=section==='printers'?'Impressoras':section==='workshop'?'Oficina':section==='library'?'Biblioteca STL':section==='tips'?'Dicas de impressão':section==='overview'?'Visão geral':section==='calculator'?'Calculadora de Produto':section==='prints'?'Impressões da oficina':section==='orders'?'Pedidos e vendas':section==='customers'?'Clientes':section==='suppliers'?'Fornecedores':section==='materials'?'Materiais e filamentos':'Produtos e componentes';
 const navigate=(next:SystemSection)=>{onNavigate(next);setOpen(false);setActiveGroup('');};
 const destination=(id:SystemSection)=>{
  const item=menu.find(entry=>entry.section===id)!;
  const label=id==='workshop'?'Configurações da oficina':item.label;
  return <button key={id} type="button" className={id===section?'system-nav-active':''}
   aria-current={id===section?'page':undefined} onClick={()=>navigate(id)}><span aria-hidden="true">{item.symbol}</span>{label}</button>;
 };
 return <div className={'system-shell system-top-navigation'+(section==='calculator'?' system-calculator':'')}>
  <div ref={stickyHeader} className="system-sticky-header">
  <header className="system-topbar">
   <div className="system-brand"><span className="system-logo" aria-hidden="true">M</span><span><strong>MakerCusto</strong><small>Sistema da oficina</small></span></div>
   <button ref={menuButton} className="system-mobile-menu" type="button" aria-label="Abrir menu do sistema" aria-expanded={open} aria-controls="system-main-menu" onClick={()=>{setOpen(v=>!v);setActiveGroup('');}}>☰</button>
   <div className="system-topbar-center"><span className="system-workshop-name">{workspaceName}</span><span className="system-test-badge">Ambiente de teste</span></div>
   <div className="system-account"><span className="system-email" title={email}>{email}</span><span className="system-avatar" aria-hidden="true">{email.trim().slice(0,1).toUpperCase()||'U'}</span><button type="button" onClick={onLogout}>Sair</button></div>
  </header>
   <nav id="system-main-menu" className={'system-horizontal-menu'+(open?' mobile-open':'')} aria-label="Módulos do MakerCusto">
    {destination('overview')}
    {destination('calculator')}
    {groups.map(({label,sections},index)=>{
     const expanded=activeGroup===label;
     const id='system-menu-group-'+index;
     return <div className="system-nav-group" key={label}>
      <button type="button" aria-controls={id} aria-expanded={expanded}
       className={sections.some(item=>item===section)?'system-nav-active':''}
       onClick={event=>{groupToggle.current=event.currentTarget;setActiveGroup(expanded?'':label);}}>
       {label}<span aria-hidden="true">▾</span>
      </button>
      <div className="system-nav-submenu" id={id} hidden={!expanded}>
       {expanded&&sections.map(destination)}
      </div>
     </div>;
    })}
   </nav>
  </div>
  <div className="system-frame">
   <div className="system-content">
    <div className="system-section-header">
     <div>{section!=='calculator'&&<p className="system-breadcrumb">MakerCusto / {section==='overview'?'Visão geral':section==='materials'?'Materiais':section==='prints'?'Impressões':title}</p>}<h1>{title}</h1>
      {section!=='calculator'&&<p>{section==='overview'?'Cadastros, indicadores e próximos passos.':section==='materials'?'Cadastre bobinas reais e consulte o saldo de material.':section==='prints'?'Registre execuções e confirme consumos incrementais.':section==='products'||section==='assemblies'?'Produtos fabricados, peças e conjuntos da sua oficina.':'Área da oficina.'}</p>}</div>
     {section==='overview'&&overviewTab==='general'&&<nav className="overview-shortcuts" aria-label="Acesso rápido">
      {overviewShortcuts.map(item=><button key={item.section} type="button" onClick={()=>navigate(item.section)}>
       <span aria-hidden="true">{item.symbol}</span>{item.label}
      </button>)}
     </nav>}
    </div>
    {section!=='calculator'&&<div className="system-tabs" role="navigation" aria-label={'Abas de '+title}>
     {section==='overview'&&([
      {id:'general',label:'Visão geral'},
      {id:'activities',label:'Atividades'},
      {id:'pending',label:'Pendências'}
     ] as const).map(tab=><button key={tab.id} type="button" className={overviewTab===tab.id?'system-tab-active':''}
      aria-current={overviewTab===tab.id?'page':undefined} onClick={()=>onOverviewTab(tab.id)}>{tab.label}</button>)}
     {(section==='products'||section==='assemblies')&&<>
      <button type="button" className={section==='products'&&productTab==='all'?'system-tab-active':''} aria-current={section==='products'&&productTab==='all'?'page':undefined} onClick={()=>{onProductTab('all');navigate('products');}}>Todos os produtos</button>
      <button type="button" className={section==='products'&&productTab==='parts'?'system-tab-active':''} aria-current={section==='products'&&productTab==='parts'?'page':undefined} onClick={()=>{onProductTab('parts');navigate('products');}}>Peças</button>
      <button type="button" className={section==='assemblies'?'system-tab-active':''} aria-current={section==='assemblies'?'page':undefined} onClick={()=>navigate('assemblies')}>Conjuntos</button>
      <button type="button" disabled title="Biblioteca STL em desenvolvimento">Biblioteca STL <small>Em breve</small></button>
     </>}
     {section==='orders'&&<button type="button" aria-current="page" className="system-tab-active">Histórico</button>}
     {section==='prints'&&<button type="button" aria-current="page" className="system-tab-active">Execuções</button>}
     {section==='materials'&&<button type="button" aria-current="page" className="system-tab-active">Bobinas existentes</button>}
    </div>}
    <div className="system-module-body">{children}</div>
    <footer className="system-footer">MakerCusto · Dados da oficina no Supabase · Ambiente em desenvolvimento</footer>
   </div>
  </div>
 </div>;
}
