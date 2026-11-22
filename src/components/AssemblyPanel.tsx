import {useEffect,useState} from 'react';
import {createAssembly,listAssemblies,type AssemblyRecord,type AssemblyPartDraft,type Session} from '../data/supabase';

type Props={session:Session|null;workspaceId:string|null;onLogin:()=>void};
const initialParts=():AssemblyPartDraft[]=>[
 {name:'Lançador',quantity:1,notes:'',grams:null},
 {name:'Haste',quantity:1,notes:'',grams:null},
 {name:'Hélice',quantity:1,notes:'',grams:null}
];
const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export function AssemblyPanel({session,workspaceId,onLogin}:Props){
 const [name,setName]=useState('Lançador de hélices');
 const [sku,setSku]=useState('');
 const [description,setDescription]=useState('Brinquedo montado com lançador, haste de conexão e hélice.');
 const [price,setPrice]=useState('');
 const [parts,setParts]=useState<AssemblyPartDraft[]>(initialParts);
 const [assemblies,setAssemblies]=useState<AssemblyRecord[]>([]);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [feedback,setFeedback]=useState('');
 const [refresh,setRefresh]=useState(0);
 const [open,setOpen]=useState<string|null>(null);
 useEffect(()=>{
  let alive=true;
  if(!session||!workspaceId){setAssemblies([]);return;}
  setLoading(true);
  void listAssemblies(workspaceId).then(rows=>{if(alive){setAssemblies(rows);setError('');}})
   .catch(e=>{if(alive)setError('Não foi possível consultar conjuntos: '+(e as Error).message);})
   .finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[session?.user.id,workspaceId,refresh]);
 const change=(index:number,update:Partial<AssemblyPartDraft>)=>setParts(previous=>previous.map((p,i)=>i===index?{...p,...update}:p));
 const save=async()=>{
  setFeedback('');setError('');
  if(!session||!workspaceId){onLogin();return;}
  if(name.trim().length<2){setError('Informe o nome do conjunto.');return;}
  if(parts.length<2||parts.some(p=>p.name.trim().length<1||!Number.isSafeInteger(p.quantity)||p.quantity<1||p.quantity>100000||
   (p.grams!==null&&(!Number.isFinite(p.grams)||p.grams<0||p.grams>100000)))){
   setError('Informe pelo menos duas peças válidas, com quantidades inteiras positivas.');return;
  }
  const parsed=price.trim()===''?null:Number(price);
  if(parsed!==null&&(!Number.isFinite(parsed)||parsed<0||parsed>100000000)){setError('Confira o preço de venda ou deixe em branco.');return;}
  setBusy(true);
  try{
   await createAssembly(workspaceId,{name:name.trim(),sku:sku.trim(),description:description.trim(),salePrice:parsed,
    parts:parts.map(p=>({...p,name:p.name.trim(),notes:p.notes.trim()}))});
   setFeedback('Conjunto e '+parts.length+' peças salvos na oficina. Nenhum custo ou estoque foi inventado.');
   setName('');setSku('');setDescription('');setPrice('');setParts([
    {name:'',quantity:1,notes:'',grams:null},{name:'',quantity:1,notes:'',grams:null}
   ]);setRefresh(n=>n+1);
  }catch(e){setError('Erro ao salvar conjunto: '+(e as Error).message);}
  finally{setBusy(false);}
 };
 return <section className="panel assembly-panel" aria-labelledby="assembly-title">
  <div className="panel-heading"><div><h2 id="assembly-title">Produtos com várias peças</h2>
   <p>Um conjunto pode reunir peças fabricadas separadamente. Cadastre a composição agora e detalhe custos depois.</p></div></div>
  {!session?<div><p className="footnote">Entre na sua oficina para registrar conjuntos e consultar suas peças.</p>
   <button type="button" className="primary-action" onClick={onLogin}>Entrar para montar produto</button></div>:
  <div className="assembly-body">
   <div className="product-save-fields">
    <label>Nome do conjunto<input aria-label="Nome do conjunto" maxLength={150} value={name} onChange={e=>setName(e.target.value)}/></label>
    <label>Referência (opcional)<input aria-label="Referência do conjunto" maxLength={100} value={sku} onChange={e=>setSku(e.target.value)}/></label>
    <label>Preço de venda (opcional, R$)<input aria-label="Preço do conjunto" type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)}/></label>
    <label>Descrição (opcional)<input aria-label="Descrição do conjunto" maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}/></label>
   </div>
   <div className="assembly-parts">
    <div className="materials-heading"><h3>Peças necessárias</h3><button type="button" onClick={()=>setParts(old=>[...old,{name:'',quantity:1,notes:'',grams:null}])} disabled={parts.length>=30}>+ Adicionar peça</button></div>
    {parts.map((part,i)=><div className="assembly-part" key={i} role="group" aria-label={'Peça '+(i+1)}>
     <div className="assembly-part-head"><strong>Peça {i+1}</strong><button type="button" disabled={parts.length<=2} onClick={()=>setParts(old=>old.filter((_,n)=>n!==i))} aria-label={'Remover peça '+(i+1)}>Remover</button></div>
     <div className="assembly-part-fields">
      <label>Nome da peça<input aria-label={'Nome da peça '+(i+1)} maxLength={150} value={part.name} onChange={e=>change(i,{name:e.target.value})}/></label>
      <label>Quantidade por conjunto<input aria-label={'Quantidade da peça '+(i+1)} type="number" min="1" step="1" value={part.quantity} onChange={e=>change(i,{quantity:Number(e.target.value)})}/></label>
      <label>Peso por peça (g, opcional)<input aria-label={'Peso da peça '+(i+1)} type="number" min="0" step="0.001" value={part.grams??''} onChange={e=>change(i,{grams:e.target.value===''?null:Number(e.target.value)})}/></label>
      <label>Observações (opcional)<input aria-label={'Observações da peça '+(i+1)} maxLength={1000} value={part.notes} onChange={e=>change(i,{notes:e.target.value})}/></label>
     </div>
    </div>)}
   </div>
   <p className="footnote">O peso é informativo. Sem consumo, tempo e preços medidos, os custos permanecem desconhecidos — nunca zerados automaticamente. Salvar o conjunto não desconta estoque.</p>
   <button type="button" className="primary-action" disabled={busy||!workspaceId} onClick={()=>void save()}>{busy?'Salvando conjunto e peças…':'Salvar conjunto e peças'}</button>
   <div aria-live="polite">{feedback&&<p role="status" className="product-success">{feedback}</p>}{error&&<p role="alert" className="error">{error}</p>}</div>
   <div className="product-list"><h3>Conjuntos salvos</h3>
    {loading?<p role="status">Carregando conjuntos…</p>:assemblies.length===0?<p className="footnote">Nenhum conjunto registrado nesta oficina.</p>:
     <ul>{assemblies.map(kit=><li key={kit.id} className="assembly-list-item">
      <button type="button" aria-expanded={open===kit.id} onClick={()=>setOpen(open===kit.id?null:kit.id)}>{kit.name} · {kit.parts.length} peças</button>
      <span>{kit.sale_price===null?'Sem preço definido':money(kit.sale_price)}</span>
      {open===kit.id&&<section className="assembly-details" aria-label={'Ficha do conjunto '+kit.name}>
       <div className="assembly-detail-heading"><div><h4>Ficha do conjunto</h4><p>{kit.description||'Sem descrição cadastrada'}</p></div><span>Revisão inicial</span></div>
       <dl className="assembly-detail-stats">
        <div><dt>Tipo</dt><dd>Conjunto montado</dd></div>
        <div><dt>Preço de venda</dt><dd>{kit.sale_price===null?'Não informado':money(kit.sale_price)}</dd></div>
        <div><dt>Custo real</dt><dd>Não apurado</dd></div>
       </dl>
       <h5>Composição obrigatória</h5>
       <div className="assembly-detail-table-wrap"><table className="assembly-detail-table"><thead><tr><th>Peça</th><th>Qtd.</th><th>Peso / unidade</th></tr></thead>
        <tbody>{kit.parts.map(part=><tr key={part.id}><td><strong>{part.name}</strong>{part.notes&&<small>{part.notes}</small>}</td><td>{part.quantity}</td><td>{part.grams!==null?part.grams+' g':'Não informado'}</td></tr>)}</tbody>
       </table></div>
       <p className="footnote">A ficha usa a composição armazenada na oficina. Custos de produção e movimentação de estoque exigem registro próprio.</p>
      </section>}
     </li>)}</ul>}
   </div>
  </div>}
 </section>;
}
