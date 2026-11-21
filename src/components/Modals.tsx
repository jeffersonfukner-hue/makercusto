import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {type CatalogEntry,type PrinterDraft,type StoredPrinter,signIn,signUp} from '../data/supabase';
import {printerPresets,printerPresetLabel} from '../data/printerPresets';
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
const numberValue=(value:string)=>value.trim()===''?null:Number(value);
export function PrinterModal({models,initial,onClose,onSave}:{models:CatalogEntry[];initial?:StoredPrinter;onClose:()=>void;onSave:(draft:PrinterDraft)=>Promise<void>}){
 const [advanced,setAdvanced]=useState(false),[name,setName]=useState(initial?.name??''),[modelId,setModelId]=useState(initial?.model_id??''),[price,setPrice]=useState(initial?.purchase_price?.toString()??''),[watts,setWatts]=useState(initial?.average_watts?.toString()??''),[life,setLife]=useState(initial?.lifetime_hours?.toString()??''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const selectedPreset=printerPresets.find(p=>'preset:'+p.id===modelId);
 const estimatedHourlyEnergy=watts.trim()!==''&&Number.isFinite(Number(watts))?Number(watts)/1000:null;
 const estimatedHourlyDepreciation=price.trim()!==''&&life.trim()!==''&&Number(life)>0?Number(price)/Number(life):null;
 const submit=async(e:FormEvent)=>{e.preventDefault();const p=numberValue(price),w=numberValue(watts),l=numberValue(life);
  if(!name.trim()){setError('Informe o nome da sua impressora.');return;}
  if([p,w,l].some(n=>n!==null&&(!Number.isFinite(n)||n<0))||(l!==null&&l===0)){setError('Confira os valores e a vida útil informados.');return;}
  setBusy(true);setError('');try{await onSave({name:name.trim(),model_id:modelId.startsWith('preset:')?null:modelId||null,purchase_price:p,average_watts:w,lifetime_hours:l});onClose();}catch(err){setError((err as Error).message);}finally{setBusy(false);}};
 return <Modal title={initial?'Editar impressora':'Cadastrar impressora'} onClose={onClose}>
 <form className="modal-body" onSubmit={submit}>
  <label>Fabricante e modelo<select aria-label="Modelo da impressora" value={modelId} onChange={e=>{const id=e.target.value;setModelId(id);const preset=printerPresets.find(p=>'preset:'+p.id===id);const m=models.find(x=>x.id===id);if(preset)setName(printerPresetLabel(preset));else if(m)setName([m.manufacturer,m.name].filter(Boolean).join(' '));}}>
   <option value="">Outro / informar manualmente</option>
   {['Bambu Lab','Anycubic','Creality','Elegoo','Prusa','Flashforge','Sovol','QIDI Tech'].map(brand=><optgroup key={brand} label={brand}>{printerPresets.filter(p=>p.brand===brand).map(p=><option key={p.id} value={'preset:'+p.id}>{printerPresetLabel(p)}</option>)}</optgroup>)}
   {models.filter(m=>!printerPresets.some(p=>printerPresetLabel(p).toLocaleLowerCase('pt-BR')===[m.manufacturer,m.name].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR'))).length>0&&<optgroup label="Catálogo da oficina / nuvem">{models.filter(m=>!printerPresets.some(p=>printerPresetLabel(p).toLocaleLowerCase('pt-BR')===[m.manufacturer,m.name].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR'))).map(m=><option key={m.id} value={m.id}>{[m.manufacturer,m.name].filter(Boolean).join(' ')}</option>)}</optgroup>}
  </select></label>
  <p className="printer-preset-note">{selectedPreset?'Modelo de referência · '+selectedPreset.technology+'. Os parâmetros financeiros são pessoais, não especificações do fabricante.':'Selecione uma referência disponível sem login ou informe um modelo personalizado.'}</p>
  <label>Nome da minha impressora<input required autoFocus aria-label="Nome da minha impressora" placeholder="Ex.: Kobra X da bancada" value={name} onChange={e=>setName(e.target.value)}/></label>
  <div className="modal-section-switch"><button type="button" aria-expanded={advanced} onClick={()=>setAdvanced(v=>!v)}>{advanced?'Ocultar parâmetros avançados':'Avançado — custos e consumo'} <span aria-hidden="true">{advanced?'−':'+'}</span></button></div>
  {advanced&&<div className="modal-extra">
   <label>Valor pago (R$)<input type="number" min="0" step="any" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Informe quando souber"/></label>
   <label>Potência média estimada (W)<input type="number" min="0" step="any" value={watts} onChange={e=>setWatts(e.target.value)} placeholder="Informe sua estimativa"/></label>
   <label>Vida útil estimada (horas)<input type="number" min=".01" step="any" value={life} onChange={e=>setLife(e.target.value)} placeholder="Informe sua estimativa"/></label>
   <div className="printer-estimates" aria-label="Conferência dos parâmetros"><strong>Conferência do custo por hora</strong><div><span>Consumo médio informado</span><b>{estimatedHourlyEnergy===null?'—':estimatedHourlyEnergy.toLocaleString('pt-BR',{maximumFractionDigits:3})+' kWh/h'}</b></div><div><span>Depreciação estimada</span><b>{estimatedHourlyDepreciation===null?'—':estimatedHourlyDepreciation.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})+'/h'}</b></div><small>Energia (R$/h) depende da tarifa da sua oficina. Preço de compra e vida útil variam por equipamento e uso.</small></div>
   <p className="footnote">Os valores são pessoais e editáveis. Potência média de impressão não é a potência máxima nominal; confirme com medição sempre que possível.</p>
  </div>}
  {error&&<p className="error" role="alert">{error}</p>}
  <div className="modal-actions"><button type="submit" className="primary-action" disabled={busy}>{busy?'Salvando...':'Salvar impressora'}</button><button type="button" onClick={onClose}>Cancelar</button></div>
 </form>
 </Modal>;
}

export function CatalogModal({title,onClose,onSave}:{title:string;onClose:()=>void;onSave:(name:string)=>Promise<void>}){
 const [name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!name.trim()){setError('Informe um nome.');return;}setBusy(true);setError('');
  try{await onSave(name.trim());onClose();}catch(err){setError((err as Error).message);}finally{setBusy(false);}
 };
 return <Modal title={'Cadastrar '+title.toLowerCase()} onClose={onClose}>
  <form className="modal-body" onSubmit={submit}>
   <label>Nome<input required autoFocus value={name} onChange={e=>setName(e.target.value)} aria-label={'Nome de '+title.toLowerCase()}/></label>
   <p>Seu cadastro pessoal não altera o catálogo oficial.</p>
   {error&&<p role="alert" className="error">{error}</p>}
   <div className="modal-actions"><button type="submit" className="primary-action" disabled={busy}>{busy?'Salvando...':'Salvar cadastro'}</button><button type="button" onClick={onClose}>Cancelar</button></div>
  </form>
 </Modal>;
}
