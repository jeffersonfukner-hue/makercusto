import {AssemblyComposer,compositionNumbers,type CompositionSummary} from './components/AssemblyComposer';
import {CalculationResultPanel,resultShareLines,type ResultLine} from './components/CalculationResultPanel';
import type {OrderPlanInput} from './domain/order-plan';
import {OrdersWorkspace} from './components/OrdersWorkspace';
import {useConfirmation} from './components/ConfirmationDialog';
import {CalculationPrintSummary} from './components/CalculationShare';
import {chooseSlicerProfile} from './data/filamentProfiles';
import {filamentBrands,filamentColors,filamentTypes} from './data/filamentCatalog';
import {LibraryWorkspace} from './components/LibraryWorkspace';
import type {ReactNode} from 'react';
import {PrintDurationFields,printDurationInHours,splitPrintDuration,type DurationDraft} from './components/PrintDurationFields';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {AuthModal,PrinterModal,CatalogModal} from './components/Modals';
import {SmartField,formatCatalogName,matchKey as normalize} from './components/SmartField';
import {FilamentProfilePanel} from './components/FilamentProfilePanel';
import {CalculatorHelp} from './components/CalculatorHelp';
import {ProductSavePanel} from './components/ProductSavePanel';
import {ProductWorkspace} from './components/ProductWorkspace';
import {MaterialsWorkspace} from './components/MaterialsWorkspace';
import {PrintsWorkspace} from './components/PrintsWorkspace';
import {WorkshopDashboard} from './components/WorkshopDashboard';
import {SystemNavigation,type ProductTab,type OverviewTab,type SystemSection} from './components/SystemNavigation';
import {printerEstimatedCosts,printerPresets,printerPresetLabel} from './data/printerPresets';
import {type Session,type StoredPrinter,type CatalogEntry,type PrinterDraft,type SavedCalculation,type AssemblyRecord,listLatestProductCalculations,sessionStore,signOut,loadPrinterModels,listWorkspaces,createWorkspace,listPrinters,insertPrinter,updateStoredPrinter,listCatalog,insertCatalog} from './data/supabase';
import { calculateCost, materialTotalGrams, referenceCase, salePriceForMargin, type CostInput, type MaterialLine } from './domain/cost';

const money = (value:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const count = (value:number) => value.toLocaleString('pt-BR',{maximumFractionDigits:2});
const numeric = (value:string) => value.trim() === '' ? NaN : Number(value);
const optionalNumber = (value:string) => value===''?undefined:Number(value);
const meterFields = [
 ['model','Modelo (m)'],['flushed','Purga (m)'],['tower','Torre (m)'],['total','Total do fatiador (m)']
] as const;
const estimatedMaterialGrams=(line:MaterialLine)=>line.grams+line.wasteGrams+(line.towerGrams??0);
const display = (value:number | undefined) => value !== undefined && Number.isFinite(value) ? value : '';
type Catalog = 'cor' | 'tipo' | 'marca';
const defaults:Record<Catalog,string[]> = {cor:filamentColors,tipo:filamentTypes,marca:filamentBrands};
const key = (catalog:Catalog) => 'makercusto:catalogo:'+catalog+':v1';
const unique = (values:string[]) => { const used=new Set<string>(); return values.map(value=>value.trim().replace(/\s+/g,' ')).filter(v=>{const k=normalize(v);if(!k||used.has(k))return false; used.add(k);return true;});};
function readCatalog(catalog:Catalog):string[] {
 try { const value:unknown=JSON.parse(localStorage.getItem(key(catalog))||'[]');return Array.isArray(value)?unique(value.filter((v):v is string=>typeof v==='string').slice(0,100)):[]; }catch { return []; }
}
type PrinterProfile = {id:string;name:string;printerPrice:number;averageWatts:number;lifetimeHours:number;pricePerKwh:number};
const initialPrinter:PrinterProfile = {id:'example',name:'Anycubic Kobra X — custos ilustrativos',printerPrice:3500,averageWatts:150,lifetimeHours:3000,pricePerKwh:1.03};
// Referências globais são selecionáveis sem cadastro e jamais alteradas pelo usuário.
const referencePrinters:PrinterProfile[]=printerPresets.map(p=>({id:'reference:'+p.id,name:printerPresetLabel(p),printerPrice:printerEstimatedCosts.purchasePrice,averageWatts:printerEstimatedCosts.averageWatts,lifetimeHours:printerEstimatedCosts.lifetimeHours,pricePerKwh:initialPrinter.pricePerKwh}));
const seedPrinters=():PrinterProfile[]=>[initialPrinter,...referencePrinters];
const LOCAL_PRINTERS_KEY='makercusto:impressoras-locais:v1';
const selectedPrinterKey=(account:string)=>'makercusto:impressora-selecionada:'+account+':v1';
const personalLocal=(p:PrinterProfile)=>p.id.startsWith('local-');
function readLocalPrinters():PrinterProfile[]{
 try{
  const raw:unknown=JSON.parse(localStorage.getItem(LOCAL_PRINTERS_KEY)||'[]');
  if(!Array.isArray(raw))return [];
  const ids=new Set<string>();
  return raw.slice(0,100).filter((p):p is PrinterProfile=>{
   if(!p||typeof p!=='object')return false;
   const item=p as Partial<PrinterProfile>;
   if(typeof item.id!=='string'||!item.id.startsWith('local-')||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>150)return false;
   if([item.printerPrice,item.averageWatts,item.lifetimeHours,item.pricePerKwh].some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0)||item.lifetimeHours===0)return false;
   ids.add(item.id);return true;
  });
 }catch{return [];}
}
function readSelectedPrinter(account:string,available:PrinterProfile[]):string{
 try{const selected=localStorage.getItem(selectedPrinterKey(account));return available.some(p=>p.id===selected)?selected!:'example';}catch{return 'example';}
}
function writeLocalPrinters(printers:PrinterProfile[]):void{
 try{localStorage.setItem(LOCAL_PRINTERS_KEY,JSON.stringify(printers.filter(personalLocal).slice(0,100)));}catch{/* armazenamento indisponível: cópias mantidas na sessão */}
}

