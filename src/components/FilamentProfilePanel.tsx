import {CalculatorHelp} from './CalculatorHelp';
import {useState} from 'react';
import {chooseSlicerProfile,type SlicerProfile} from '../data/filamentProfiles';
import {formatCatalogName,matchKey} from './SmartField';
const STORAGE='makercusto:perfis-filamento:v1';
type Personal=SlicerProfile&{sourceId:string};
function load():Personal[]{try{const arr:unknown=JSON.parse(localStorage.getItem(STORAGE)||'[]');return Array.isArray(arr)?arr.filter((v):v is Personal=>v!==null&&typeof v==='object'&&typeof v.id==='string'&&typeof v.sourceId==='string').slice(0,100):[];}catch{return [];}}
export function FilamentProfilePanel({brand,material}:{brand:string;material:string}){
 const base=chooseSlicerProfile(brand,material);
 const [personal,setPersonal]=useState<Personal[]>(load);
 const [selection,setSelection]=useState('');
 const [editing,setEditing]=useState(false);
 const [editingId,setEditingId]=useState<string|null>(null);
 const [saveError,setSaveError]=useState('');
 const [form,setForm]=useState<SlicerProfile|null>(null);
 const scoped=personal.filter(p=>p.sourceId===base?.id);
 const profile=scoped.find(p=>p.id===selection)??base;
 if(!base)return null;
 const clone=()=>{setEditingId(null);setSaveError('');setForm({...profile!,id:'',name:profile!.name.replace(' — referência','').replace(' — ponto de partida','')+' — Meu perfil'});setEditing(true);};
 const editPersonal=()=>{const own=scoped.find(p=>p.id===selection);if(!own)return;setEditingId(own.id);setForm({...own});setSaveError('');setEditing(true);};
 const update=(field:keyof Pick<SlicerProfile,'name'|'nozzle'|'bed'|'speed'|'fan'|'retraction'|'drying'>,value:string)=>setForm(old=>old?{...old,[field]:value}:old);
 const save=()=>{
  if(!form?.name.trim()){setSaveError('Informe um nome para o perfil.');return;}
  const canonicalName=formatCatalogName(form.name);
  if(scoped.some(p=>p.id!==editingId&&matchKey(p.name)===matchKey(canonicalName))||matchKey(base.name)===matchKey(canonicalName)){
   setSaveError('Já existe um perfil com esse nome. Escolha outro para preservar os dois.');return;
  }
  if(editingId&&!window.confirm('Salvar as alterações do perfil "'+canonicalName+'"?'))return;
  const next:Personal={...form,id:editingId??'personal-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:canonicalName,sourceId:base.id,classification:'estimativa inicial',sourceLabel:'Cópia personalizada de '+base.name};
  const arr=editingId?personal.map(p=>p.id===editingId&&p.sourceId===base.id?next:p):[...personal,next];
  setPersonal(arr);setSelection(next.id);setEditing(false);setEditingId(null);setSaveError('');
  try{localStorage.setItem(STORAGE,JSON.stringify(arr));}catch{/* persiste só nesta sessão */}
 };
 return <section className="filament-profile" aria-label="Configuração de filamento para slicer">
  <div className="filament-profile-head"><div className="mc-profile-title"><strong>Configurações para o slicer</strong>
   <CalculatorHelp label="Configurações para o slicer">Ajuste os parâmetros conforme máquina, bico e peça. O perfil não altera o custo. Cópias pessoais ficam neste navegador e preservam o original.</CalculatorHelp>
  </div><div className="profile-head-actions"><button type="button" className="details-button" onClick={clone}>Clonar e personalizar</button>{selection&&scoped.some(p=>p.id===selection)&&<button type="button" className="details-button" onClick={editPersonal}>Editar meu perfil</button>}</div></div>
  {scoped.length>0&&<label>Perfil<select aria-label="Perfil do filamento" value={selection} onChange={e=>setSelection(e.target.value)}><option value="">Padrão protegido · {base.name}</option>{scoped.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
  <div className="filament-profile-data"><div><span>Bico</span><strong>{profile?.nozzle}</strong></div><div><span>Mesa</span><strong>{profile?.bed}</strong></div><div><span>Velocidade</span><strong>{profile?.speed}</strong></div><div><span>Ventilação</span><strong>{profile?.fan}</strong></div><div><span>Retração</span><strong>{profile?.retraction}</strong></div><div><span>Secagem</span><strong>{profile?.drying}</strong></div></div>
  <p className="smart-hint">{profile?.sourceLabel}{profile?.sourceUrl&&<> · <a href={profile.sourceUrl} target="_blank" rel="noreferrer">Consultar fonte</a></>}</p>
  {editing&&form&&<div className="profile-edit" role="group" aria-label="Personalizar perfil de filamento"><strong>{editingId?'Editar perfil pessoal':'Nova cópia pessoal'}</strong>
   <label>Nome da configuração<input aria-label="Nome da configuração" value={form.name} onChange={e=>update('name',e.target.value)}/></label>
   {([['nozzle','Bico'],['bed','Mesa'],['speed','Velocidade'],['fan','Ventilação'],['retraction','Retração'],['drying','Secagem']] as const).map(([k,l])=><label key={k}>{l}<input aria-label={l+' do perfil'} value={form[k]} onChange={e=>update(k,e.target.value)}/></label>)}
   {saveError&&<p role="alert" className="error">{saveError}</p>}
   <div className="form-actions"><button type="button" className="primary-action" onClick={save}>{editingId?'Salvar alterações':'Salvar meu perfil'}</button><button type="button" onClick={()=>{setEditing(false);setEditingId(null);setSaveError('');}}>Cancelar</button></div>
  </div>}
 </section>;
}
