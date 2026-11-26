import {useEffect,useState} from 'react';
import {listProducts,type ProductRecord} from '../data/supabase';
import {ProductPhotos} from './ProductPhotos';

export function LibraryWorkspace({workspaceId}:{workspaceId:string|null}){
 const [products,setProducts]=useState<ProductRecord[]>([]);
 const [selectedId,setSelectedId]=useState('');
 const [status,setStatus]=useState('');
 useEffect(()=>{
  let active=true;
  setProducts([]);setSelectedId('');
  if(!workspaceId){setStatus('Conectando à oficina…');return;}
  setStatus('Carregando produtos…');
  void listProducts(workspaceId).then(items=>{
   if(active){setProducts(items);setStatus(items.length?'':'Nenhum cadastro disponível.');}
  }).catch(()=>{if(active)setStatus('Não foi possível consultar os cadastros.');});
  return()=>{active=false;};
 },[workspaceId]);
 const product=products.find(item=>item.id===selectedId);
 return <section className="panel">
  <h2>Fotos dos produtos</h2>
  {status&&<p role="status">{status}</p>}
  {products.length>0&&<label>Produto da oficina{' '}
   <select value={selectedId} onChange={event=>setSelectedId(event.target.value)}>
    <option value="">Selecione</option>{products.map(item=><option key={item.id} value={item.id}>{item.name}{item.sku?' · '+item.sku:''}</option>)}
   </select>
  </label>}
  {product&&workspaceId&&<ProductPhotos key={product.id} workspaceId={workspaceId} productId={product.id} name={product.name} readOnly/>}
 </section>;
}