type NumericKey = keyof typeof fields;
const fields = {
 quantity: {label:'Peças por mesa',step:'1',min:1,help:'Quantidade de peças prontas produzidas em uma impressão de mesa cheia.'},
 accessoryPerUnit: {label:'Acessórios por unidade (R$)',step:'0.01',min:0,help:'Custo dos acessórios consumidos por peça.'},
 assemblyMinutesPerUnit: {label:'Montagem por unidade (min)',step:'0.1',min:0,help:'Tempo de montagem e acabamento de cada unidade.'},
 laborPerHour: {label:'Mão de obra (R$/h)',step:'0.01',min:0,help:'Valor estimado da hora de trabalho na montagem.'},
 salePrice: {label:'Preço de venda por unidade (R$)',step:'0.01',min:0,help:'Preço cobrado por unidade.'}
} as const;
const calculatorTabs = [
 ['calculation','Cálculo','▦'],
 ['composition','Composição / Peças','◇'],
 ['settings','Configurações','⚙︎'],
 ['notes','Observações','▤']
] as const;
type Unit = 'g' | 'kg';
type SimpleFilament = { quantity:number; quantityUnit:Unit; price:number; priceUnit:Unit };
const initialSimple:SimpleFilament = {quantity:151.58,quantityUnit:'g',price:100,priceUnit:'kg'};
const asGrams = (quantity:number,unit:Unit) => quantity * (unit==='kg'?1000:1);
const perKg = (price:number,unit:Unit) => price * (unit==='g'?1000:1);
const newDraft = ():MaterialLine => ({id:'',name:'',type:'PLA',brand:'',grams:NaN,wasteGrams:0,pricePerKg:0,packageQuantity:1,packageUnit:'kg',packagePrice:NaN});
const seeded = () => referenceCase.materials!.map(m=>({...m,type:'PETG',brand:'',packageQuantity:1,packageUnit:'kg' as const,packagePrice:100}));
const calculatedPackagePrice = (item:MaterialLine):number => item.packagePrice ?? item.pricePerKg*(item.packageQuantity??1)*(item.packageUnit==='g'?.001:1);
function FilamentField({id,label,help,children}:{id:string;label:string;help:string;children:ReactNode}){
 return <div className="mc-filament-field">
  <div className="mc-field-caption"><label htmlFor={id}>{label}</label><CalculatorHelp label={label}>{help}</CalculatorHelp></div>
  {children}
 </div>;
}
export default function App(){
 const {requestConfirmation,confirmationDialog}=useConfirmation();
 const [printDurationDraft,setPrintDurationDraft]=useState<DurationDraft|null>(null);
 const [slicerDurationDrafts,setSlicerDurationDrafts]=useState<Partial<Record<'preparation'|'printing',DurationDraft>>>({});
 const [priceByMargin,setPriceByMargin]=useState(false);
 const [targetMargin,setTargetMargin]=useState(30);
 const [form,setForm]=useState<CostInput>(()=>({...referenceCase,materials:undefined}));
 const [printers,setPrinters]=useState<PrinterProfile[]>(()=>sessionStore.get()?seedPrinters():[...seedPrinters(),...readLocalPrinters()]);
 const [printerId,setPrinterId]=useState(()=>sessionStore.get()?'example':readSelectedPrinter('guest',[...seedPrinters(),...readLocalPrinters()]));
 const [session,setSession]=useState<Session|null>(()=>sessionStore.get());
 const [authMode,setAuthMode]=useState<'login'|'signup'|null>(null);
 const [printerModal,setPrinterModal]=useState<'new'|'edit'|null>(null);
 const [models,setModels]=useState<CatalogEntry[]>([]);
 const [catalogModal,setCatalogModal]=useState<Catalog|null>(null);
 const [stored,setStored]=useState<StoredPrinter[]>([]);
 const [workspaceId,setWorkspaceId]=useState<string|null>(null);
 const [accountError,setAccountError]=useState('');
 const [workspaceName,setWorkspaceName]=useState('Minha oficina');
 const [calculatorName,setCalculatorName]=useState('');
 const [calculatorSku,setCalculatorSku]=useState('');
 const [compositionSaved,setCompositionSaved]=useState('');
 const [compositionSummary,setCompositionSummary]=useState<CompositionSummary>();
 const [preferComposition,setPreferComposition]=useState(false);
 const [compositionOrder,setCompositionOrder]=useState<OrderPlanInput>({});
 const [compositionPricing,setCompositionPricing]=useState<{price:number;mode:'price'|'margin';target:number;legacy?:string}>();
 const restoreCompositionPricing=useCallback((assembly:AssemblyRecord)=>{
  setCompositionPricing({price:Number(assembly.sale_price??0),
   mode:assembly.pricing?.mode??'price',target:assembly.pricing?.targetMarginPercent??30,
   legacy:assembly.price_from_snapshot===false?(assembly.sale_price===null?
    'Esta revisão antiga não guardou o preço de venda.':
    'Preço atual da ficha. Esta revisão antiga não guardou a meta de margem.'):undefined});
  setCompositionOrder({quantity:assembly.pricing?.orderQuantity});
 },[]);
 const [description,setDescription]=useState('');
 const [identityReset,setIdentityReset]=useState(0);
 const [calculatorKind,setCalculatorKind]=useState<'product'|'component'>('product');
 const [calculatorTab,setCalculatorTab]=useState<'calculation'|'composition'|'settings'|'notes'>('calculation');
 const [activeSection,setActiveSection]=useState<SystemSection>('overview');
 const [productTab,setProductTab]=useState<ProductTab>('all');
 const [overviewTab,setOverviewTab]=useState<OverviewTab>('general');
 const [cloudBusy,setCloudBusy]=useState(false);
 const profileFromDb=(p:StoredPrinter):PrinterProfile=>({
  id:p.id,name:p.name,printerPrice:p.purchase_price??0,
  averageWatts:p.average_watts??initialPrinter.averageWatts,
  lifetimeHours:p.lifetime_hours??initialPrinter.lifetimeHours,
  pricePerKwh:initialPrinter.pricePerKwh
 });
 const loadAccount=async()=>{
  const current=sessionStore.get();setSession(current);
  if(!current){setWorkspaceId(null);setWorkspaceName('Minha oficina');setActiveSection('overview');setStored([]);const local=[...seedPrinters(),...readLocalPrinters()];setPrinters(local);setPrinterId(readSelectedPrinter('guest',local));return;}
  setCloudBusy(true);setAccountError('');
  try{
   let ws=await listWorkspaces();
   if(!ws.length){const id=await createWorkspace('Minha oficina');ws=[{id,name:'Minha oficina',owner_id:current.user.id}];}
   const id=ws[0].id;setWorkspaceName(ws[0].name);setWorkspaceId(id);
   const items=await listPrinters(id);setStored(items);
   const available=[...seedPrinters(),...items.map(profileFromDb)];
   setPrinters(available);
   const selected=readSelectedPrinter(current.user.id,available);
   setPrinterId(selected==='example'&&items.length?items[0].id:selected);
  }catch(e){setAccountError('Não foi possível carregar sua oficina: '+(e as Error).message);}
  finally{setCloudBusy(false);}
 };
 useEffect(()=>{void loadPrinterModels().then(setModels).catch(()=>setAccountError('Catálogo de impressoras indisponível. Tente novamente mais tarde.'));if(sessionStore.get())void loadAccount();},[]);
 // Visitantes preservam cópias só neste navegador. Contas usam os registros da oficina.
 useEffect(()=>{if(!session)writeLocalPrinters(printers);},[printers,session]);
 useEffect(()=>{
  if(session&&!workspaceId)return;
  const account=session?.user.id??'guest';
  if(!printers.some(p=>p.id===printerId))return;
  try{localStorage.setItem(selectedPrinterKey(account),printerId);}catch{/* fallback em memória */}
 },[session?.user.id,workspaceId,printers,printerId]);

 const savePrinter=async(data:PrinterDraft)=>{
  if(!sessionStore.get()||!workspaceId){
   const oldId=printerModal==='edit'&&!isReferencePrinter?printerId:null;
   const id=oldId??'local-'+String(Date.now())+'-'+Math.random().toString(36).slice(2,8);
   const local:PrinterProfile={id,name:data.name,printerPrice:data.purchase_price??printerEstimatedCosts.purchasePrice,averageWatts:data.average_watts??printerEstimatedCosts.averageWatts,lifetimeHours:data.lifetime_hours??printerEstimatedCosts.lifetimeHours,pricePerKwh:initialPrinter.pricePerKwh};
   setPrinters(prev=>[...prev.filter(p=>p.id!==id),local]);setPrinterId(id);return;
  }
  const old=isReferencePrinter?undefined:stored.find(p=>p.id===printerId);
  const saved=(printerModal==='edit'&&old?await updateStoredPrinter(old.id,workspaceId,data):await insertPrinter(workspaceId,data))[0];
  if(!saved)throw new Error('O banco não confirmou o cadastro.');
  setStored(prev=>[...prev.filter(p=>p.id!==saved.id),saved]);
  setPrinters(prev=>[...prev.filter(p=>p.id!==saved.id),profileFromDb(saved)]);setPrinterId(saved.id);
 };
 const logout=async()=>{await signOut();setActiveSection('overview');setSession(null);setWorkspaceId(null);setRevisionTarget(null);setStored([]);const local=[...seedPrinters(),...readLocalPrinters()];setPrinters(local);setPrinterId(readSelectedPrinter('guest',local));};
 const activePrinter=printers.find(p=>p.id===printerId)??printers[0];
 const addPrinter=()=>setPrinterModal('new');
 const isReferencePrinter=printerId==='example'||printerId.startsWith('reference:');
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
  if(field==='cor')setDraft(prev=>({...prev,name:formatCatalogName(value,list('cor'))}));
  else if(field==='tipo')setDraft(prev=>({...prev,type:formatCatalogName(value,list('tipo'))}));
  else setDraft(prev=>({...prev,brand:formatCatalogName(value,list('marca'))}));
 };
 useEffect(()=>{const load=async()=>{
  const lists=await Promise.allSettled([listCatalog('color'),listCatalog('filament_type'),listCatalog('filament_brand')]);
  const types:Array<Catalog>=['cor','tipo','marca'];
  lists.forEach((result,i)=>{
   if(result.status==='fulfilled')setCatalog(prev=>({...prev,[types[i]]:unique([...prev[types[i]],...result.value.map(x=>x.name)])}));
  });
 };void load();},[workspaceId]);
 const catalogOptions=useMemo(()=>({
  cor:unique([...defaults.cor,...catalog.cor]),
  tipo:unique([...defaults.tipo,...catalog.tipo]),
  marca:unique([...defaults.marca,...catalog.marca])
 }),[catalog]);
 const list=(c:Catalog)=>catalogOptions[c];
 const remember=(c:Catalog,value:string)=>{
   if(!value.trim()||list(c).some(item=>normalize(item)===normalize(value)))return;
   const next=unique([...catalog[c],formatCatalogName(value,defaults[c])]);
   setCatalog(old=>({...old,[c]:next}));
   try{localStorage.setItem(key(c),JSON.stringify(next));}catch{/* fallback em memória */}
 };
 const update=(field:NumericKey,value:string)=>{
  const next=numeric(value);
  setForm(previous=>({
   ...previous,[field]:next,
   orderPlan:field==='quantity'&&next!==previous.quantity&&previous.orderPlan
    ?{quantity:previous.orderPlan.quantity}:previous.orderPlan
  }));
 };
 const setDraftText=(field:'name'|'brand'|'type',value:string)=>{setDraft(prev=>({...prev,[field]:value}));setErrorDraft('');};
 const setDraftNumber=(field:'grams'|'wasteGrams'|'towerGrams'|'measuredWasteGrams'|'packagePrice'|'packageQuantity',value:string)=>{setDraft(prev=>({...prev,[field]:field==='measuredWasteGrams'?optionalNumber(value):value===''&&(field==='wasteGrams'||field==='towerGrams')?0:numeric(value)}));setErrorDraft('');};
 const save=()=>{
  if(!draft.name.trim()||!draft.type?.trim()||!Number.isFinite(draft.grams)||draft.grams<0||
     !Number.isFinite(draft.wasteGrams)||estimatedMaterialGrams(draft)<0||
     !Number.isFinite(draft.towerGrams??0)||(draft.towerGrams??0)<0||
     !Number.isFinite(draft.measuredWasteGrams??0)||(draft.measuredWasteGrams??0)<0||
     (draft.slicerMeters&&meterFields.some(([key])=>{
       const value=draft.slicerMeters?.[key];
       return value!==undefined&&(!Number.isFinite(value)||(key!=='flushed'&&value<0));
     }))||
     !Number.isFinite(draft.packageQuantity)||draft.packageQuantity!<=0||
     !Number.isFinite(draft.packagePrice)||draft.packagePrice!<0){
       setErrorDraft('Informe tipo, cor, embalagem, preço e quantidade usada válidos. A purga pode ser negativa quando o fatiador indicar, desde que o consumo estimado da cor seja igual ou maior que zero.');
       return;
  }
  const gramsPurchased=draft.packageQuantity!*(draft.packageUnit==='kg'?1000:1);
  const row:MaterialLine={...draft,name:formatCatalogName(draft.name,list('cor')),type:formatCatalogName(draft.type??'',list('tipo')),brand:formatCatalogName(draft.brand??'',list('marca')),id:editId??'extra-'+nextId,pricePerKg:draft.packagePrice!/gramsPurchased*1000};
  const saveRow=()=>{
   setDetailedMaterials(prev=>editId?prev.map(m=>m.id===editId?row:m):[...prev,row]);
   if(!editId)setNextId(v=>v+1);
   remember('cor',row.name);remember('tipo',row.type||'');remember('marca',row.brand||'');
   setDraft(newDraft());setEditId(null);setErrorDraft('');
  };
  if(editId)requestConfirmation({
   title:'Salvar alterações do filamento',
   message:'Deseja salvar as alterações de “'+row.name+'” neste cálculo?',
   actionLabel:'Salvar alterações',onConfirm:saveRow
  });
  else saveRow();
 };
 const edit=(m:MaterialLine)=>{setDetails(true);setEditId(m.id);setErrorDraft('');setDraft({...m,packageQuantity:m.packageQuantity??1,packageUnit:m.packageUnit??'kg',packagePrice:calculatedPackagePrice(m)});};
 const remove=(item:MaterialLine)=>requestConfirmation({
  title:'Remover filamento',
  message:'Deseja remover “'+item.name+'” deste cálculo?',
  actionLabel:'Remover filamento',
  onConfirm:()=>{
   setDetailedMaterials(previous=>previous.filter(row=>row.id!==item.id));
   if(editId===item.id){setDraft(newDraft());setEditId(null);setErrorDraft('');}
  }
 });
 const reset=()=>{
   setRevisionTarget(null);
   setPreferComposition(false);setCompositionOrder({});setCompositionPricing(undefined);setCompositionSummary(undefined);
   setCalculatorKind('product');
   setLoadedCalculation('');
   setPrintDurationDraft(null);
   setSlicerDurationDrafts({});
   if(!sessionStore.get()){setPrinters([...seedPrinters(),...readLocalPrinters()]);setPrinterId('example');}
   setForm({...referenceCase,materials:undefined});
   setPriceByMargin(false);setTargetMargin(30);
   setSimple(initialSimple);
   setDetailedMaterials(seeded());
   setAdvanced(false);setDetails(false);
   setDraft(newDraft());setEditId(null);setNextId(1);setErrorDraft('');
 };
 const requestClearCalculation=()=>requestConfirmation({
  title:'Zerar cálculo',
  message:'Os valores e a identificação deste rascunho serão limpos. A impressora selecionada e os cálculos salvos serão mantidos.',
  actionLabel:'Zerar cálculo',
  onConfirm:()=>{
   setRevisionTarget(null);setPreferComposition(false);setCompositionOrder({});setCompositionPricing(undefined);setCompositionSummary(undefined);setCalculatorKind('product');setLoadedCalculation('');setAccountError('');
   setDescription('');setCalculatorName('');setCalculatorSku('');setIdentityReset(value=>value+1);
   setPrintDurationDraft(null);setSlicerDurationDrafts({});
   setForm({...referenceCase,materials:undefined,grams:0,pricePerKg:0,hours:0,quantity:1,
    accessoryPerUnit:0,assemblyMinutesPerUnit:0,laborPerHour:0,salePrice:0});
   setSimple({quantity:0,quantityUnit:'g',price:0,priceUnit:'kg'});
   setPriceByMargin(false);setTargetMargin(30);
   setDetails(false);setDetailedMaterials([]);
   setDraft(newDraft());setEditId(null);setNextId(1);setErrorDraft('');
  }
 });
 const [loadedCalculation,setLoadedCalculation]=useState('');
 const [revisionTarget,setRevisionTarget]=useState<SavedCalculation|null>(null);
 const applySavedCalculation=(saved:SavedCalculation)=>{
  const input=saved.saved_input as Partial<CostInput>|null;
  if(!input||typeof input!=='object'){setAccountError('Cálculo salvo sem parâmetros válidos.');return false;}
  const restored:CostInput={...referenceCase,...input};
  const data=Array.isArray(input.materials)?input.materials:undefined;
  const testInput={...restored,materials:data,
   printerPrice:activePrinter.printerPrice,averageWatts:activePrinter.averageWatts,
   lifetimeHours:activePrinter.lifetimeHours,pricePerKwh:activePrinter.pricePerKwh};
  try{calculateCost(testInput);}
  catch(e){setAccountError('Este cálculo salvo não pode ser reutilizado: '+(e as Error).message);return false;}
  setForm({...restored,materials:undefined});
  setPriceByMargin(restored.targetMarginPercent!==undefined);
  setTargetMargin(restored.targetMarginPercent??30);
  setPrintDurationDraft(null);
  setSlicerDurationDrafts({});
  setSimple({quantity:Number(restored.grams),quantityUnit:'g',
   price:Number(restored.pricePerKg),priceUnit:'kg'});
  if(data&&data.length){setDetailedMaterials(data);setAdvanced(true);setDetails(true);}
  else{setAdvanced(Object.values(restored.slicerSummary??{}).some(value=>value!==undefined));setDetails(false);}
  setAccountError('');
  setLoadedCalculation('Dados de "'+saved.name+'" carregados com a impressora selecionada.');
  setRevisionTarget(saved);setCalculatorName(saved.name);setCalculatorSku(saved.sku??'');
  setCalculatorKind(saved.kind);setPreferComposition(Boolean(saved.composition));
  if((revisionTarget?.composition?.snapshot_id??revisionTarget?.product_id)!==(saved.composition?.snapshot_id??saved.product_id))setCompositionSummary(undefined);
  if(saved.composition)restoreCompositionPricing(saved.composition);
  else{setCompositionOrder({});setCompositionPricing(undefined);}
  setCalculatorTab('calculation');
  return true;
 };
 const slicerSummary=form.slicerSummary;
 const hasSlicerTiming=advanced&&slicerSummary?.preparation!==undefined&&slicerSummary.printing!==undefined;
 const invalidSlicerTiming=advanced&&[slicerSummary?.preparation,slicerSummary?.printing].some(Number.isNaN);
 const estimatedHours=invalidSlicerTiming?NaN:hasSlicerTiming?slicerSummary.preparation!+slicerSummary.printing!:form.hours;
 const pricingInput:CostInput={
   ...form,
   hours:estimatedHours,
   targetMarginPercent:priceByMargin?targetMargin:undefined,
   printerPrice:activePrinter.printerPrice,
   averageWatts:activePrinter.averageWatts,
   lifetimeHours:activePrinter.lifetimeHours,
   pricePerKwh:activePrinter.pricePerKwh,
   grams:asGrams(simple.quantity,simple.quantityUnit),
   pricePerKg:perKg(simple.price,simple.priceUnit),
   materials:advanced&&details?detailedMaterials:undefined
 };
 let result:ReturnType<typeof calculateCost>|undefined, error='';
 try{result=calculateCost(pricingInput)}catch(e){error=(e as Error).message;}
 const activeInput={...pricingInput,salePrice:result?.salePrice??pricingInput.salePrice};
 const slicerTotals=advanced&&details?detailedMaterials.reduce((totals,line)=>({
  model:totals.model+line.grams,
  flushed:totals.flushed+line.wasteGrams,
  tower:totals.tower+(line.towerGrams??0)
 }),{model:0,flushed:0,tower:0}):null;
 const used = result ? result.modelGrams+result.wasteGrams : 0;
 const average = result&&used>0?result.material/used*1000:0;
 const calculationField=(key:keyof typeof fields, showHelp=Boolean(session))=>{
  const field=fields[key];
  const label=field.label;
  return <div className="mc-number-field">
   <label><span>{label}</span>
    <input data-testid={key} type="number" min={field.min} step={field.step} value={display(form[key])} onChange={event=>update(key,event.target.value)}/>
   </label>
   {showHelp&&<CalculatorHelp label={label}>{field.help}</CalculatorHelp>}
  </div>;
 };
 const printDuration=printDurationDraft??splitPrintDuration(estimatedHours,true);
 const setPrintDuration=(next:DurationDraft)=>{
  setPrintDurationDraft(next);
  setForm(previous=>({...previous,hours:printDurationInHours(next)??NaN}));
 };
 const updateSlicerSummary=(key:keyof NonNullable<CostInput['slicerSummary']>,value:number|undefined)=>{
  setForm(previous=>({...previous,slicerSummary:{...previous.slicerSummary,[key]:value}}));
 };
 const updateSlicerDuration=(key:'preparation'|'printing',value:DurationDraft)=>{
  setSlicerDurationDrafts(previous=>({...previous,[key]:value}));
  updateSlicerSummary(key,printDurationInHours(value)??undefined);
 };
 const composed=Boolean(session)&&calculatorKind==='product'&&preferComposition&&
  (calculatorTab==='composition'||Boolean(revisionTarget?.composition??revisionTarget?.available_composition)||Boolean(compositionSummary?.partsCount));
 const selectedComposition=revisionTarget?.composition??revisionTarget?.available_composition;
 const showCompositionEditor=calculatorTab==='composition'||calculatorTab==='calculation'&&composed;
 const assemblyPricing=compositionPricing??{price:form.salePrice,mode:priceByMargin?'margin' as const:'price' as const,target:targetMargin};
 const displayedPriceByMargin=composed?assemblyPricing.mode==='margin':priceByMargin;
 let assemblyPrice=assemblyPricing.price, assemblyError='';
 if(assemblyPricing.mode==='margin'&&compositionSummary?.cost!=null)try{
  assemblyPrice=salePriceForMargin(compositionSummary.cost,assemblyPricing.target);
 }catch(cause){assemblyError=(cause as Error).message;assemblyPrice=NaN;}
 const updateAssemblyPricing=(patch:Partial<typeof assemblyPricing>)=>setCompositionPricing({...assemblyPricing,...patch,legacy:undefined});
 const displayedResult=composed?compositionNumbers(compositionSummary?.cost??null,assemblyPrice):result;
 const resultQuantity=composed?1:activeInput.quantity;
 const resultLines:readonly ResultLine[]=composed?(compositionSummary?.lines??[]):result?[
  ['Consumo de filamento',count(used)+' g'],['Filamentos',money(result.material)],['Energia',money(result.energy)],['Depreciação',money(result.depreciation)],
  ['Acessórios',money(result.accessories)],['Montagem',money(result.assembly)]
 ]:[];
 const shareTitle=calculatorName.trim()||revisionTarget?.name||'';
 const shareLines=displayedResult&&resultShareLines(displayedResult,resultQuantity,resultLines,composed);
 const modeSwitch=<div className="mc-calculator-tools"><nav className="mode-switch" aria-label="Modo de cálculo"><button type="button" className={!advanced?"selected":""} aria-pressed={!advanced} onClick={()=>setAdvanced(false)}>Simples {!session&&<small>Direto ao resultado</small>}</button><button type="button" className={advanced?"selected":""} aria-pressed={advanced} onClick={()=>setAdvanced(true)}>Avançado {!session&&<small>Cores, impressora e custos extras</small>}</button></nav>
  <button type="button" className="mc-light-action mc-clear-calculation" onClick={requestClearCalculation}>Zerar cálculo</button>
 </div>;
 return <div className="mc-theme">
 {confirmationDialog}
 {shareLines&&(!session||activeSection==='calculator')&&<CalculationPrintSummary title={shareTitle||'Resultado do cálculo'} lines={shareLines}/>}
 {!session&&<header className="site-header"><div className="shell brand"><span className="brand-mark" aria-hidden="true">M</span><div><strong>MakerCusto</strong><small>Conheça seu custo. Defina seu preço.</small></div><span className="phase">Prévia de desenvolvimento</span><button type="button" className="account-button" onClick={()=>setAuthMode('login')}>Entrar</button></div></header>}
 <SystemNavigation authenticated={Boolean(session)} workspaceName={workspaceName} email={session?.user.email??'Conta'} section={activeSection} productTab={productTab} onProductTab={setProductTab} overviewTab={overviewTab} onOverviewTab={setOverviewTab} onNavigate={section=>{setCompositionSaved('');setActiveSection(section);}} onLogout={()=>void logout()}>
 <main className={session?"app-main":"shell"}>
  {session&&activeSection==='overview'&&<WorkshopDashboard tab={overviewTab} workspaceId={workspaceId} workspaceName={workspaceName} printersCount={stored.length} busy={cloudBusy} onNavigate={setActiveSection}/>}
  {(!session||activeSection==='calculator')&&<>
  <div className="mc-calculator">
  {!session&&<section className="intro"><p className="eyebrow">IMPRESSÃO 3D SEM COMPLICAÇÃO</p><h1>Descubra seu custo. Venda com confiança.</h1><p>Comece com o essencial. Precisa de mais controle? Ative o Avançado.</p></section>}
  {session&&<ProductSavePanel key={identityReset} session={session} workspaceId={workspaceId} input={activeInput} result={result}
   kind={calculatorKind} onKindChange={kind=>{setCalculatorKind(kind);if(kind==='component'&&calculatorTab==='composition')setCalculatorTab('calculation');}}
   name={calculatorName} onNameChange={setCalculatorName} sku={calculatorSku} onSkuChange={setCalculatorSku}
   composing={calculatorTab==='composition'} hideCostDock={composed}
   onLogin={()=>setAuthMode('login')} onLoadCalculation={applySavedCalculation} revisionTarget={revisionTarget}
   description={description} onDescriptionChange={setDescription} lotField={composed?undefined:calculationField('quantity')}
   onNewCalculation={()=>{reset();setCalculatorTab('calculation');}}
   onClearRevisionTarget={()=>{setRevisionTarget(null);setLoadedCalculation('');}}
   onViewSaved={kind=>{setProductTab(kind==='component'?'parts':'all');setActiveSection('products');}}
   onCreateAssembly={saved=>{if(applySavedCalculation(saved)){setPreferComposition(true);setCalculatorTab('composition');}}}/>}
  {loadedCalculation&&calculatorTab!=='composition'&&<p role="status" className="product-success mc-calculation-status">{loadedCalculation}</p>}
  {compositionSaved&&<p role="status" className="product-success">{compositionSaved}</p>}
  {session&&accountError&&<p role="alert" className="error">{accountError}</p>}
  {session&&<div className="mc-calculator-navigation">
  <nav className="mc-calculator-tabs" aria-label="Áreas da calculadora">
   {calculatorTabs.filter(([id])=>id!=='composition'||calculatorKind==='product').map(([id,label,icon])=><button key={id} type="button" aria-current={calculatorTab===id?'page':undefined} aria-pressed={calculatorTab===id} onClick={()=>{setCalculatorTab(id);if(id==='composition')setPreferComposition(true);}}>
    <span aria-hidden="true">{icon}</span>{label}
   </button>)}
  </nav>
  {calculatorTab==='calculation'&&!composed&&modeSwitch}
  </div>}
  {!session&&modeSwitch}
  <div className="workspace">
   <div className="mc-calculator-input-pane">
   <div hidden={Boolean(session)&&(calculatorTab!=="calculation"||composed)}>
   <div className="mc-cost-editor">
    <section className="mc-cost-block mc-print" data-detailed={advanced&&details} aria-labelledby="print-title">
     {session?<h2 id="print-title">Impressão</h2>:<div className="panel-heading">
      <h2 id="print-title">Impressão 3D</h2>
      <button type="button" onClick={reset}>Restaurar exemplo</button>
     </div>}
    {advanced&&<section className="printer-section" aria-labelledby="printer-title">
     <div className="materials-heading"><h3 id="printer-title">Impressora</h3><button type="button" className="details-button" onClick={()=>setPrinterModal('edit')}>{isReferencePrinter?'Clonar e personalizar':'Editar minha impressora'}</button></div>
     <div className="printer-selector">
      <label>Selecionar impressora
       <select aria-label="Selecionar impressora" value={printerId} onChange={e=>setPrinterId(e.target.value)}>
        <optgroup label="Padrões prontos — estimativas editáveis">{printers.filter(p=>p.id==='example'||p.id.startsWith('reference:')).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>
        {printers.some(p=>p.id!=='example'&&!p.id.startsWith('reference:'))&&<optgroup label="Minhas impressoras">{printers.filter(p=>p.id!=='example'&&!p.id.startsWith('reference:')).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>}
       </select>
      </label>
      <button type="button" className="printer-add-action" onClick={addPrinter}><span className="action-plus" aria-hidden="true">+</span><span>Nova impressora</span></button>
     </div>
     <p className="printer-summary">{count(activePrinter.averageWatts)} W · Equipamento {money(activePrinter.printerPrice)} · Vida útil {count(activePrinter.lifetimeHours)} h · Energia {money(activePrinter.pricePerKwh)}/kWh</p>
     {(!session||!workspaceId)&&<p className="footnote">{session?(cloudBusy?'Carregando sua oficina…':'Conectando oficina…'):'Sem login: suas impressoras são guardadas neste navegador. Entre para salvar na nuvem.'}</p>}
     {!session&&accountError&&<p role="alert" className="error">{accountError}</p>}
    </section>}
    <section className="materials" aria-labelledby="materials-title">
     <div className="materials-heading"><div className="mc-field-caption"><h3 id="materials-title">Filamento</h3>
      <CalculatorHelp label="Filamento">
       {advanced&&details?<>Informe o preço total da embalagem. A tabela calcula o custo pela soma do peso do modelo, da purga (Flush) e da torre de purga (Tower). Use os pesos separados do fatiador.
        {!chooseSlicerProfile(draft.brand??'',draft.type??'')&&<> O perfil técnico ainda não está disponível para este tipo. Consulte as recomendações do fabricante para configurar o fatiador.</>}
       </>:<>Informe o consumo total e o preço do filamento. No Avançado você pode detalhar a compra e o consumo de cada cor.</>}
      </CalculatorHelp>
     </div>{advanced&&<button className="details-button" type="button" aria-expanded={details} aria-controls="material-details" onClick={()=>setDetails(v=>!v)}>{details?'Usar total de filamento':'Detalhar por cor'} <span aria-hidden="true">{details?'▴':'▾'}</span></button>}</div>
     {(!advanced||!details)&&<div className="simple-material-fields">
       <FilamentField id="simpleQuantity" label="Filamento utilizado" help={simple.quantityUnit==='kg'?'Informe o peso total em quilogramas.':'Use o total em gramas informado pelo fatiador.'}>
        <div className="simple-field-combo"><input id="simpleQuantity" data-testid="simpleQuantity" type="number" min="0" step="any" value={display(simple.quantity)} onChange={e=>setSimple(prev=>({...prev,quantity:numeric(e.target.value)}))}/><select aria-label="Unidade do total utilizado" value={simple.quantityUnit} onChange={e=>setSimple(prev=>({...prev,quantityUnit:e.target.value as Unit}))}><option value="g">g</option><option value="kg">kg</option></select></div>
       </FilamentField>
       <FilamentField id="simplePrice" label="Preço do filamento" help={simple.priceUnit==='kg'?'Informe o preço por quilo.':'Informe o preço por grama.'}>
        <div className="simple-field-combo"><input id="simplePrice" data-testid="simplePrice" type="number" min="0" step="any" value={display(simple.price)} onChange={e=>setSimple(prev=>({...prev,price:numeric(e.target.value)}))}/><select aria-label="Unidade do preço do filamento" value={simple.priceUnit} onChange={e=>setSimple(prev=>({...prev,priceUnit:e.target.value as Unit}))}><option value="kg">R$/kg</option><option value="g">R$/g</option></select></div>
       </FilamentField>
     </div>}
     <div className="material-summary">
       <div><small>Total utilizado</small><strong data-testid="totalUsed">{result?count(used)+' g':'—'}</strong></div>
       <div><small>Preço médio ponderado</small><strong data-testid="averagePrice">{result?money(average)+'/kg':'—'}</strong></div>
       <div><small>Custo do filamento</small><strong data-testid="materialCost">{result?money(result.material):'—'}</strong></div>
     </div>
     {advanced&&<div id="material-details" hidden={!details}>
      <div className="material-form" role="group" aria-label="Cadastro compacto de filamento">
       <div className="material-form-title"><strong>{editId?'Editar filamento':'Adicionar filamento'}</strong></div>
       <div className="mc-filament-form-groups">
        <fieldset className="mc-filament-form-section mc-filament-catalog">
         <legend>Identificação</legend>
         <div className="mc-filament-form-fields">
          <div className="catalog-field"><div className="catalog-field-heading"><label htmlFor="filament-type">Tipo</label><button type="button" className="catalog-add" aria-label="Cadastrar tipo" title="Cadastrar outro tipo" onClick={()=>setCatalogModal('tipo')}>+</button></div><SmartField browseOnFocus id="filament-type" label="Tipo de filamento" value={draft.type||''} options={list('tipo')} hint="PLA, PETG, TPU e outros tipos. Use o material indicado na bobina." onBlur={v=>remember('tipo',v)} onChange={v=>setDraftText('type',v)}/></div>
          <div className="catalog-field"><div className="catalog-field-heading"><label htmlFor="filament-color">Cor</label><button type="button" className="catalog-add" aria-label="Cadastrar cor" title="Cadastrar outra cor" onClick={()=>setCatalogModal('cor')}>+</button></div><SmartField browseOnFocus id="filament-color" label="Cor do filamento" value={draft.name} options={list('cor')} hint="Ex.: Vermelho Fosco. Nomes novos serão padronizados." onBlur={v=>remember('cor',v)} onChange={v=>setDraftText('name',v)}/></div>
          <div className="catalog-field"><div className="catalog-field-heading"><label htmlFor="filament-brand">Marca</label><button type="button" className="catalog-add" aria-label="Cadastrar marca" title="Cadastrar outra marca" onClick={()=>setCatalogModal('marca')}>+</button></div><SmartField browseOnFocus id="filament-brand" label="Marca do filamento" value={draft.brand||''} options={list('marca')} hint="Selecione a fabricante da bobina, como Masterprint ou SUNLU." onBlur={v=>remember('marca',v)} onChange={v=>setDraftText('brand',v)}/></div>
         </div>
        </fieldset>
        <fieldset className="mc-filament-form-section mc-filament-purchase">
         <legend>Compra da bobina</legend>
         <div className="mc-filament-form-fields">
          <FilamentField id="packageQuantity" label="Embalagem" help="Quantidade comprada na unidade indicada ao lado."><input type="number" min="0.001" step="any" id="packageQuantity" data-testid="packageQuantity" value={display(draft.packageQuantity)} onChange={e=>setDraftNumber('packageQuantity',e.target.value)}/></FilamentField>
          <label className="mc-filament-field"><span className="mc-field-caption">Unidade</span><select aria-label="Unidade da embalagem" value={draft.packageUnit||'kg'} onChange={e=>setDraft(prev=>({...prev,packageUnit:e.target.value as 'kg'|'g'}))}><option value="kg">kg</option><option value="g">g</option></select></label>
          <FilamentField id="packagePrice" label="Preço total (R$)" help={Number.isFinite(draft.packagePrice)&&Number.isFinite(draft.packageQuantity)&&draft.packageQuantity!>0?'Custo equivalente: '+money(draft.packagePrice!/(draft.packageQuantity!*(draft.packageUnit==='kg'?1:.001)))+'/kg.':'Informe quanto pagou pela embalagem completa.'}><input type="number" min="0" step="any" id="packagePrice" data-testid="packagePrice" value={display(draft.packagePrice)} onChange={e=>setDraftNumber('packagePrice',e.target.value)}/></FilamentField>
         </div>
        </fieldset>
        <fieldset className="mc-filament-form-section mc-filament-consumption">
         <legend>Consumo nesta impressão</legend>
         <div className="mc-filament-form-fields">
          <FilamentField id="gramsUsed" label="Modelo (g)" help="Peso do modelo fornecido pelo fatiador."><input type="number" min="0" step="any" id="gramsUsed" data-testid="gramsUsed" value={display(draft.grams)} onChange={e=>setDraftNumber('grams',e.target.value)}/></FilamentField>
          <FilamentField id="wasteGrams" label="Purga (g)" help="Use o valor de Flushed do fatiador, inclusive quando negativo. Em cálculos antigos, confira se a torre já está incluída neste valor."><input type="number" step="any" id="wasteGrams" data-testid="wasteGrams" value={display(draft.wasteGrams)} onChange={e=>setDraftNumber('wasteGrams',e.target.value)}/></FilamentField>
          <FilamentField id="towerGrams" label="Torre (g)" help="Torre de purga. Use a coluna Tower do fatiador. Deixe em branco se não houver torre."><input type="number" min="0" step="any" id="towerGrams" value={display(draft.towerGrams)} onChange={e=>setDraftNumber('towerGrams',e.target.value)}/></FilamentField>
         </div>
         <label className="mc-filament-field mc-measured-waste"><span>Descarte pesado (g)</span>
          <input type="number" min="0" step="any" value={display(draft.measuredWasteGrams)} onChange={e=>setDraftNumber('measuredWasteGrams',e.target.value)}/>
          <small>Pese juntos a purga e o material descartado da torre desta cor. O peso informado substitui a estimativa no custo.</small>
         </label>
         <details className="mc-slicer-details">
          <summary>Metragem do fatiador</summary>
          <div className="mc-slicer-meters">
           {meterFields.map(([key,label])=><label key={key} className="mc-filament-field"><span>{label}</span>
            <input type="number" min={key==='flushed'?undefined:0} step="any" value={display(draft.slicerMeters?.[key])}
             onChange={event=>{const value=optionalNumber(event.target.value);setDraft(previous=>({...previous,slicerMeters:{...previous.slicerMeters,[key]:value}}));setErrorDraft('');}}/>
           </label>)}
          </div>
          <small>Use os valores em metros como referência. O custo do MakerCusto usa os pesos em gramas.</small>
         </details>
        </fieldset>
       </div>
       <div className="form-actions"><button type="button" className="primary-action" onClick={save}>{editId?'Salvar alteração':'Adicionar à tabela'}</button>{editId&&<button type="button" onClick={()=>{setEditId(null);setDraft(newDraft());setErrorDraft('');}}>Cancelar edição</button>}</div>
       {errorDraft&&<p className="error" role="alert">{errorDraft}</p>}
      </div>

      <div className="materials-table-scroll"><table className="materials-table"><thead><tr><th>Filamento</th><th>Marca</th><th>Embalagem</th><th>Preço total</th><th>Consumo total</th><th>Custo</th><th className="material-actions-cell">Ações</th></tr></thead><tbody>
        {detailedMaterials.map(item=>{
         const pkgQty=item.packageQuantity??1,pkgUnit=item.packageUnit??'kg';
         const totalGrams=materialTotalGrams(item);
         const spent=totalGrams*((item.packagePrice??item.pricePerKg*pkgQty*(pkgUnit==='kg'?1:.001))/(pkgQty*(pkgUnit==='kg'?1000:1)));
         return <tr key={item.id} data-testid={'row-'+item.id}>
          <td><strong>{item.name}</strong>{item.type&&<small className="material-row-type"> · {item.type}</small>}</td>
          <td>{item.brand||'—'}</td><td>{count(pkgQty)} {pkgUnit}</td>
          <td>{money(calculatedPackagePrice(item))}</td><td>{count(totalGrams)} g
           {item.measuredWasteGrams!==undefined&&<small className="mc-slicer-reference">Fatiador: {count(estimatedMaterialGrams(item))} g</small>}
           {item.slicerMeters?.total!==undefined&&<small className="mc-slicer-reference">{count(item.slicerMeters.total)} m</small>}
          </td>
          <td className="numeric-cell">{money(spent)}</td>
          <td className="material-actions-cell"><div className="row-actions">
           <button type="button" aria-label={'Editar '+item.name} title="Editar filamento" onClick={()=>edit(item)}>✎</button>
           <button type="button" className="material-remove" aria-label={'Remover '+item.name} title="Remover deste cálculo" onClick={()=>remove(item)}>×</button>
          </div></td>
         </tr>;
        })}
      </tbody><tfoot><tr><th colSpan={4}>Total</th><th>{result?count(used)+' g':'—'}</th><th>{result?money(result.material):'—'}</th><th className="material-actions-cell"/></tr></tfoot></table></div>
      {slicerTotals&&<details className="mc-slicer-details">
       <summary>Totais estimados do fatiador</summary>
       <dl className="mc-slicer-totals">
        <div><dt>Modelo</dt><dd>{count(slicerTotals.model)} g</dd></div>
        <div><dt>Purga</dt><dd>{count(slicerTotals.flushed)} g</dd></div>
        <div><dt>Torre</dt><dd>{count(slicerTotals.tower)} g</dd></div>
        <div><dt>Total</dt><dd>{count(slicerTotals.model+slicerTotals.flushed+slicerTotals.tower)} g</dd></div>
       </dl>
      </details>}
     </div>}
    </section>
    {advanced&&details&&<FilamentProfilePanel brand={draft.brand??''} material={draft.type??''}/>}
     <div className="mc-print-timing">
     <PrintDurationFields label="Tempo de impressão" includeSeconds disabled={hasSlicerTiming}
      value={hasSlicerTiming?splitPrintDuration(estimatedHours,true):printDuration} onChange={setPrintDuration}>
      {printDurationDraft&&!Number.isFinite(form.hours)&&!hasSlicerTiming&&<p className="error" role="alert">Informe horas inteiras e minutos e segundos de 0 a 59.</p>}
     </PrintDurationFields>
     {advanced&&<details className="mc-slicer-details">
      <summary>Resumo do fatiador</summary>
      <PrintDurationFields label="Tempo de preparação" includeSeconds
       value={slicerDurationDrafts.preparation??splitPrintDuration(slicerSummary?.preparation??NaN,true)}
       onChange={value=>updateSlicerDuration('preparation',value)}/>
      <PrintDurationFields label="Tempo do modelo" includeSeconds
       value={slicerDurationDrafts.printing??splitPrintDuration(slicerSummary?.printing??NaN,true)}
       onChange={value=>updateSlicerDuration('printing',value)}/>
      {invalidSlicerTiming&&
       <p className="error" role="alert">Informe horas inteiras e minutos e segundos de 0 a 59.</p>}
      <small>Preencha os dois tempos para calcular o total automaticamente. Se não houver preparação, informe zero.</small>
      <div className="mc-slicer-meters">
       <label className="mc-filament-field"><span>Trocas de filamento</span><input type="number" min="0" step="1"
        value={display(slicerSummary?.changes)} onChange={event=>updateSlicerSummary('changes',optionalNumber(event.target.value))}/></label>
       <label className="mc-filament-field"><span>Custo do fatiador (R$)</span><input type="number" min="0" step="any"
        value={display(slicerSummary?.cost)} onChange={event=>updateSlicerSummary('cost',optionalNumber(event.target.value))}/></label>
      </div>
     </details>}
     {!session&&calculationField('quantity',false)}
     </div>
     {!session&&<p className="footnote">Tarifa, potência e vida útil são hipóteses editáveis. Confira os valores no modo Avançado.</p>}
    </section>
    {advanced&&<section className="mc-cost-block mc-assembly">
     <h3>Montagem e acabamento</h3>
     <div className="fields">{calculationField('assemblyMinutesPerUnit')}{calculationField('laborPerHour')}</div>
    </section>}
    {advanced&&<section className="mc-cost-block mc-extras">
     <h3>Custos adicionais</h3>
     <div className="fields">{calculationField('accessoryPerUnit')}</div>
    </section>}
   </div>
  </div>
  {session&&workspaceId&&<div hidden={!showCompositionEditor}>
   <AssemblyComposer key={workspaceId+'/'+(revisionTarget?.composition?.snapshot_id??revisionTarget?.product_id??identityReset)} workspaceId={workspaceId} active={showCompositionEditor}
    identity={{name:calculatorName,sku:calculatorSku,description,productId:revisionTarget?.product_id}}
    onResult={setCompositionSummary} configuredSalePrice={assemblyPrice}
    selectedComposition={selectedComposition} onRestorePricing={restoreCompositionPricing}
    pricing={{mode:assemblyPricing.mode,targetMarginPercent:assemblyPricing.mode==='margin'?assemblyPricing.target:undefined,
     orderQuantity:Number.isSafeInteger(compositionOrder.quantity)&&compositionOrder.quantity!>0?compositionOrder.quantity:undefined}}
    onSaved={(name,id)=>{
     const message=revisionTarget?'Composição de “'+name+'” salva na mesma ficha.':'Conjunto “'+name+'” salvo na oficina.';
     setCompositionSaved(message);
     void listLatestProductCalculations(workspaceId).then(rows=>{
      const saved=rows.find(item=>item.product_id===id&&item.composition);
      if(saved)applySavedCalculation(saved);
     }).catch(()=>setAccountError('Composição salva. Reabra a ficha em Conjuntos para carregar a nova revisão.'));
    }}
    onViewAssemblies={()=>setActiveSection('assemblies')}/>
  </div>}
  {session&&calculatorTab==="settings"&&<section className="panel mc-tab-panel">
   <h2>Configurações do cálculo</h2>
   <p>Impressora selecionada: {activePrinter.name}</p>
   <div className="form-actions">
    <button type="button" onClick={()=>setPrinterModal("edit")}>Configurar impressora</button>
    <button type="button" onClick={()=>{setAdvanced(true);setCalculatorTab("calculation");}}>Abrir cálculo avançado</button>
   </div>
  </section>}
  {session&&calculatorTab==="notes"&&<section className="panel mc-tab-panel">
   <h2>Observações</h2>
   <label>Descrição (opcional)<textarea aria-label="Descrição do produto" maxLength={2000} value={description} onChange={event=>setDescription(event.target.value)}/></label>
  </section>}
   </div>
   <CalculationResultPanel result={displayedResult} composed={composed} quantity={resultQuantity} title={shareTitle}
    lines={resultLines} filamentDetails={composed?compositionSummary?.filamentDetails:undefined}
    expanded={!composed&&(advanced||Boolean(session))}
    source={session&&calculatorKind==='product'&&(calculatorTab==='composition'||composed||Boolean(selectedComposition)||Boolean(compositionSummary?.partsCount))&&
     <div className="mc-result-source" role="group" aria-label="Origem do resultado">
      <button type="button" className="mc-light-action" aria-pressed={!composed} onClick={()=>setPreferComposition(false)}>Impressão em peça única</button>
      <button type="button" className="mc-light-action" aria-pressed={composed} onClick={()=>setPreferComposition(true)}>Montagem por partes</button>
     </div>}
    sourceNotice={composed?(compositionSummary?.partsCount?count(compositionSummary.partsCount)+' partes na composição':'Selecione as partes para começar'):undefined}
    pricing={<>
    <fieldset className="mc-pricing-mode">
     <legend>Como definir o preço de venda</legend>
     <div className="mc-pricing-options">
      <label><input type="radio" name="pricing-mode" checked={!displayedPriceByMargin} onChange={()=>composed?updateAssemblyPricing({mode:'price'}):setPriceByMargin(false)}/> Preço informado</label>
      <label><input type="radio" name="pricing-mode" checked={displayedPriceByMargin} onChange={()=>composed?updateAssemblyPricing({mode:'margin'}):setPriceByMargin(true)}/> Margem desejada</label>
     </div>
     {displayedPriceByMargin?<div className="mc-number-field">
      <label><span>Margem bruta desejada (%)</span>
       <input type="number" min="0" max="99.99" step="0.01" value={display(composed?assemblyPricing.target:targetMargin)} onChange={event=>composed?updateAssemblyPricing({target:numeric(event.target.value)}):setTargetMargin(numeric(event.target.value))}/>
      </label>
      <CalculatorHelp label="Margem bruta desejada">Percentual do preço de venda que sobra após descontar o custo estimado. O preço por unidade é arredondado para cima em centavos.</CalculatorHelp>
     </div>:calculationField('salePrice',false)}
     {displayedPriceByMargin&&displayedResult&&<p className="mc-calculated-sale-price" aria-live="polite">Preço de venda por unidade <strong>{money(displayedResult.salePrice)}</strong></p>}
     {composed&&assemblyPricing.legacy&&<p className="footnote">{assemblyPricing.legacy}</p>}
    </fieldset>
     {(composed?assemblyError:error)&&<p className="error" role="alert">{composed?assemblyError:error}</p>}
    </>}
    order={{input:composed?compositionOrder:form.orderPlan??{},
     onChange:composed?setCompositionOrder:orderPlan=>setForm(previous=>({...previous,orderPlan})),
     orderRegistration:session&&workspaceId?{workspaceId,snapshotId:composed?selectedComposition?.snapshot_id??null:revisionTarget?.composition?revisionTarget.direct_snapshot_id??null:revisionTarget?.snapshot_id??null,
      productName:shareTitle||undefined,onViewOrders:()=>setActiveSection('orders')}:undefined}}
    product={session&&workspaceId&&revisionTarget?{workspaceId,id:revisionTarget.product_id}:undefined}
    quoteKey={revisionTarget?.snapshot_id??identityReset}
    foot={!session&&<div className="mc-public-account"><span>Quer salvar seus cálculos?</span>
     <button type="button" className="primary-action" onClick={()=>setAuthMode('signup')}>Criar conta</button></div>}/>
  </div>
  </div>
  </>}
  {session&&activeSection==='printers'&&<section className="panel"><h2>Minhas impressoras</h2><button type="button" onClick={addPrinter}>Nova impressora</button>{stored.length===0?<p>Nenhuma impressora cadastrada.</p>:<ul className="dashboard-activity-list">{stored.map(p=><li key={p.id}><strong>{p.name}</strong><button type="button" onClick={()=>{setPrinterId(p.id);setPrinterModal('edit');}}>Editar</button></li>)}</ul>}</section>}
  {session&&activeSection==='orders'&&workspaceId&&<OrdersWorkspace key={workspaceId} workspaceId={workspaceId}/>}
  {session&&activeSection==='workshop'&&<section className="panel"><h2>{workspaceName}</h2><p>Configurações e tarifas da oficina: integração pendente.</p></section>}
  {session&&activeSection==='library'&&<LibraryWorkspace workspaceId={workspaceId}/>}
  {session&&activeSection==='tips'&&<section className="panel"><h2>Dicas de impressão</h2><p>Conteúdo em desenvolvimento.</p></section>}
  {session&&activeSection==='materials'&&<MaterialsWorkspace workspaceId={workspaceId}/>}
  {session&&activeSection==='prints'&&<PrintsWorkspace workspaceId={workspaceId}/>}
  {session&&activeSection==='assemblies'&&compositionSaved&&<p role="status" className="product-success">{compositionSaved}</p>}
  {session&&(activeSection==='products'||activeSection==='assemblies')&&<ProductWorkspace workspaceId={workspaceId} tab={activeSection==='assemblies'?'assemblies':productTab==='parts'?'component':'all'}
   onCalculate={snapshot=>{if(applySavedCalculation(snapshot)){setCalculatorTab("calculation");setActiveSection('calculator');}}}/>}
 </main>{!session&&<footer className="shell footer">MakerCusto · Preview em desenvolvimento · Cadastros na nuvem após login</footer>}
 </SystemNavigation>
 {authMode&&<AuthModal initialSignup={authMode==='signup'} onClose={()=>setAuthMode(null)} onSuccess={()=>{setAuthMode(null);void loadAccount();}}/>}
 {printerModal&&<PrinterModal models={models} confirmChanges={printerModal==='edit'&&!isReferencePrinter} initial={printerModal==="edit"?(stored.find(p=>p.id===printerId)??{id:activePrinter.id,workspace_id:workspaceId??'',model_id:models.find(m=>activePrinter.name.includes(m.name))?.id??null,name:activePrinter.name,purchase_price:activePrinter.printerPrice,average_watts:activePrinter.averageWatts,lifetime_hours:activePrinter.lifetimeHours,active:true}):undefined} onClose={()=>setPrinterModal(null)} onSave={savePrinter}/>}
 {catalogModal&&<CatalogModal title={catalogTitles[catalogModal]} options={list(catalogModal)} onClose={()=>setCatalogModal(null)} onSave={saveCatalog}/>}
 </div>;
}
