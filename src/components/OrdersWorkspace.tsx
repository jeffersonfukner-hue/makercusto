import {useEffect,useState} from 'react';
import {listCustomerOrders,type CustomerOrder} from '../data/supabase';
import {calculateOrderPlan} from '../domain/order-plan';

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'});

export function OrdersWorkspace({workspaceId}:{workspaceId:string}){
 const [offset,setOffset]=useState(0);
 const [page,setPage]=useState<{offset:number;orders:CustomerOrder[];error?:string}>();
 useEffect(()=>{
  let active=true;
  void listCustomerOrders(workspaceId,offset)
   .then(orders=>{if(active)setPage({offset,orders});})
   .catch(error=>{if(active)setPage({offset,orders:[],error:(error as Error).message});});
  return ()=>{active=false;};
 },[workspaceId,offset]);
 const current=page?.offset===offset?page:undefined;
 return <section className="panel" aria-label="Histórico de pedidos">
  <h2>Histórico de pedidos</h2>
  {!current&&<p role="status">Carregando pedidos…</p>}
  {current?.error&&<p role="alert">Não foi possível consultar pedidos. {current.error}</p>}
  {current&&!current.error&&current.orders.length===0&&<p>Nenhum pedido nesta página. Use Planejamento do pedido na calculadora para registrar um.</p>}
  {current?.orders.map(order=>{
   const plan=calculateOrderPlan(order.pieces_per_plate,Number(order.plate_cost),Number(order.sale_price),
    order.quantity,Number(order.partial_plate_cost));
   return <article key={order.id} className="product-detail mc-order-record">
    <h3>{order.product_name}</h3>
    <p>{order.status==='sold'?'Vendido':'Planejado'} · {date.format(new Date(order.created_at))}</p>
    <p>{order.production_method==='assembly'?order.quantity+' conjuntos montados':<>
     {order.quantity} peças · {plan.totalPlates} {plan.totalPlates===1?'mesa':'mesas'}
     {plan.partialPieces>0&&' · última mesa: '+plan.partialPieces+' un.'}
    </>}</p>
    <dl className="cost-list">
     <div><dt>Custo registrado</dt><dd>{money.format(plan.totalCost)}</dd></div>
     <div><dt>Venda por unidade</dt><dd>{money.format(Number(order.sale_price))}</dd></div>
     <div><dt>Faturamento do pedido</dt><dd>{money.format(plan.revenue)}</dd></div>
     <div><dt>Lucro bruto</dt><dd>{money.format(plan.grossProfit)}</dd></div>
    </dl>
   </article>;
  })}
  <div className="mc-calculation-share-actions">
   {offset>0&&<button type="button" onClick={()=>setOffset(offset-20)}>Anterior</button>}
   {current?.orders.length===20&&<button type="button" onClick={()=>setOffset(offset+20)}>Próxima</button>}
  </div>
 </section>;
}
