import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {type CatalogEntry,type PrinterDraft,type StoredPrinter,signIn,signUp} from '../data/supabase';
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
 const submit=async(e:FormEvent)=>{e.preventDefault();const p=numberValue(price),w=numberValue(watts),l=numberValue(life);
  if(!name.trim()){setError('Informe o nome da sua impressora.');return;}
  if([p,w,l].some(n=>n!==null&&(!Number.isFinite(n)||n<0))||(l!==null&&l===0)){setError('Confira os valores e a vida útil informados.');return;}
  setBusy(true);setError('');try{await onSave({name:name.trim(),model_id:modelId||null,purchase_price:p,average_watts:w,lifetime_hours:l});onClose();}catch(err){setError((err as Error).message);}finally{setBusy(false);}};
 return <Modal title={initial?'Editar impressora':'Cadastrar impressora'} onClose={onClose}>
 <form className="modal-body" onSubmit={submit}>
  <label>Modelo<select aria-label="Modelo da impressora" value={modelId} onChange={e=>{const id=e.target.value;setModelId(id);const m=models.find(x=>x.id===id);if(m&&!initial)setName([m.manufacturer,m.name].filter(Boolean).join(' '));}}>
   <option value="">Outro / sem modelo definido</option>{models.map(m=><option key={m.id} value={m.id}>{[m.manufacturer,m.name].filter(Boolean).join(' ')}</option>)}
  </select></label>
  <label>Nome da minha impressora<input required autoFocus aria-label="Nome da minha impressora" placeholder="Ex.: Kobra X da bancada" value={name} onChange={e=>setName(e.target.value)}/></label>
  <div className="modal-section-switch"><button type="button" aria-expanded={advanced} onClick={()=>setAdvanced(v=>!v)}>{advanced?'Menos opções':'Avançado — custos e consumo'}</button></div>
  {advanced&&<div className="modal-extra">
   <label>Valor pago (R$)<input type="number" min="0" step="any" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Informe quando souber"/></label>
   <label>Potência média estimada (W)<input type="number" min="0" step="any" value={watts} onChange={e=>setWatts(e.target.value)} placeholder="Informe sua estimativa"/></label>
   <label>Vida útil estimada (horas)<input type="number" min=".01" step="any" value={life} onChange={e=>setLife(e.target.value)} placeholder="Informe sua estimativa"/></label>
   <p className="footnote">Esses valores são individuais e editáveis. Nunca tratamos estimativas como especificações oficiais.</p>
  </div>}
  {error&&<p className="error" role="alert">{error}</p>}
  <div className="modal-actions"><button type="submit" className="primary-action" disabled={busy}>{busy?'Salvando...':'Salvar impressora'}</button><button type="button" onClick={onClose}>Cancelar</button></div>
 </form>
 </Modal>;
}
