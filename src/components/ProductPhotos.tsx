import {useConfirmation} from './ConfirmationDialog';
import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import {listProductPhotos,productPhotoLimit,productPhotoTypes,setPrimaryProductPhoto,uploadProductPhoto,type ProductPhoto} from '../data/supabase';

type ProductPhotosProps={workspaceId:string;productId:string;name:string};
export function ProductThumbnail({workspaceId,productId,name,defer=false}:ProductPhotosProps&{defer?:boolean}){
 const [photo,setPhoto]=useState<ProductPhoto>();
 const anchor=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  let active=true;
  setPhoto(undefined);
  const load=()=>void listProductPhotos(workspaceId,productId,true)
   .then(([primary])=>{if(active)setPhoto(primary);}).catch(()=>{});
  const target=anchor.current?.parentElement;
  if(!defer||!target||typeof IntersectionObserver==='undefined'){
   load();
   return()=>{active=false;};
  }
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){
    observer.disconnect();
    load();
   }
  },{rootMargin:'120px'});
  observer.observe(target);
  return()=>{active=false;observer.disconnect();};
 },[workspaceId,productId,defer]);
 return <span ref={anchor} className="mc-product-thumbnail-slot">
  {photo&&<img className="mc-product-thumbnail" src={photo.url} alt={'Foto principal de '+name}
   referrerPolicy="no-referrer" onError={()=>setPhoto(undefined)}/>}
 </span>;
}

export function ProductPhotos({workspaceId,productId,name,readOnly=false}:ProductPhotosProps&{readOnly?:boolean}){
 const {requestConfirmation,confirmationDialog}=useConfirmation();
 const [uploadProgress,setUploadProgress]=useState<{sent:number;total:number;current:string}|null>(null);
 const [failureDetail,setFailureDetail]=useState('');
 const [photos,setPhotos]=useState<ProductPhoto[]>([]);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [reload,setReload]=useState(0);
 useEffect(()=>{
  let active=true;
  setLoading(true);
  void listProductPhotos(workspaceId,productId)
   .then(rows=>{if(active)setPhotos(rows);})
   .catch(()=>{if(active)setError('Não foi possível carregar as fotos deste cadastro.');})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[workspaceId,productId,reload]);
 const upload=async(event:ChangeEvent<HTMLInputElement>)=>{
  const files=Array.from(event.target.files??[]);
  event.target.value='';
  if(!files.length)return;
  if(files.some(file=>!productPhotoTypes.some(type=>type===file.type)||file.size===0||file.size>productPhotoLimit)){
   setError('Escolha fotos JPEG, PNG ou WebP de até 6 MB cada.');return;
  }
  setError('');setFailureDetail('');setBusy(true);
  let sent=0;
  try{
   for(const file of files){
    setUploadProgress({sent,total:files.length,current:file.name});
    await uploadProductPhoto(workspaceId,productId,file);sent++;
   }
  }catch(cause){
   setFailureDetail((cause as Error).message);
   setError(sent?sent+' foto(s) enviada(s). As demais não foram enviadas.':'Não foi possível enviar as fotos.');
  }finally{
   setBusy(false);setUploadProgress(null);
   if(sent)setReload(value=>value+1);
  }
 };
 const makePrimary=async(path:string)=>{
  setError('');setFailureDetail('');setBusy(true);
  try{
   await setPrimaryProductPhoto(workspaceId,productId,path);
   setPhotos(previous=>previous.map(photo=>({...photo,primary:photo.path===path})));
  }catch{setError('Não foi possível definir a foto principal.');}
  finally{setBusy(false);}
 };
 return <section className="mc-product-photos" aria-label="Fotos do produto">
  {confirmationDialog}
  <h4>Fotos do produto</h4>
  {!readOnly&&<label>Adicionar fotos
   <input type="file" accept={productPhotoTypes.join(',')} multiple disabled={busy||loading} onChange={event=>void upload(event)}/>
  </label>}
  {uploadProgress?<div className="mc-upload-progress">
   <p role="status">{uploadProgress.sent} de {uploadProgress.total} fotos enviadas. Enviando {uploadProgress.current}…</p>
   <progress aria-label="Fotos enviadas" value={uploadProgress.sent} max={uploadProgress.total}/>
  </div>:busy&&<p role="status">Atualizando a foto principal…</p>}
  {loading&&<p role="status">Carregando fotos…</p>}
  {error&&<p className="error" role="alert">{error}</p>}
  {error&&failureDetail&&<details><summary>Detalhes da falha</summary><p>{failureDetail}</p></details>}
  {!loading&&!error&&photos.length===0&&<p className="footnote">Nenhuma foto cadastrada.</p>}
  {photos.length>0&&<ul>{photos.map((photo,index)=><li key={photo.path}>
   <img src={photo.url} alt={(photo.primary?'Foto principal de ':'Foto '+(index+1)+' de ')+name} loading="lazy" referrerPolicy="no-referrer"/>
   {photo.primary?<span>Principal</span>:!readOnly&&<button type="button" disabled={busy} onClick={()=>requestConfirmation({
    title:'Alterar foto principal',message:'Usar a foto '+(index+1)+' como principal de “'+name+'”?',
    actionLabel:'Definir foto principal',onConfirm:()=>void makePrimary(photo.path)})}>Definir como principal</button>}
  </li>)}</ul>}
 </section>;
}
