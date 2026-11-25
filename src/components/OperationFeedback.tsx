export function OperationFeedback({pending,pendingMessage,error,failureMessage,onRetry}:{
 pending:boolean;pendingMessage:string;error:string;failureMessage:string;onRetry?:()=>void;
}){
 if(pending)return <p role="status">{pendingMessage}</p>;
 if(!error)return null;
 return <div className="error">
  <p role="alert">{failureMessage}</p>
  {onRetry&&<button type="button" onClick={onRetry}>Tentar novamente</button>}
  <details><summary>Detalhes</summary><p>{error}</p></details>
 </div>;
}
