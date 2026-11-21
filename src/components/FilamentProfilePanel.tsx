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
 const [saveError,setSaveError]=useState('');
 const [form,setForm]=useState<SlicerProfile|null>(null);
 const scoped=personal.filter(p=>p.sourceId===base?.id);
 const profile=scoped.find(p=>p.id===selection)??base;
 if(!base)return <p className="smart-hint">Perfil técnico ainda não disponível para este tipo. Consulte as recomendações do fabricante antes de configurar o slicer.</p>;
 const clone=()=>{setSaveError('');setForm({...profile!,id:'',name:profile!.name.replace(' — referência','').replace(' — ponto de partida','')+' — Meu perfil'});setEditing(true);};
 const update=(field:keyof Pick<SlicerProfile,'name'|'nozzle'|'bed'|'speed'|'fan'|'retraction'|'drying'>,value:string)=>setForm(old=>old?{...old,[field]:value}:old);
 const save=()=>{
  if(!form?.name.trim()){setSaveError('Informe um nome para o perfil.');return;}
  const canonicalName=formatCatalogName(form.name);
  if(scoped.some(p=>matchKey(p.name)===matchKey(canonicalName))||matchKey(base.name)===matchKey(canonicalName)){
   setSaveError('Já existe um perfil com esse nome. Escolha outro para preservar os dois.');return;
  }
  const next:Personal={...form,id:'personal-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:canonicalName,sourceId:base.id,classification:'estimativa inicial',sourceLabel:'Cópia personalizada de '+base.name};
  const arr=[...personal,next];setPersonal(arr);setSelection(next.id);setEditing(false);setSaveError('');
  try{localStorage.setItem(STORAGE,JSON.stringify(arr));}catch{/* persiste só nesta sessão */}
 };
 return <section className="filament-profile" aria-label="Configuração de filamento para slicer">
  <div className="filament-profile-head"><div><strong>Configurações para o slicer</strong><small>Referência consultável; não altera o custo do filamento</small></div><button type="button" className="details-button" onClick={clone}>Clonar e personalizar</button></div>
  {scoped.length>0&&<label>Perfil<select aria-label="Perfil do filamento" value={selection} onChange={e=>setSelection(e.target.value)}><option value="">Padrão protegido · {base.name}</option>{scoped.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
  <div className="filament-profile-data"><div><span>Bico</span><strong>{profile?.nozzle}</strong></div><div><span>Mesa</span><strong>{profile?.bed}</strong></div><div><span>Velocidade</span><strong>{profile?.speed}</strong></div><div><span>Ventilação</span><strong>{profile?.fan}</strong></div><div><span>Retração</span><strong>{profile?.retraction}</strong></div><div><span>Secagem</span><strong>{profile?.drying}</strong></div></div>
  <p className="smart-hint">{profile?.sourceLabel}{profile?.sourceUrl&&<> · <a href={profile.sourceUrl} target="_blank" rel="noreferrer">Consultar fonte</a></>}. Ajuste os parâmetros conforme máquina, bico e peça.</p>
  {editing&&form&&<div className="profile-edit" role="group" aria-label="Personalizar perfil de filamento">
   <label>Nome da configuração<input aria-label="Nome da configuração" value={form.name} onChange={e=>update('name',e.target.value)}/></label>
   {([['nozzle','Bico'],['bed','Mesa'],['speed','Velocidade'],['fan','Ventilação'],['retraction','Retração'],['drying','Secagem']] as const).map(([k,l])=><label key={k}>{l}<input aria-label={l+' do perfil'} value={form[k]} onChange={e=>update(k,e.target.value)}/></label>)}
   {saveError&&<p role="alert" className="error">{saveError}</p>}
   <div className="form-actions"><button type="button" className="primary-action" onClick={save}>Salvar meu perfil</button><button type="button" onClick={()=>setEditing(false)}>Cancelar</button></div>
   <small className="smart-hint">Cópia armazenada neste navegador. O perfil original permanece intacto.</small>
  </div>}
 </section>;
}
