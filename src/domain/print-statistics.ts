export const printStatisticsPeriods=[7,30,90] as const;
export type PrintStatisticsPeriod=typeof printStatisticsPeriods[number];

type PrintForStatistics={
 created_at:string;
 status:string;
 outputs:readonly {good:number;failed:number}[];
};

const localDay=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'});

export function summarizePrints(prints:readonly PrintForStatistics[],period:PrintStatisticsPeriod,now:Date){
 const lastDay=localDay.format(now);
 const firstDay=new Date(lastDay+'T00:00:00Z');
 firstDay.setUTCDate(firstDay.getUTCDate()-period+1);
 const firstDate=firstDay.toISOString().slice(0,10);

 let registered=0,completed=0,good=0,rejected=0;
 for(const print of prints){
  const created=Date.parse(print.created_at);
  if(!Number.isFinite(created))continue;
  const day=localDay.format(created);
  if(day<firstDate||day>lastDay)continue;

  registered++;
  if(print.status==='completed')completed++;
  for(const output of print.outputs){
   good+=output.good;
   rejected+=output.failed;
  }
 }
 const confirmed=good+rejected;
 return {registered,completed,good,rejected,confirmed,yieldRate:confirmed?good/confirmed:null};
}
