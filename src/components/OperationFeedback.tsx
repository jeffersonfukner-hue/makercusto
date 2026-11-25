export function OperationFeedback({pending,pendingMessage,error,failureMessage}:{
 pending:boolean;pendingMessage:string;error:string;failureMessage:string;
}){
 if(pending)return <p role="status">{pendingMessage}</p>;
 if(!error)return null;
 return <div className="error">
  <p role="alert">{failureMessage}</p>
  <details><summary>Detalhes</summary><p>{error}</p></details>
 </div>;
}
