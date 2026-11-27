// Aviso para quem entrou na conta e ainda tem itens guardados só neste navegador.
export function ImportBar({ count, what, onImport }: { count: number; what: string; onImport: () => void }) {
  if (!count) return null
  return (
    <p className="card importbar" role="status">
      Você tem <strong>{count} {what}</strong> guardados só neste navegador. <button type="button" onClick={onImport}>Enviar para a nuvem</button>
    </p>
  )
}
