type SummaryLine = readonly [label: string, value: string];

export function CalculationShare({title, lines}: {title: string; lines: readonly SummaryLine[]}) {
 const subject = 'MakerCusto — ' + title;
 const note = 'Valores estimados. O resultado informado é lucro bruto.';
 const message = [subject, '', ...lines.map(([label, value]) => label + ': ' + value), '', note].join('\n');

 return <details className="mc-calculation-share">
  <summary>Compartilhar resultado</summary>
  <div className="mc-calculation-share-actions">
   <a href={'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message)}>E-mail</a>
   <a href={'https://wa.me/?text=' + encodeURIComponent(message)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
   <button type="button" onClick={() => window.print()}>Salvar PDF</button>
  </div>
 </details>;
}

export function CalculationPrintSummary({title, lines}: {title: string; lines: readonly SummaryLine[]}) {
 return <article className="mc-calculation-print">
  <p>MakerCusto</p>
  <h1>{title}</h1>
  <dl>{lines.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  <p>Valores estimados. O resultado informado é lucro bruto.</p>
 </article>;
}
