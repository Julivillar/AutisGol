import { useEffect, useState } from 'react'
import { listRecentMatches } from '../../services/firebase/firestore'

type Props = { onEdit: (id: string) => void, onCount?: (id: string) => void }

export function MatchesList({ onEdit, onCount }: Props) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function run() {
      const rows = await listRecentMatches(25)
      if (mounted) {
        setItems(rows)
        setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="text-sm text-gray-500">Cargando…</div>
  if (items.length === 0) return <div className="text-sm text-gray-500">Sin partidos aún.</div>

  return (
    <div className="space-y-2">
      {items.map((m) => (
        <div key={m.id} className="flex items-center justify-between border rounded p-2 bg-white">
          <div className="text-sm">
            <div className="font-medium">{m.name}</div>
            <div className="text-gray-500">Resultado: {m.result?.t1 ?? 0} - {m.result?.t2 ?? 0} · Video {m.videoRef}</div>
          </div>
          <div className="flex items-center gap-2">
            {onCount && <button className="px-2 py-1 rounded border" onClick={() => onCount(m.id)}>Contar</button>}
            <button className="px-2 py-1 rounded border" onClick={() => onEdit(m.id)}>Editar</button>
          </div>
        </div>
      ))}
    </div>
  )
}