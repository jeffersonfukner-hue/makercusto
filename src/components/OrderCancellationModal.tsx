import {useState,type FormEvent} from 'react';
import {cancelCustomerOrder,type CustomerOrder,type OrderCancellation} from '../data/supabase';
import {Modal} from './Modals';
import {OperationFeedback} from './OperationFeedback';

export function OrderCancellationModal({workspaceId,order,onClose,onCancelled}:{
 workspaceId:string;order:CustomerOrder;onClose:()=>void;onCancelled:(cancellation:OrderCancellation)=>void;
}){
 const [reason,setReason]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const valid=reason.trim().length>=10&&reason.trim().length<=1000;
 const close=()=>{if(!busy)onClose();};
 const submit=async(event:FormEvent)=>{
  event.preventDefault();
  if(busy||!valid)return;
  setBusy(true);setError('');
  try{onCancelled(await cancelCustomerOrder(workspaceId,order.id,reason.trim()));}
  catch(cause){setError((cause as Error).message||'A solicitação falhou.');}
  finally{setBusy(false);}
 };
 return <Modal title="Cancelar pedido" onClose={close}>
  <form className="modal-body" onSubmit={event=>void submit(event)}>
   <p>O pedido <strong>{order.product_name}</strong> ficará cancelado no histórico e sairá dos totais da oficina.</p>
   {order.status==='sold'&&<p>Pagamentos recebidos e devoluções precisam ser tratados separadamente.</p>}
   <label>Motivo do cancelamento<textarea autoFocus required minLength={10} maxLength={1000}
    placeholder="Ex.: pedido registrado em duplicidade" disabled={busy} value={reason} onChange={event=>setReason(event.target.value)}/>
    <small>De 10 a 1.000 caracteres.</small>
   </label>
   <OperationFeedback pending={busy} pendingMessage="Registrando cancelamento…" error={error} failureMessage="Não foi possível cancelar o pedido."/>
   <div className="modal-actions">
    <button type="button" disabled={busy} onClick={close}>Manter pedido</button>
    <button type="submit" className="primary-action" disabled={busy||!valid}>Confirmar cancelamento</button>
   </div>
  </form>
 </Modal>;
}
