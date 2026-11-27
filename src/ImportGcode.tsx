import { useId, useRef, useState } from 'react'
import { parseGcode, type GcodeResult } from './domain/gcode'

// Botão "Importar do fatiador": lê um ou vários .gcode no próprio navegador (nada é enviado) e entrega os resultados.
export function ImportGcode({ multiple, onResults, label }: { multiple?: boolean; onResults: (r: GcodeResult[]) => void; label: string }) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const run = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true); setMsg('')
    const ok: GcodeResult[] = []; const bad: string[] = []
    for (const f of [...files].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }))) {
      try {
        const r = parseGcode(await f.text(), f.name)
        if (r) ok.push(r); else bad.push(f.name)
      } catch { bad.push(f.name) }
    }
    if (input.current) input.current.value = ''
    setBusy(false)
    if (ok.length) onResults(ok)
    setMsg([ok.length ? `${ok.length} ${ok.length === 1 ? 'arquivo importado' : 'arquivos importados'}.` : '', bad.length ? `Não consegui ler: ${bad.join(', ')}. Use o .gcode fatiado.` : ''].filter(Boolean).join(' '))
  }
  return (
    <div className="importg">
      <input id={id} ref={input} type="file" accept=".gcode,.txt" multiple={multiple} hidden onChange={(e) => void run(e.target.files)} />
      <button type="button" onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Lendo...' : label}</button>
      {msg && <small role="status">{msg}</small>}
    </div>
  )
}
