import {OrderCancellationModal} from './OrderCancellationModal';
import {MetricGrid} from './MetricGrid';
import {OperationFeedback} from './OperationFeedback';
import {useEffect,useRef,useState} from 'react';
import {listCustomerOrders,type CustomerOrder,type WorkshopCustomer} from '../data/supabase';
import {calculateOrderPlan} from '../domain/order-plan';

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'});

const statusLabel=(order:CustomerOrder)=>order.cancellation?'Cancelado':order.status==='sold'?'Vendido':'Planejado';
const orderPlan=(order:CustomerOrder)=>calculateOrderPlan(order.pieces_per_plate,Number(order.plate_cost),Number(order.sale_price),
 order.quantity,Number(order.partial_plate_cost));
const orderQuantity=(order:CustomerOrder)=>order.quantity+(order.production_method==='assembly'
 ?order.quantity===1?' conjunto':' conjuntos'
 :order.quantity===1?' peça':' peças');

export function OrdersWorkspace({workspaceId,customer,onDetailChange}:{workspaceId:string;customer?:WorkshopCustomer;onDetailChange?:(open:boolean)=>void}){
 const [selected,setSelected]=useState<CustomerOrder>();
 const [cancelling,setCancelling]=useState(false);
 const detailHeading=useRef<HTMLHeadingElement>(null);
 const openedRow=useRef('');
 const rowButtons=useRef(new Map<string,HTMLButtonElement>());
 useEffect(()=>{
  if(selected)detailHeading.current?.focus();
  else if(openedRow.current)rowButtons.current.get(openedRow.current)?.focus();
 },[selected]);
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
 const recentOrders=!customer&&offset===0?current?.orders:undefined;
 const recentSales=recentOrders?.filter(order=>order.status==='sold'&&!order.cancellation)??[];
 const plannedOrders=recentOrders?.filter(order=>order.status==='planned'&&!order.cancellation)??[];
 if(selected){
  const plan=orderPlan(selected);
  const assembly=selected.production_method==='assembly';
  return <article className="panel mc-order-detail" aria-labelledby="mc-order-detail-title">
   <button type="button" className="mc-light-action" onClick={()=>{setSelected(undefined);onDetailChange?.(false);}}>← Voltar aos pedidos</button>
   <header className="mc-order-detail-header">
    <div><h2 id="mc-order-detail-title" tabIndex={-1} ref={detailHeading}>{selected.product_name}</h2>
     <p>{selected.customer?.name??customer?.name??'Sem cliente'} · {date.format(new Date(selected.created_at))}</p>
    </div>
    <span className="mc-order-status" data-sold={!selected.cancellation&&selected.status==='sold'} data-cancelled={Boolean(selected.cancellation)}>{statusLabel(selected)}</span>
   </header>
   <MetricGrid className="mc-order-financials" metrics={[
    {label:'Faturamento do pedido',value:money.format(plan.revenue)},
    {label:'Custo registrado',value:money.format(plan.totalCost)},
    {label:'Lucro bruto',value:money.format(plan.grossProfit),className:plan.grossProfit<0?'negative':'positive'},
    {label:'Venda por unidade',value:money.format(Number(selected.sale_price))},
   ]}/>
   <section className="mc-order-production" aria-label="Produção do pedido">
    <h3>Produção</h3>
    <p>{assembly?'Montagem por partes':'Impressão em peça única'}</p>
    <p>{assembly?orderQuantity(selected)+(selected.quantity===1?' montado':' montados'):<>
     {orderQuantity(selected)} · {plan.totalPlates} {plan.totalPlates===1?'mesa':'mesas'}
     {plan.partialPieces>0&&' · última mesa: '+plan.partialPieces+' un.'}
    </>}</p>
   </section>
   {selected.cancellation?<section className="mc-order-production" aria-label="Cancelamento">
    <h3>Cancelamento registrado</h3>
    <p>{selected.cancellation.reason??selected.cancellation.note?.reason??'Motivo não informado.'}</p>
    {!selected.cancellation.reason&&!selected.cancellation.note&&<button type="button" className="mc-light-action" onClick={()=>setCancelling(true)}>Adicionar motivo</button>}
    {selected.cancellation.note&&<p>Motivo acrescentado em {date.format(new Date(selected.cancellation.note.added_at))} · Usuário {selected.cancellation.note.added_by}</p>}
    <dl className="mc-order-audit">
     <div><dt>Situação anterior</dt><dd>{selected.status==='sold'?'Vendido':'Planejado'}</dd></div>
     <div><dt>Data do cancelamento</dt><dd>{date.format(new Date(selected.cancellation.cancelled_at))}</dd></div>
     <div><dt>Usuário responsável</dt><dd>{selected.cancellation.cancelled_by}</dd></div>
    </dl>
   </section>:<div className="mc-calculation-share-actions">
    <button type="button" className="mc-light-action" onClick={()=>setCancelling(true)}>Cancelar pedido</button>
   </div>}
   {cancelling&&<OrderCancellationModal workspaceId={workspaceId} order={selected} onClose={()=>setCancelling(false)}
    onCancelled={cancellation=>{
     const updated={...selected,cancellation};
     setSelected(updated);
     setPage(previous=>previous&&{...previous,orders:previous.orders.map(order=>order.id===updated.id?updated:order)});
     setCancelling(false);
    }}/>}
  </article>;
 }
 return <section className="panel" aria-label="Histórico de pedidos">
  <h2>{customer?'Pedidos de '+customer.name:'Histórico de pedidos'}</h2>
  <OperationFeedback pending={!current} pendingMessage="Carregando pedidos…" error={current?.error??''}
   failureMessage="Não foi possível consultar pedidos." onRetry={()=>setRetry(attempt=>attempt+1)}/>
  {current&&!current.error&&current.orders.length===0&&<p>Nenhum pedido nesta página. Use Planejamento do pedido na calculadora para registrar um.</p>}
  {!!recentOrders?.length&&<section aria-labelledby="mc-order-summary-title">
   <h3 id="mc-order-summary-title">Últimos 20 pedidos da oficina</h3>
   <MetricGrid className="mc-order-financials" metrics={[
    {label:'Planejados',value:plannedOrders.length},
    {label:'Vendidos',value:recentSales.length},
    {label:'Valor vendido',value:money.format(recentSales.reduce((total,order)=>total+orderPlan(order).revenue,0))}
   ]}/>
  </section>}
  {!!current?.orders.length&&<ul className="mc-order-list">
   {current.orders.map(order=><li key={order.id}>
    <button type="button" className="mc-order-row" ref={element=>{
     if(element)rowButtons.current.set(order.id,element);
     else rowButtons.current.delete(order.id);
    }} onClick={()=>{openedRow.current=order.id;setSelected(order);onDetailChange?.(true);}}>
     <span className="mc-order-identity"><strong>{order.product_name}</strong>
      <small>{order.customer?.name??customer?.name??'Sem cliente'} · {date.format(new Date(order.created_at))}</small></span>
     <span className="mc-order-status" data-sold={!order.cancellation&&order.status==='sold'} data-cancelled={Boolean(order.cancellation)}>{statusLabel(order)}</span>
     <span className="mc-order-quantity">{orderQuantity(order)}</span>
     <strong className="mc-order-total">{money.format(orderPlan(order).revenue)}</strong>
     <span className="mc-order-chevron" aria-hidden="true">›</span>
    </button>
   </li>)}
  </ul>}
  <div className="mc-calculation-share-actions">
   {offset>0&&<button type="button" onClick={()=>setOffset(offset-20)}>Anterior</button>}
   {current?.orders.length===20&&<button type="button" onClick={()=>setOffset(offset+20)}>Próxima</button>}
  </div>
 </section>;
}
