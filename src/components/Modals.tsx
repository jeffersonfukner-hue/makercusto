import {similarCatalogName} from '../domain/catalogName';
import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {type CatalogEntry,type PrinterDraft,type StoredPrinter,signIn,signUp} from '../data/supabase';
import {printerPresets,printerPresetLabel,printerReferences,printerEstimatedCosts} from '../data/printerPresets';
import {SmartField,formatCatalogName,matchKey} from './SmartField';
export function Modal({title,onClose,children}: {title:string;onClose:()=>void;children:ReactNode}){
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler);},[onClose]);
 return <div className="modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section className="modal-window" role="dialog" aria-modal="true" aria-label={title}>
   <div className="modal-header"><h2>{title}</h2><button type="button" className="modal-close" onClick={onClose} aria-label="Fechar modal">×</button></div>
   {children}
  </section>
 </div>;
}
export function AuthModal({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}){
 const [signup,setSignup]=useState(false),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');setNotice('');try{
  if(signup){const ready=await signUp(email.trim(),password);if(ready){onSuccess();return;}setNotice('Conta criada. Confirme seu e-mail e depois entre.');}
  else{await signIn(email.trim(),password);onSuccess();}
 }catch(err){setError((err as Error).message);}finally{setBusy(false);}};
 return <Modal title={signup?'Criar minha conta':'Entrar no MakerCusto'} onClose={onClose}>
  <form className="modal-body" onSubmit={submit}>
   <p>Seu cálculo continua livre. Entre somente para salvar impressoras e cadastros na sua oficina.</p>
   <label>E-mail<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label>Senha<input required type="password" minLength={6} autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {error&&<p className="error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
   <div className="modal-actions"><button className="primary-action" type="submit" disabled={busy}>{busy?'Salvando...':signup?'Criar conta':'Entrar'}</button><button type="button" onClick={()=>{setSignup(v=>!v);setError('');setNotice('');}}>{signup?'Já tenho conta':'Criar conta gratuita'}</button></div>
  </form>
 </Modal>;
}
export function PrinterModal({models,initial,onClose,onSave}:{models:CatalogEntry[];initial?:StoredPrinter;onClose:()=>void;onSave:(draft:PrinterDraft)=>Promise<void>}){
 const manufacturerNames=[...new Set([...printerPresets.map(p=>p.brand),...models.map(m=>m.manufacturer).filter((v):v is string=>Boolean(v))])];
 const inferredPreset=printerPresets.find(p=>initial?.name.toLocaleLowerCase('pt-BR').includes(printerPresetLabel(p).toLocaleLowerCase('pt-BR')));
 const matchedModel=models.find(m=>m.id===initial?.model_id);
 const [manufacturer,setManufacturer]=useState(inferredPreset?.brand??matchedModel?.manufacturer??'');
 const [modelSearch,setModelSearch]=useState('');
 const [advanced,setAdvanced]=useState(false),[name,setName]=useState(initial?.name??''),[modelId,setModelId]=useState(initial?.model_id??(inferredPreset?'preset:'+inferredPreset.id:'')),[price,setPrice]=useState(initial?.purchase_price?.toString()??String(printerEstimatedCosts.purchasePrice)),[watts,setWatts]=useState(initial?.average_watts?.toString()??String(printerEstimatedCosts.averageWatts)),[life,setLife]=useState(initial?.lifetime_hours?.toString()??String(printerEstimatedCosts.lifetimeHours)),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pool=[...printerPresets.filter(p=>p.brand===manufacturer).map(p=>({id:'preset:'+p.id,label:p.model,preset:p})),
 ...models.filter(m=>m.manufacturer===manufacturer&&!printerPresets.some(p=>matchKey(p.model)===matchKey(m.name)&&p.brand===manufacturer)).map(m=>({id:m.id,label:m.name,preset:undefined}))];
 const filtered=pool.filter(p=>matchKey(p.label).includes(matchKey(modelSearch)));
 const selectedPreset=printerPresets.find(p=>'preset:'+p.id===modelId);
 const reference=selectedPreset?printerReferences[selectedPreset.id]:undefined;
 const effectivePrice=price.trim()?Number(price):printerEstimatedCosts.purchasePrice;
 const effectiveWatts=watts.trim()?Number(watts):printerEstimatedCosts.averageWatts;
 const effectiveLife=life.trim()?Number(life):printerEstimatedCosts.lifetimeHours;
 const choose=(id:string)=>{
  setModelId(id);const preset=printerPresets.find(p=>'preset:'+p.id===id),m=models.find(x=>x.id===id);
  if(preset){setName(printerPresetLabel(preset));setModelSearch('');}
  else if(m){setName([m.manufacturer,m.name].filter(Boolean).join(' '));setModelSearch('');}
  if(!initial){setPrice(String(printerEstimatedCosts.purchasePrice));setWatts(String(printerEstimatedCosts.averageWatts));setLife(String(printerEstimatedCosts.lifetimeHours));}
 };
 const submit=async(e:FormEvent)=>{e.preventDefault();
  const p=Number(price),w=Number(watts),l=Number(life);
  if(!name.trim()){setError('Informe o nome da sua impressora.');return;}
  if(!Number.isFinite(p)||p<0||!Number.isFinite(w)||w<0||!Number.isFinite(l)||l<=0){setError('Confira os custos e a vida útil.');return;}
  setBusy(true);setError('');
  try{await onSave({name:formatCatalogName(name,selectedPreset?[printerPresetLabel(selectedPreset)]:[]),model_id:modelId.startsWith('preset:')?(models.find(m=>m.manufacturer===selectedPreset?.brand&&matchKey(m.name)===matchKey(selectedPreset?.model??''))?.id??null):modelId||null,purchase_price:p,average_watts:w,lifetime_hours:l});onClose();}
  catch(err){setError((err as Error).message);}finally{setBusy(false);}
 };
 return <Modal title={initial?'Personalizar impressora':'Cadastrar impressora'} onClose={onClose}>
  <form className="modal-body" onSubmit={submit}>
   <label>Fabricante<select aria-label="Fabricante da impressora" value={manufacturer} onChange={e=>{setManufacturer(e.target.value);setModelId('');setModelSearch('');}}>
    <option value="">Selecione o fabricante</option>{manufacturerNames.map(m=><option key={m} value={m}>{m}</option>)}
   </select></label>
   <label>Modelo<select aria-label="Modelo da impressora" value={modelId} disabled={!manufacturer} onChange={e=>choose(e.target.value)}>
    <option value="">Selecione um modelo</option>{filtered.map(m=><option key={m.id} value={m.id}>{manufacturer} {m.label}</option>)}
   </select></label>
   {manufacturer&&<div className="printer-model-search"><SmartField label="Pesquisar modelo" value={modelSearch} onChange={value=>{setModelSearch(value);const match=pool.find(p=>matchKey(p.label)===matchKey(value));if(match)choose(match.id);}} options={pool.map(x=>x.label)} hint="Mostramos até três correspondências durante a digitação." placeholder="Ex.: Kobra" /></div>}
   <p className="printer-preset-note">{selectedPreset?'Ficha de referência: '+printerPresetLabel(selectedPreset)+'. Custos abaixo são estimativas editáveis.':'Escolha fabricante e modelo para usar valores iniciais prontos.'}</p>
   {reference&&<div className="printer-reference"><strong>Ficha técnica</strong>{reference.buildVolume&&<span>Volume: {reference.buildVolume}</span>}{reference.nozzleDiameter&&<span>Bico padrão: {reference.nozzleDiameter} mm</span>}{reference.maxNozzleTemp&&<span>Bico até {reference.maxNozzleTemp} °C</span>}{reference.maxBedTemp&&<span>Mesa até {reference.maxBedTemp} °C</span>}{reference.source&&<a href={reference.source} target="_blank" rel="noreferrer">Fonte do fabricante</a>}</div>}
   <label>Nome da minha impressora<input required aria-label="Nome da minha impressora" placeholder="Ex.: Aninha" value={name} onChange={e=>setName(e.target.value)}/></label>
   <small className="smart-hint">O modelo original fica protegido. Você pode renomear a sua cópia.</small>
   <div className="modal-section-switch"><button type="button" aria-expanded={advanced} onClick={()=>setAdvanced(v=>!v)}>{advanced?'Ocultar parâmetros avançados':'Avançado — custos e consumo'} <span aria-hidden="true">{advanced?'−':'+'}</span></button></div>
   {advanced&&<div className="modal-extra">
    <label>Valor de aquisição (R$)<input type="number" aria-label="Valor pago (R$)" min="0" step="any" value={price} onChange={e=>setPrice(e.target.value)}/></label>
    <small className="smart-hint">Valor inicial estimado: R$ 3.500. Substitua pelo valor efetivamente pago quando souber.</small>
    <label>Potência média estimada (W)<input type="number" min="0" step="any" value={watts} onChange={e=>setWatts(e.target.value)}/></label>
    <small className="smart-hint">150 W é hipótese de consumo durante impressão, não potência máxima do equipamento.</small>
    <label>Vida útil estimada (horas)<input type="number" min="0.01" step="any" value={life} onChange={e=>setLife(e.target.value)}/></label>
    <div className="printer-estimates"><strong>Custo por hora (estimado)</strong><div><span>Consumo</span><b>{(effectiveWatts/1000).toLocaleString('pt-BR',{maximumFractionDigits:3})} kWh/h</b></div><div><span>Depreciação</span><b>{(effectivePrice/effectiveLife).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}/h</b></div><small>Tarifa de energia é configurada por oficina. Ajuste estes valores à sua realidade quando desejar.</small></div>
   </div>}
   {error&&<p className="error" role="alert">{error}</p>}
   <div className="modal-actions"><button type="submit" className="primary-action" disabled={busy}>{busy?'Salvando...':initial?'Salvar personalização':'Salvar impressora'}</button><button type="button" onClick={onClose}>Cancelar</button></div>
  </form>
 </Modal>;
}

export function CatalogModal({title,options,onClose,onSave}:{title:string;options:string[];onClose:()=>void;onSave:(name:string)=>Promise<void>}){
 const [name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const similar=similarCatalogName(name,options);
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!name.trim()){setError('Informe um nome.');return;}setBusy(true);setError('');
  try{await onSave(formatCatalogName(name,options));onClose();}catch(err){setError((err as Error).message);}finally{setBusy(false);}
 };
 return <Modal title={'Cadastrar '+title.toLowerCase()} onClose={onClose}>
  <form className="modal-body" onSubmit={submit}>
   <label>Nome<input required autoFocus value={name} onChange={e=>setName(e.target.value)} aria-label={'Nome de '+title.toLowerCase()}/></label>
   {similar&&<p role="status">Já existe uma opção parecida: <strong>{similar}</strong>. Confira a grafia antes de salvar.</p>}
   {error&&<p role="alert" className="error">{error}</p>}
   <div className="modal-actions"><button type="submit" className="primary-action" disabled={busy}>{busy?'Salvando...':'Salvar cadastro'}</button><button type="button" onClick={onClose}>Cancelar</button></div>
  </form>
 </Modal>;
}
