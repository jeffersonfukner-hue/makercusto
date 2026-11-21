import { useEffect, useState } from 'react';
import {AuthModal,PrinterModal,CatalogModal} from './components/Modals';
import {type Session,type StoredPrinter,type CatalogEntry,type PrinterDraft,sessionStore,signOut,loadPrinterModels,listWorkspaces,createWorkspace,listPrinters,insertPrinter,updateStoredPrinter,listCatalog,insertCatalog} from './data/supabase';
import { calculateCost, referenceCase, type CostInput, type MaterialLine } from './domain/cost';

const money = (value:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const count = (value:number) => value.toLocaleString('pt-BR',{maximumFractionDigits:2});
const numeric = (value:string) => value.trim() === '' ? NaN : Number(value);
const display = (value:number | undefined) => value !== undefined && Number.isFinite(value) ? value : '';
const normalize = (value:string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g,'');
const colors = ['Branco','Preto','Cinza','Prata','Azul','Azul-claro','Azul-marinho','Vermelho','Verde','Verde-claro','Amarelo','Laranja','Rosa','Roxo','Lilás','Marrom','Bege','Dourado','Cobre','Transparente','Natural'];
const types = ['PLA','PLA+','PETG','ABS','ASA','TPU','PA','PC','PVA','Outro'];
const brands = ['Anycubic','Bambu Lab','Creality','eSUN','Elegoo','Flashforge','Masterprint','Overture','Polymaker','Prusament','Sunlu','Voxelab'];
type Catalog = 'cor' | 'tipo' | 'marca';
const defaults:Record<Catalog,string[]> = {cor:colors,tipo:types,marca:brands};
const key = (catalog:Catalog) => 'makercusto:catalogo:'+catalog+':v1';
const unique = (values:string[]) => { const used=new Set<string>(); return values.map(v=>v.trim()).filter(v=>{const k=normalize(v);if(!k||used.has(k))return false; used.add(k);return true;});};
function readCatalog(catalog:Catalog):string[] {
 try { const value:unknown=JSON.parse(localStorage.getItem(key(catalog))||'[]');return Array.isArray(value)?unique(value.filter((v):v is string=>typeof v==='string').slice(0,100)):[]; }catch { return []; }
}
type PrinterProfile = {id:string;name:string;printerPrice:number;averageWatts:number;lifetimeHours:number;pricePerKwh:number};
const initialPrinter:PrinterProfile = {id:'example',name:'Anycubic Kobra X — custos ilustrativos',printerPrice:3500,averageWatts:150,lifetimeHours:3000,pricePerKwh:1.03};
type NumericKey = Exclude<keyof CostInput,'materials'>;
const fields:{key:NumericKey;label:string;step:string}[] = [
 {key:'hours',label:'Tempo de impressão (horas)',step:'0.01'},
 {key:'quantity',label:'Unidades finalizadas no lote',step:'1'},
 {key:'accessoryPerUnit',label:'Acessórios por unidade (R$)',step:'0.01'},
 {key:'assemblyMinutesPerUnit',label:'Montagem por unidade (min)',step:'0.1'},
 {key:'laborPerHour',label:'Mão de obra (R$/h)',step:'0.01'},
 {key:'salePrice',label:'Preço de venda por unidade (R$)',step:'0.01'}
];
type Unit = 'g' | 'kg';
type SimpleFilament = { quantity:number; quantityUnit:Unit; price:number; priceUnit:Unit };
const initialSimple:SimpleFilament = {quantity:151.58,quantityUnit:'g',price:100,priceUnit:'kg'};
const asGrams = (quantity:number,unit:Unit) => quantity * (unit==='kg'?1000:1);
const perKg = (price:number,unit:Unit) => price * (unit==='g'?1000:1);
const newDraft = ():MaterialLine => ({id:'',name:'',type:'PLA',brand:'',grams:NaN,wasteGrams:0,pricePerKg:0,packageQuantity:1,packageUnit:'kg',packagePrice:NaN});
const seeded = () => referenceCase.materials!.map(m=>({...m,type:'PETG',brand:'',packageQuantity:1,packageUnit:'kg' as const,packagePrice:100}));
const calculatedPackagePrice = (item:MaterialLine):number => item.packagePrice ?? item.pricePerKg*(item.packageQuantity??1)*(item.packageUnit==='g'?.001:1);
export default function App(){
 const [form,setForm]=useState<CostInput>(()=>({...referenceCase,materials:undefined}));
 const [printers,setPrinters]=useState<PrinterProfile[]>([initialPrinter]);
 const [printerId,setPrinterId]=useState('example');
 const [session,setSession]=useState<Session|null>(()=>sessionStore.get());
 const [authOpen,setAuthOpen]=useState(false);
 const [printerModal,setPrinterModal]=useState<'new'|'edit'|null>(null);
 const [models,setModels]=useState<CatalogEntry[]>([]);
 const [catalogModal,setCatalogModal]=useState<Catalog|null>(null);
 const [stored,setStored]=useState<StoredPrinter[]>([]);
 const [workspaceId,setWorkspaceId]=useState<string|null>(null);
 const [accountError,setAccountError]=useState('');
 const [cloudBusy,setCloudBusy]=useState(false);
 const profileFromDb=(p:StoredPrinter):PrinterProfile=>({
  id:p.id,name:p.name,printerPrice:p.purchase_price??initialPrinter.printerPrice,
  averageWatts:p.average_watts??initialPrinter.averageWatts,
  lifetimeHours:p.lifetime_hours??initialPrinter.lifetimeHours,
  pricePerKwh:initialPrinter.pricePerKwh
 });
 const loadAccount=async()=>{
  const current=sessionStore.get();setSession(current);
  if(!current){setWorkspaceId(null);setStored([]);setPrinters([initialPrinter]);setPrinterId('example');return;}
  setCloudBusy(true);setAccountError('');
  try{
   let ws=await listWorkspaces();
   if(!ws.length){const id=await createWorkspace('Minha oficina');ws=[{id,name:'Minha oficina',owner_id:current.user.id}];}
   const id=ws[0].id;setWorkspaceId(id);
   const items=await listPrinters(id);setStored(items);
   setPrinters([initialPrinter,...items.map(profileFromDb)]);
   if(items.length)setPrinterId(items[0].id);
  }catch(e){setAccountError('Não foi possível carregar sua oficina: '+(e as Error).message);}
  finally{setCloudBusy(false);}
 };
 useEffect(()=>{void loadPrinterModels().then(setModels).catch(()=>setAccountError('Catálogo de impressoras indisponível. Tente novamente mais tarde.'));if(sessionStore.get())void loadAccount();},[]);
 const savePrinter=async(data:PrinterDraft)=>{
  if(!sessionStore.get()||!workspaceId){
   const oldId=printerModal==='edit'&&printerId!=='example'?printerId:null;
   const id=oldId??'local-'+String(Date.now());
   const local:PrinterProfile={id,name:data.name,printerPrice:data.purchase_price??initialPrinter.printerPrice,averageWatts:data.average_watts??initialPrinter.averageWatts,lifetimeHours:data.lifetime_hours??initialPrinter.lifetimeHours,pricePerKwh:initialPrinter.pricePerKwh};
   setPrinters(prev=>[...prev.filter(p=>p.id!==id),local]);setPrinterId(id);return;
  }
  const old=stored.find(p=>p.id===printerId);
  const saved=(printerModal==='edit'&&old?await updateStoredPrinter(old.id,workspaceId,data):await insertPrinter(workspaceId,data))[0];
  if(!saved)throw new Error('O banco não confirmou o cadastro.');
  setStored(prev=>[...prev.filter(p=>p.id!==saved.id),saved]);
  setPrinters(prev=>[...prev.filter(p=>p.id!==saved.id),profileFromDb(saved)]);setPrinterId(saved.id);
 };
 const logout=async()=>{await signOut();setSession(null);setWorkspaceId(null);setStored([]);setPrinters([initialPrinter]);setPrinterId('example');};
 const activePrinter=printers.find(p=>p.id===printerId)??printers[0];
 const addPrinter=()=>setPrinterModal('new');
 const [advanced,setAdvanced]=useState(false);
 const [details,setDetails]=useState(false);
 const [simple,setSimple]=useState<SimpleFilament>(initialSimple);
 const [detailedMaterials,setDetailedMaterials]=useState<MaterialLine[]>(seeded);
 const [draft,setDraft]=useState<MaterialLine>(newDraft);
 const [editId,setEditId]=useState<string|null>(null);
 const [nextId,setNextId]=useState(1);
 const [errorDraft,setErrorDraft]=useState('');
 const [catalog,setCatalog]=useState<Record<Catalog,string[]>>(()=>({cor:readCatalog('cor'),tipo:readCatalog('tipo'),marca:readCatalog('marca')}));
 const catalogKinds:Record<Catalog,string>={tipo:'filament_type',cor:'color',marca:'filament_brand'};
 const catalogTitles:Record<Catalog,string>={tipo:'Tipo',cor:'Cor',marca:'Marca'};
 const saveCatalog=async(value:string)=>{
  const field=catalogModal;if(!field)return;
  if(list(field).some(x=>normalize(x)===normalize(value)))throw new Error('Este nome já está na lista.');
  if(sessionStore.get()&&workspaceId){
   const created=await insertCatalog(workspaceId,sessionStore.get()!.user.id,catalogKinds[field],value);
   if(!created[0])throw new Error('O cadastro não foi confirmado pelo banco.');
  }
  remember(field,value);
  if(field==='cor')setDraft(prev=>({...prev,name:value}));
  else if(field==='tipo')setDraft(prev=>({...prev,type:value}));
  else setDraft(prev=>({...prev,brand:value}));
 };
 useEffect(()=>{const load=async()=>{
  const lists=await Promise.allSettled([listCatalog('color'),listCatalog('filament_type'),listCatalog('filament_brand')]);
  const types:Array<Catalog>=['cor','tipo','marca'];
  lists.forEach((result,i)=>{
   if(result.status==='fulfilled')setCatalog(prev=>({...prev,[types[i]]:unique([...prev[types[i]],...result.value.map(x=>x.name)])}));
  });
 };void load();},[workspaceId]);
 const list = (c:Catalog) => unique([...defaults[c],...catalog[c]]);
 const remember=(c:Catalog,value:string)=>{
   if(!value.trim()||list(c).some(item=>normalize(item)===normalize(value)))return;
   const next=unique([...catalog[c],value]);
   setCatalog(old=>({...old,[c]:next}));
   try{localStorage.setItem(key(c),JSON.stringify(next));}catch{/* fallback em memória */}
 };
 const update=(field:NumericKey,value:string)=>setForm(prev=>({...prev,[field]:numeric(value)}));
 const setDraftText=(field:'name'|'brand'|'type',value:string)=>{setDraft(prev=>({...prev,[field]:value}));setErrorDraft('');};
 const setDraftNumber=(field:'grams'|'wasteGrams'|'packagePrice'|'packageQuantity',value:string)=>{setDraft(prev=>({...prev,[field]:numeric(value)}));setErrorDraft('');};
 const save=()=>{
  if(!draft.name.trim()||!draft.type?.trim()||!Number.isFinite(draft.grams)||draft.grams<=0||
     !Number.isFinite(draft.wasteGrams)||draft.wasteGrams<0||
     !Number.isFinite(draft.packageQuantity)||draft.packageQuantity!<=0||
     !Number.isFinite(draft.packagePrice)||draft.packagePrice!<0){
       setErrorDraft('Informe tipo, cor, embalagem, preço e quantidade usada válidos.');
       return;
  }
  const gramsPurchased=draft.packageQuantity!*(draft.packageUnit==='kg'?1000:1);
  const row:MaterialLine={...draft,id:editId??'extra-'+nextId,pricePerKg:draft.packagePrice!/gramsPurchased*1000};
  setDetailedMaterials(prev=>editId?prev.map(m=>m.id===editId?row:m):[...prev,row]);
  if(!editId)setNextId(v=>v+1);
  remember('cor',row.name);remember('tipo',row.type||'');remember('marca',row.brand||'');
  setDraft(newDraft());setEditId(null);setErrorDraft('');
 };
 const edit=(m:MaterialLine)=>{setDetails(true);setEditId(m.id);setErrorDraft('');setDraft({...m,packageQuantity:m.packageQuantity??1,packageUnit:m.packageUnit??'kg',packagePrice:calculatedPackagePrice(m)});};
 const remove=(id:string)=>{setDetailedMaterials(prev=>prev.filter(m=>m.id!==id));if(editId===id){setDraft(newDraft());setEditId(null);}};
 const reset=()=>{
   if(!sessionStore.get()){setPrinters([initialPrinter]);setPrinterId('example');}
   setForm({...referenceCase,materials:undefined});
   setSimple(initialSimple);
   setDetailedMaterials(seeded());
   setAdvanced(false);setDetails(false);
   setDraft(newDraft());setEditId(null);setNextId(1);setErrorDraft('');
 };
 const activeInput:CostInput={
   ...form,
   printerPrice:activePrinter.printerPrice,
   averageWatts:activePrinter.averageWatts,
   lifetimeHours:activePrinter.lifetimeHours,
   pricePerKwh:activePrinter.pricePerKwh,
   grams:asGrams(simple.quantity,simple.quantityUnit),
   pricePerKg:perKg(simple.price,simple.priceUnit),
   materials:advanced&&details?detailedMaterials:undefined
 };
 let result:ReturnType<typeof calculateCost>|undefined, error='';
 try{result=calculateCost(activeInput)}catch(e){error=(e as Error).message;}
 const used = result ? result.modelGrams+result.wasteGrams : 0;
 const average = result&&used>0?result.material/used*1000:0;
 return <>
 <header className="site-header"><div className="shell brand"><span className="brand-mark" aria-hidden="true">M</span><div><strong>MakerCusto</strong><small>Conheça seu custo. Defina seu preço.</small></div><span className="phase">Prévia de desenvolvimento</span><button type="button" className="account-button" onClick={()=>session?void logout():setAuthOpen(true)}>{session?"Sair · "+(session.user.email??"Minha conta"):"Entrar / Salvar"}</button></div></header>
 <main className="shell">
  <section className="intro"><p className="eyebrow">IMPRESSÃO 3D SEM COMPLICAÇÃO</p><h1>Descubra seu custo. Venda com confiança.</h1><p>Comece com o essencial. Precisa de mais controle? Ative o Avançado.</p></section>
  <nav className="mode-switch" aria-label="Modo de cálculo"><button type="button" className={!advanced?"selected":""} aria-pressed={!advanced} onClick={()=>setAdvanced(false)}>Simples <small>Direto ao resultado</small></button><button type="button" className={advanced?"selected":""} aria-pressed={advanced} onClick={()=>setAdvanced(true)}>Avançado <small>Cores, impressora e custos extras</small></button></nav>
  <div className="workspace">
   <section className="panel">
    <div className="panel-heading"><div><h2>{advanced?"Personalize seu cálculo":"Seu cálculo"}</h2><p>{advanced?"Ajuste os detalhes sem perder os valores informados.":"Preencha os dados e veja o resultado na hora."}</p></div><button type="button" onClick={reset}>Restaurar exemplo</button></div>
    {advanced&&<section className="printer-section" aria-labelledby="printer-title">
     <div className="materials-heading"><h3 id="printer-title">Impressora</h3><button type="button" className="details-button" onClick={()=>setPrinterModal('edit')}>Editar cadastro</button></div>
     <div className="printer-selector">
      <label>Selecionar impressora
       <select aria-label="Selecionar impressora" value={printerId} onChange={e=>setPrinterId(e.target.value)}>
        {printers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
       </select>
      </label>
      <button type="button" onClick={addPrinter}>+ Nova impressora</button>
     </div>
     <p className="printer-summary">{count(activePrinter.averageWatts)} W (estimativa quando não informado) · Equipamento {money(activePrinter.printerPrice)} · Vida útil {count(activePrinter.lifetimeHours)} h · Energia {money(activePrinter.pricePerKwh)}/kWh</p>{!session&&<p className="footnote">Sem login: novas impressoras ficam apenas nesta sessão. Entre para salvar no banco.</p>}{session&&<p className="footnote">{cloudBusy?"Carregando sua oficina...":workspaceId?"Oficina conectada ao Supabase.":"Conectando oficina..."}</p>}{accountError&&<p role="alert" className="error">{accountError}</p>}

     <p className="footnote">Valores de exemplo são estimativas. Cadastros pessoais são salvos no Supabase após login; sem login, ficam só nesta sessão.</p>
    </section>}
    <section className="materials" aria-labelledby="materials-title">
     <div className="materials-heading"><h3 id="materials-title">Filamento</h3>{advanced&&<button className="details-button" type="button" aria-expanded={details} aria-controls="material-details" onClick={()=>setDetails(v=>!v)}>{details?'Usar total de filamento':'Detalhar por cor'} <span aria-hidden="true">{details?'▴':'▾'}</span></button>}</div>
     {(!advanced||!details)&&<div className="simple-material-fields">
       <label>Filamento utilizado
         <div className="simple-field-combo"><input data-testid="simpleQuantity" type="number" min="0" step="any" value={display(simple.quantity)} onChange={e=>setSimple(prev=>({...prev,quantity:numeric(e.target.value)}))}/><select aria-label="Unidade do total utilizado" value={simple.quantityUnit} onChange={e=>setSimple(prev=>({...prev,quantityUnit:e.target.value as Unit}))}><option value="g">g</option><option value="kg">kg</option></select></div>
       </label>
       <label>Preço do filamento
         <div className="simple-field-combo"><input data-testid="simplePrice" type="number" min="0" step="any" value={display(simple.price)} onChange={e=>setSimple(prev=>({...prev,price:numeric(e.target.value)}))}/><select aria-label="Unidade do preço do filamento" value={simple.priceUnit} onChange={e=>setSimple(prev=>({...prev,priceUnit:e.target.value as Unit}))}><option value="kg">R$/kg</option><option value="g">R$/g</option></select></div>
       </label>
     </div>}
     <div className="material-summary">
       <div><small>Total utilizado</small><strong data-testid="totalUsed">{result?count(used)+' g':'—'}</strong></div>
       <div><small>Preço médio ponderado</small><strong data-testid="averagePrice">{result?money(average)+'/kg':'—'}</strong></div>
       <div><small>Custo do filamento</small><strong data-testid="materialCost">{result?money(result.material):'—'}</strong></div>
     </div>
     {advanced&&<div id="material-details" hidden={!details}>
      <datalist id="catalog-cor">{list('cor').map(x=><option key={normalize(x)} value={x}/>)}</datalist>
      <datalist id="catalog-tipo">{list('tipo').map(x=><option key={normalize(x)} value={x}/>)}</datalist>
      <datalist id="catalog-marca">{list('marca').map(x=><option key={normalize(x)} value={x}/>)}</datalist>
      <div className="material-form" role="group" aria-label="Cadastro compacto de filamento">
       <div className="material-form-title"><strong>{editId?'Editar filamento':'Adicionar filamento'}</strong><small>Preço da embalagem, não do quilo</small></div>
       <div className="compact-inputs">
        <div className="catalog-field"><div className="catalog-field-heading"><span>Tipo</span><button type="button" className="catalog-add" aria-label="Cadastrar tipo" onClick={()=>setCatalogModal('tipo')}>+</button></div><input list="catalog-tipo" aria-label="Tipo de filamento" value={draft.type||''} onBlur={e=>remember('tipo',e.target.value)} onChange={e=>setDraftText('type',e.target.value)}/></div>
        <div className="catalog-field"><div className="catalog-field-heading"><span>Cor</span><button type="button" className="catalog-add" aria-label="Cadastrar cor" onClick={()=>setCatalogModal('cor')}>+</button></div><input list="catalog-cor" aria-label="Cor do filamento" value={draft.name} onBlur={e=>remember('cor',e.target.value)} onChange={e=>setDraftText('name',e.target.value)}/></div>
        <div className="catalog-field"><div className="catalog-field-heading"><span>Marca</span><button type="button" className="catalog-add" aria-label="Cadastrar marca" onClick={()=>setCatalogModal('marca')}>+</button></div><input list="catalog-marca" aria-label="Marca do filamento" value={draft.brand||''} onBlur={e=>remember('marca',e.target.value)} onChange={e=>setDraftText('brand',e.target.value)}/></div>
        <label>Embalagem<input type="number" min="0.001" step="any" data-testid="packageQuantity" value={display(draft.packageQuantity)} onChange={e=>setDraftNumber('packageQuantity',e.target.value)}/></label>
        <label>Unid. compra<select aria-label="Unidade da embalagem" value={draft.packageUnit||'kg'} onChange={e=>setDraft(prev=>({...prev,packageUnit:e.target.value as 'kg'|'g'}))}><option value="kg">kg</option><option value="g">g</option></select></label>
        <label>Preço total (R$)<input type="number" min="0" step="any" data-testid="packagePrice" value={display(draft.packagePrice)} onChange={e=>setDraftNumber('packagePrice',e.target.value)}/></label>
        <label>Usado (g)<input type="number" min="0" step="any" data-testid="gramsUsed" value={display(draft.grams)} onChange={e=>setDraftNumber('grams',e.target.value)}/></label>
        <label>Purga (g)<input type="number" min="0" step="any" data-testid="wasteGrams" value={display(draft.wasteGrams)} onChange={e=>setDraftNumber('wasteGrams',e.target.value)}/></label>
       </div>
       <div className="form-actions"><button type="button" className="primary-action" onClick={save}>{editId?'Salvar alteração':'Adicionar à tabela'}</button>{editId&&<button type="button" onClick={()=>{setEditId(null);setDraft(newDraft());setErrorDraft('');}}>Cancelar edição</button>}</div>
       {errorDraft&&<p className="error" role="alert">{errorDraft}</p>}
      </div>
      <div className="materials-table-scroll"><table className="materials-table"><thead><tr><th>Filamento / ações</th><th>Marca</th><th>Embalagem</th><th>Preço total</th><th>Usado</th><th>Custo</th></tr></thead><tbody>
        {detailedMaterials.map(item=>{
         const pkgQty=item.packageQuantity??1,pkgUnit=item.packageUnit??'kg';
         const spent=(item.grams+item.wasteGrams)*((item.packagePrice??item.pricePerKg*pkgQty*(pkgUnit==='kg'?1:.001))/(pkgQty*(pkgUnit==='kg'?1000:1)));
         return <tr key={item.id} data-testid={'row-'+item.id}><td><strong>{item.name}</strong><small>{item.type||'Filamento'}</small><div className="row-actions"><button type="button" aria-label={'Editar '+item.name} onClick={()=>edit(item)}>Editar</button><button type="button" aria-label={'Remover '+item.name} onClick={()=>remove(item.id)}>×</button></div></td><td>{item.brand||'—'}</td><td>{count(pkgQty)} {pkgUnit}</td><td>{money(calculatedPackagePrice(item))}</td><td>{count(item.grams+item.wasteGrams)} g</td><td className="numeric-cell">{money(spent)}</td></tr>;
        })}
      </tbody><tfoot><tr><th colSpan={4}>Total</th><th>{result?count(used)+' g':'—'}</th><th>{result?money(result.material):'—'}</th></tr></tfoot></table></div>
      <p className="footnote">A tabela usa quantidade adquirida e preço da embalagem para calcular o preço por grama. Informe purga apenas se ela não estiver incluída no peso usado.</p>
     </div>}
    </section>
    <div className="fields">{fields.filter(field=>advanced||['hours','quantity','salePrice'].includes(field.key)).map(field=><label key={field.key}>{field.label}<input data-testid={field.key} type="number" min={field.key==='quantity'||field.key==='lifetimeHours'?'1':'0'} step={field.step} value={display(form[field.key])} onChange={e=>update(field.key,e.target.value)}/></label>)}</div>
    <p className="footnote">{advanced?"Tarifa, potência e vida útil são hipóteses editáveis, não medições oficiais.":"Energia, desgaste da impressora e outros custos usam valores de exemplo. Confira-os no Avançado antes de definir seu preço final."}</p>
   </section>
   <section className="panel result-panel" aria-live="polite"><h2>Seu resultado</h2>{error?<p className="error" role="alert">{error}</p>:result&&<>
    <div className="hero-amount"><span>Custo de produção por unidade</span><strong data-testid="unitCost">{money(result.unitCost)}</strong><small>Total do lote: {money(result.lotCost)}</small></div>
    <div className="quick-outcomes"><div><span>Você vende por unidade</span><strong data-testid="salePriceSummary">{money(form.salePrice)}</strong></div><div><span>Sobra por unidade (bruto)</span><strong data-testid="unitProfit" className={result.grossProfit<0?"negative":"positive"}>{money(form.salePrice-result.unitCost)}</strong></div></div>
    <details className="breakdown" open={advanced}><summary>Entenda seu custo e lucro</summary><div className="breakdown-inner"><h3>Composição do lote</h3><dl className="cost-list">{([['Filamentos',result.material],['Energia',result.energy],['Depreciação',result.depreciation],['Acessórios',result.accessories],['Montagem',result.assembly]] as const).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{money(value)}</dd></div>)}</dl>
    <div className="summary"><div><span>Faturamento do lote</span><strong>{money(result.lotRevenue)}</strong></div><div><span>Lucro bruto estimado</span><strong data-testid="grossProfit" className={result.grossProfit<0?'negative':'positive'}>{money(result.grossProfit)}</strong></div><div><span>Margem bruta</span><strong data-testid="margin">{result.marginPercent.toFixed(1).replace('.',',')}%</strong></div><div><span>Markup</span><strong>{result.markupPercent.toFixed(1).replace('.',',')}%</strong></div></div>
    <p className="footnote">Não inclui embalagem, frete, marketplace, tributos e despesas administrativas. Lucro bruto não é lucro líquido.</p></div></details>
   </>}</section>
  </div>
 </main><footer className="shell footer">MakerCusto · Preview em desenvolvimento · Cadastros na nuvem após login</footer>
 {authOpen&&<AuthModal onClose={()=>setAuthOpen(false)} onSuccess={()=>{setAuthOpen(false);void loadAccount();}}/>}
 {printerModal&&<PrinterModal models={models} initial={printerModal==="edit"?(stored.find(p=>p.id===printerId)??{id:activePrinter.id,workspace_id:workspaceId??'',model_id:models.find(m=>activePrinter.name.includes(m.name))?.id??null,name:activePrinter.name,purchase_price:activePrinter.printerPrice,average_watts:activePrinter.averageWatts,lifetime_hours:activePrinter.lifetimeHours,active:true}):undefined} onClose={()=>setPrinterModal(null)} onSave={savePrinter}/>}
 {catalogModal&&<CatalogModal title={catalogTitles[catalogModal]} onClose={()=>setCatalogModal(null)} onSave={saveCatalog}/>}
 </>;
}
