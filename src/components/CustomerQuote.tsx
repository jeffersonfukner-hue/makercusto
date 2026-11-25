import {useState} from 'react';
import {listProductPhotos} from '../data/supabase';

type Props = {
 name?: string;
 quantity: number;
 salePrice: number;
 product?: {workspaceId: string; id: string};
};

const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});

async function quotePhoto(workspaceId: string, productId: string) {
 const [photo] = await listProductPhotos(workspaceId,productId,true);
 if(!photo) return undefined;
 const response = await fetch(photo.url,{referrerPolicy:'no-referrer'});
 if(!response.ok) throw new Error('A foto principal está indisponível.');
 try{return await createImageBitmap(await response.blob());}
 catch{throw new Error('Não foi possível ler a foto principal. Você ainda pode enviar o orçamento em texto.');}
}

async function quoteImage(name: string, rows: string[], photo?: ImageBitmap): Promise<File> {
 const canvas = document.createElement('canvas');
 canvas.width = 720;
 const photoHeight = photo ? 360 : 0;
 canvas.height = 148 + photoHeight + rows.length*48;
 const context = canvas.getContext('2d');
 if(!context) throw new Error('O navegador não conseguiu montar a imagem.');
 context.fillStyle = '#f4f7fc';
 context.fillRect(0,0,canvas.width,canvas.height);
 context.fillStyle = '#194386';
 context.font = 'bold 25px system-ui';
 context.fillText('ORÇAMENTO',36,48);
 context.font = 'bold 33px system-ui';
 context.fillText(name,36,95,648);
 if(photo){
  const scale = Math.min(648/photo.width,336/photo.height);
  const width = photo.width*scale, height = photo.height*scale;
  context.drawImage(photo,(720-width)/2,110+(336-height)/2,width,height);
 }
 context.font = '24px system-ui';
 rows.forEach((row,index)=>context.fillText(row,36,136+photoHeight+index*48,648));
 const blob = await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob) throw new Error('O navegador não conseguiu gerar a imagem.');
 return new File([blob],'orcamento-makercusto.png',{type:blob.type});
}

export function CustomerQuote({name,quantity,salePrice,product}:Props){
 const [title,setTitle]=useState(name??'');
 const [quantityDraft,setQuantities]=useState<string>();
 const quantities=quantityDraft??[...new Set([1,10,50,quantity])].sort((a,b)=>a-b).join(', ');
 const [image,setImage]=useState<{file:File;key:string}>();
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('');
 const parsed=quantities.trim().split(/[,\s]+/).map(Number);
 const tiers=[...new Set(parsed)].sort((a,b)=>a-b);
 const unitCents=Math.round(salePrice*100);
 const valid=tiers.length<=10&&unitCents>0&&tiers.every(value=>Number.isSafeInteger(value)&&value>0&&Number.isSafeInteger(unitCents*value));
 const quoteName=title.trim()||'Produto';
 const rows=valid?tiers.map(value=>value+' un. · '+money.format(unitCents/100)+'/un. · '+money.format(value*unitCents/100)+' no total'):[];
 const message=['Orçamento — '+quoteName,...rows].join('\n');
 const file=image?.key===message?image.file:undefined;

 const prepare=async()=>{
  setBusy(true);setStatus('');
  let photo:ImageBitmap|undefined;
  try{
   if(product) photo=await quotePhoto(product.workspaceId,product.id);
   setImage({file:await quoteImage(quoteName,rows,photo),key:message});
   setStatus(photo?'Orçamento pronto com a foto principal.':'Orçamento pronto.');
  }catch(error){setStatus((error as Error).message||'Não foi possível gerar o orçamento.');}
  finally{photo?.close();setBusy(false);}
 };
 const send=async()=>{
  if(!file)return;
  try{await navigator.share({files:[file],title:'Orçamento — '+quoteName});}
  catch(error){if((error as Error).name!=='AbortError')setStatus('Use Baixar imagem para anexar o orçamento no WhatsApp.');}
 };
 const download=()=>{
  if(!file)return;
  const url=URL.createObjectURL(file);
  const link=document.createElement('a');
  link.href=url;link.download=file.name;link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),60_000);
 };
 return <details className="mc-calculation-share mc-customer-quote">
  <summary>Orçamento para cliente</summary>
  <label>Produto<input value={title} maxLength={100} onChange={event=>setTitle(event.target.value)}/></label>
  <label>Quantidades<input value={quantities} maxLength={100} onChange={event=>setQuantities(event.target.value)}/></label>
  <small>Separe até 10 quantidades por vírgula. Cada faixa usa o preço de venda por unidade informado na calculadora.</small>
  {valid?<ul>{rows.map(row=><li key={row}>{row}</li>)}</ul>:<p>Informe um preço de venda positivo e quantidades inteiras maiores que zero.</p>}
  {valid&&<div className="mc-calculation-share-actions">
   <a href={'https://wa.me/?text='+encodeURIComponent(message)} target="_blank" rel="noopener noreferrer">WhatsApp (texto)</a>
   <button type="button" disabled={busy} onClick={()=>void prepare()}>{busy?'Preparando…':'Preparar imagem'}</button>
   {file&&navigator.canShare?.({files:[file]})&&<button type="button" onClick={()=>void send()}>Compartilhar imagem</button>}
   {file&&<button type="button" onClick={download}>Baixar imagem</button>}
  </div>}
  {file&&<small>Escolha o WhatsApp ao compartilhar ou anexe a imagem baixada à conversa.</small>}
  {status&&<p role="status">{status}</p>}
 </details>;
}
