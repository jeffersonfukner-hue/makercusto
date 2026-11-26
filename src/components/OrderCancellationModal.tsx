import {useState,type FormEvent} from 'react';
import {addOrderCancellationReason,cancelCustomerOrder,type CustomerOrder,type OrderCancellation} from '../data/supabase';
import {Modal} from './Modals';
import {OperationFeedback} from './OperationFeedback';

export function OrderCancellationModal({workspaceId,order,onClose,onCancelled}:{
 workspaceId:string;order:CustomerOrder;onClose:()=>void;onCancelled:(cancellation:OrderCancellation)=>void;
}){
 const [reason,setReason]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const addingReason=Boolean(order.cancellation);
 const valid=(!addingReason||Boolean(reason.trim()))&&reason.trim().length<=1000;
 const close=()=>{if(!busy)onClose();};
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  if(busy||!valid)return;
  setBusy(true);setError('');
  try{
   if(order.cancellation){
    const note=await addOrderCancellationReason(workspaceId,order.id,reason.trim());
    onCancelled({...order.cancellation,note});
   }else onCancelled(await cancelCustomerOrder(workspaceId,order.id,reason.trim()||null));
  }
  catch(cause){setError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 return <Modal title={addingReason?'Adicionar motivo':'Cancelar pedido'} onClose={close}>
  <form className="modal-body" onSubmit={event=>void submit(event)}>
   {!addingReason&&<p>O pedido <strong>{order.product_name}</strong> ficará cancelado no histórico e sairá dos totais da oficina.</p>}
   {!addingReason&&order.status==='sold'&&<p>Pagamentos recebidos e devoluções precisam ser tratados separadamente.</p>}
   <label>Motivo do cancelamento{!addingReason&&' (opcional)'}<textarea autoFocus required={addingReason} maxLength={1000}
    placeholder="Ex.: pedido registrado em duplicidade" disabled={busy} value={reason} onChange={event=>setReason(event.target.value)}/>
    {!addingReason&&<small>Você pode adicionar o motivo depois.</small>}
   </label>
   <OperationFeedback pending={busy} pendingMessage="Salvando…" error={error} failureMessage={addingReason?'Não foi possível salvar o motivo.':'Não foi possível cancelar o pedido.'}/>
   <div className="modal-actions">
    <button type="button" disabled={busy} onClick={close}>{addingReason?'Voltar':'Manter pedido'}</button>
    <button type="submit" className="primary-action" disabled={busy||!valid}>{addingReason?'Salvar motivo':'Confirmar cancelamento'}</button>
   </div>
  </form>
 </Modal>;
}
