import {useEffect,useId,useRef,useState} from 'react';

type Confirmation = {
 title:string;
 message:string;
 actionLabel:string;
 onConfirm:()=>void;
};

function ConfirmationDialog({title,message,actionLabel,onConfirm,onDismiss}:Confirmation&{onDismiss:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const titleId=useId();
 const messageId=useId();

 useEffect(()=>{
  const element=dialog.current!;
  element.showModal();
  return ()=>{if(element.open)element.close();};
 },[]);

 const dismiss=()=>{
  dialog.current?.close();
  onDismiss();
 };
 return <dialog ref={dialog} className="modal-window mc-confirmation-dialog" aria-labelledby={titleId}
  aria-describedby={messageId} onCancel={event=>{event.preventDefault();dismiss();}}>
  <div className="modal-header"><h2 id={titleId}>{title}</h2></div>
  <div className="modal-body">
   <p id={messageId}>{message}</p>
   <div className="modal-actions">
    <button type="button" onClick={dismiss}>Cancelar</button>
    <button type="button" className="primary-action" onClick={()=>{dismiss();onConfirm();}}>{actionLabel}</button>
   </div>
  </div>
 </dialog>;
}

export function useConfirmation(){
 const [confirmation,setConfirmation]=useState<Confirmation|null>(null);
 return {
  requestConfirmation:setConfirmation,
  confirmationDialog:confirmation&&<ConfirmationDialog {...confirmation} onDismiss={()=>setConfirmation(null)}/>
 };
}
