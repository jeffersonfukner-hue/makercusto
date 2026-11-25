import type {ReactNode} from 'react';

type Metric={label:string;value:ReactNode;className?:string;testId?:string};

export function MetricGrid({metrics,className}:{metrics:Metric[];className:string}){
 return <dl className={'mc-metric-grid '+className}>
  {metrics.map(({label,value,className,testId})=><div key={label}>
   <dt>{label}</dt><dd className={className} data-testid={testId}>{value}</dd>
  </div>)}
 </dl>;
}
