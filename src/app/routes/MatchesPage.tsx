import { useState } from 'react'
import { MatchesList } from '../../components/matches/MatchesList'
import { MatchEditor } from '../../components/matches/MatchEditor'
import { LiveCounters } from '../../components/counters/LiveCounters'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function MatchesPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [countId, setCountId] = useState<string | null>(null)
  const { isAuthed } = useAuth()
  const navigate = useNavigate()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Partidos</h2>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <button
              className="px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90"
              onClick={() => { setCountId(null); setEditId(null); setOpenCreate(true) }}
            >
              Crear partido
            </button>
          ) : (
            <button
              className="px-3 py-2 rounded-lg border text-gray-600"
              title="Inicia sesión para crear"
              onClick={() => navigate('/')}
            >
              Crear partido
            </button>
          )}
        </div>
      </div>

      {countId && isAuthed && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Registro por jugador</h3>
            <button className="px-2 py-1 border rounded" onClick={()=>setCountId(null)}>Cerrar</button>
          </div>
          <LiveCounters matchId={countId} />
        </div>
      )}

      {(openCreate || editId) && isAuthed && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <MatchEditor matchId={editId ?? undefined} onClose={() => { setOpenCreate(false); setEditId(null) }} />
        </div>
      )}

      {!countId && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <h3 className="font-medium mb-2">Partidos recientes</h3>
          <MatchesList
            onEdit={isAuthed ? (id) => { setEditId(id); setOpenCreate(false); setCountId(null) } : undefined}
            onCount={isAuthed ? (id)=>{ setCountId(id); setEditId(null); setOpenCreate(false) } : undefined}
            showViewButton
          />
        </div>
      )}
    </section>
  )
}