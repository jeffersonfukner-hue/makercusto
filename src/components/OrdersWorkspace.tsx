import {OperationFeedback} from './OperationFeedback';
import {useEffect,useState} from 'react';
import {listCustomerOrders,type CustomerOrder,type WorkshopCustomer} from '../data/supabase';
import {calculateOrderPlan} from '../domain/order-plan';

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'});

export function OrdersWorkspace({workspaceId,customer}:{workspaceId:string;customer?:WorkshopCustomer}){
 const [offset,setOffset]=useState(0);
 const [retry,setRetry]=useState(0);
 const [page,setPage]=useState<{key:string;orders:CustomerOrder[];error?:string}>();
 const key=[workspaceId,customer?.id,offset,retry].join('/');
 useEffect(()=>{
  let active=true;
  void listCustomerOrders(workspaceId,offset,customer?.id)
   .then(orders=>{if(active)setPage({key,orders});})
   .catch(error=>{if(active)setPage({key,orders:[],error:(error as Error).message||'A consulta falhou.'});});
  return ()=>{active=false;};
 },[workspaceId,offset,customer?.id,key]);
 const current=page?.key===key?page:undefined;
 return <section className="panel" aria-label="Histórico de pedidos">
  <h2>{customer?'Pedidos de '+customer.name:'Histórico de pedidos'}</h2>
  <OperationFeedback pending={!current} pendingMessage="Carregando pedidos…" error={current?.error??''}
   failureMessage="Não foi possível consultar pedidos." onRetry={()=>setRetry(attempt=>attempt+1)}/>
  {current&&!current.error&&current.orders.length===0&&<p>Nenhum pedido nesta página. Use Planejamento do pedido na calculadora para registrar um.</p>}
  {current?.orders.map(order=>{
   const plan=calculateOrderPlan(order.pieces_per_plate,Number(order.plate_cost),Number(order.sale_price),
    order.quantity,Number(order.partial_plate_cost));
   return <article key={order.id} className="product-detail mc-order-record">
    <h3>{order.product_name}</h3>
    {order.customer&&<p>Cliente: {order.customer.name}</p>}
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
