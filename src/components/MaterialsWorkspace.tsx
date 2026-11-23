import {useEffect,useRef,useState} from 'react';
import {listExistingSpools,registerExistingSpool,type ExistingSpool,type ExistingSpoolDraft} from '../data/supabase';

type Props={workspaceId:string|null};
const ptMoney=(amount:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(amount);
const grams=(amount:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:3}).format(amount)+' g';
const newKey=()=>typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():'initial-'+Date.now()+'-'+Math.random().toString(36).slice(2);
export function MaterialsWorkspace({workspaceId}:Props){
 const [rows,setRows]=useState<ExistingSpool[]>([]);
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [show,setShow]=useState(false);
 const [name,setName]=useState('');
 const [label,setLabel]=useState('');
 const [mass,setMass]=useState('');
 const [basis,setBasis]=useState<ExistingSpoolDraft['basis']>('informed');
 const [cost,setCost]=useState('');
 const [notes,setNotes]=useState('');
 const [error,setError]=useState('');
 const [feedback,setFeedback]=useState('');
 const [reload,setReload]=useState(0);
 const key=useRef(newKey());
 useEffect(()=>{
  let alive=true;
  if(!workspaceId){setRows([]);return;}
  setLoading(true);setError('');
  void listExistingSpools(workspaceId).then(data=>{if(alive)setRows(data);})
   .catch(e=>{if(alive)setError('Falha ao carregar bobinas: '+(e as Error).message);})
   .finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[workspaceId,reload]);
 const save=async()=>{
  setError('');setFeedback('');
  if(!workspaceId){setError('Oficina não conectada.');return;}
  const parsedMass=Number(mass),parsedCost=cost.trim()===''?null:Number(cost);
  if(name.trim().length<3||label.trim().length<2){setError('Informe o nome do filamento e uma identificação da bobina.');return;}
  if(!Number.isFinite(parsedMass)||parsedMass<=0||parsedMass>1000000||Math.abs(parsedMass*1000-Math.round(parsedMass*1000))>0.000001){
   setError('Informe a quantidade física positiva em gramas, com até 3 casas decimais.');return;
  }
  if(parsedCost!==null&&(!Number.isFinite(parsedCost)||parsedCost<0||parsedCost>100000000||Math.round(parsedCost*100)/100!==parsedCost)){
   setError('Confira o custo do saldo: informe reais com até 2 casas decimais, ou deixe vazio.');return;
  }
  setBusy(true);
  try{
   await registerExistingSpool(workspaceId,{idempotencyKey:key.current,name:name.trim(),label:label.trim(),grams:parsedMass,basis,remainingCost:parsedCost,notes:notes.trim()});
   setFeedback('Bobina inventariada. Entrada física registrada uma única vez; nenhuma compra ou fornecedor fictício foi criado.');
   key.current=newKey();setShow(false);setName('');setLabel('');setMass('');setCost('');setNotes('');setBasis('informed');
   setReload(v=>v+1);
  }catch(e){setError('Não foi possível inventariar: '+(e as Error).message);}
  finally{setBusy(false);}
 };
 return <section className="materials-workspace" aria-label="Filamentos e bobinas da oficina">
  <div className="product-workspace-heading"><div><h2>Filamentos e bobinas</h2>
    <p>Cadastre uma bobina que já existe fisicamente, mesmo sem nota fiscal ou compra registrada.</p></div>
   <button type="button" className="primary-action" onClick={()=>{setShow(!show);setError('');}}>+ Inventariar bobina</button>
  </div>
  {error&&<p role="alert" className="error">{error}</p>}
  {feedback&&<p role="status" className="product-success">{feedback}</p>}
  {show&&<div className="materials-form panel">
   <h3>Inventário inicial de bobina existente</h3>
   <p className="footnote">Preencha apenas o que sabe. A quantidade precisa representar o filamento disponível agora, não o peso impresso na embalagem quando nova.</p>
   <div className="product-save-fields">
    <label>Filamento<input aria-label="Nome do filamento" placeholder="Ex.: PETG Masterprint Branco" maxLength={150} value={name} onChange={e=>setName(e.target.value)}/>
     <small>Nome que identifica tipo, fabricante e cor. Este cadastro não altera referências globais.</small></label>
    <label>Identificação da bobina<input aria-label="Identificação da bobina" placeholder="Ex.: PETG Branco — bobina 1" maxLength={150} value={label} onChange={e=>setLabel(e.target.value)}/>
     <small>Use um nome que distinga bobinas do mesmo material.</small></label>
    <label>Saldo físico atual (g)<input aria-label="Saldo físico atual" type="number" step=".001" min=".001" value={mass} onChange={e=>setMass(e.target.value)}/>
     <small>Informe gramas restantes; sem descontar novamente o peso do carretel.</small></label>
    <label>Origem da quantidade<select aria-label="Origem da quantidade" value={basis} onChange={e=>setBasis(e.target.value as ExistingSpoolDraft['basis'])}>
     <option value="measured">Medida com balança</option><option value="informed">Informada por mim</option><option value="estimated">Estimativa visual</option>
    </select><small>Uma estimativa não é tratada como medição.</small></label>
    <label>Valor estimado do saldo (R$, opcional)<input aria-label="Valor estimado do saldo" type="number" step=".01" min="0" placeholder="Deixe vazio se desconhecido" value={cost} onChange={e=>setCost(e.target.value)}/>
     <small>É o custo estimado do filamento restante, não necessariamente o valor pago por uma bobina nova.</small></label>
    <label>Observações (opcional)<input aria-label="Observações da bobina" maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)}/>
     <small>Ex.: origem da estimativa, pesagem, data ou etiqueta.</small></label>
   </div>
   <div className="product-workspace-buttons">
    <button type="button" className="secondary-action" disabled={busy} onClick={()=>setShow(false)}>Cancelar</button>
    <button type="button" className="primary-action" disabled={busy||!workspaceId} onClick={()=>void save()}>{busy?'Registrando bobina…':'Registrar bobina existente'}</button>
   </div>
  </div>}
  <div className="materials-list">
   <h3>Bobinas inventariadas</h3>
   {loading?<p role="status">Consultando estoque…</p>:rows.length===0?<p>Nenhuma bobina inventariada nesta oficina. Ainda não existe saldo cadastrado.</p>:
    <div className="materials-spool-grid">{rows.map(row=><article className="materials-spool-card" key={row.id}>
     <span className="product-kind">{row.cost_status==='unknown'?'Custo desconhecido':'Custo estimado'}</span>
     <h4>{row.label}</h4><p>{row.name}</p>
     <dl><div><dt>Saldo atual</dt><dd>{grams(Number(row.remaining_grams))}</dd></div>
     <div><dt>Saldo inicial</dt><dd>{grams(Number(row.initial_grams))}</dd></div>
     <div><dt>Custo do saldo</dt><dd>{row.remaining_cost_estimate===null?'Não informado':ptMoney(Number(row.remaining_cost_estimate))}</dd></div></dl>
     <small>{row.notes||'Inventário sem observações'}</small>
    </article>)}</div>}
  </div>
  <p className="footnote">Inventariar registra uma entrada física auditável, sem criar compra fictícia. Simular um custo não baixa estoque; a confirmação de produção será implementada separadamente.</p>
 </section>;
}
