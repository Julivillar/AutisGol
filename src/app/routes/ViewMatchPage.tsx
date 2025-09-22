import { useParams, useNavigate } from 'react-router-dom'
import { useMatch } from '../../hooks/useMatch'
import { usePlayers } from '../../hooks/usePlayers'
import { useLiveCounts } from '../../hooks/useLiveCounts'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../services/firebase/client'
import { useEffect, useState, useMemo } from 'react'
import { formatSecToMinuteStr } from '../../utils/time'

type GoalRow = {
  id: string
  minuteSec: number
  playerId?: string
  assistBy?: string
  keeperId?: string
  type: string
}

export function ViewMatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { match, loading, error } = useMatch(id!)
  const { players } = usePlayers()
  const counts = useLiveCounts(id!)

  const [goals, setGoals] = useState<GoalRow[]>([])

  useEffect(() => {
    if (!id) return
    const q = query(collection(db, 'matches', id, 'events'), orderBy('minuteSec', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const rows: GoalRow[] = []
      snap.forEach(doc => {
        const d = doc.data() as any
        if (d.type === 'goal' || d.type === 'own_goal') {
          rows.push({ id: doc.id, ...d })
        }
      })
      setGoals(rows)
    })
    return () => unsub()
  }, [id])

  const pmap = useMemo(() => new Map(players.map(p => [p.id, p.name])), [players])

  if (loading) return <div>Cargando…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!match) return null

  const roster = [...(match.team1 ?? []), ...(match.team2 ?? [])]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{match.name}</h2>
          <p className="text-gray-500 text-sm">Resultado: {match.result?.t1 ?? 0} - {match.result?.t2 ?? 0} · Video {match.videoRef}</p>
        </div>
        <button className="px-2 py-1 border rounded" onClick={() => navigate('/partidos')}>Volver</button>
      </div>

      {/* Goles */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <h3 className="font-medium mb-2">Goles</h3>
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-sm">
            <thead className="text-gray-600">
              <tr>
                <th className="text-left py-2 px-2">Minuto</th>
                <th className="text-left py-2 px-2">Goleador</th>
                <th className="text-left py-2 px-2">Asistente</th>
                <th className="text-left py-2 px-2">Portero rival</th>
                <th className="text-left py-2 px-2">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {goals.length === 0 && <tr><td colSpan={5} className="py-3 text-gray-500">Sin goles</td></tr>}
              {goals.map(g => (
                <tr key={g.id} className="border-t">
                  <td className="py-2 px-2">{formatSecToMinuteStr(g.minuteSec ?? 0)}</td>
                  <td className="py-2 px-2">{pmap.get(g.playerId || '') || '—'}</td>
                  <td className="py-2 px-2">{pmap.get(g.assistBy || '') || '—'}</td>
                  <td className="py-2 px-2">{pmap.get(g.keeperId || '') || '—'}</td>
                  <td className="py-2 px-2">{g.type === 'own_goal' ? 'Gol en propia' : 'Gol'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas del partido (por jugador) */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <h3 className="font-medium mb-2">Estadísticas del partido</h3>
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-sm">
            <thead className="text-gray-600">
              <tr>
                <th className="text-left py-2 px-2 min-w-[200px]">Jugador</th>
                <th className="text-center py-2 px-2">Tiros</th>
                <th className="text-center py-2 px-2">Tiros a puerta</th>
                <th className="text-center py-2 px-2">Pases</th>
                <th className="text-center py-2 px-2">Pases acertados</th>
                <th className="text-center py-2 px-2">Pases clave</th>
                <th className="text-center py-2 px-2">Paradas</th>
                <th className="text-center py-2 px-2">Faltas</th>
                <th className="text-center py-2 px-2">Intercepciones</th>
              </tr>
            </thead>
            <tbody>
              {roster.map(pid => {
                const name = pmap.get(pid) || pid
                const c = counts[pid] ?? {}
                return (
                  <tr key={pid} className="border-t">
                    <td className="py-2 px-2">{name}</td>
                    <td className="py-2 px-2 text-center">{c.shot ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.shot_on_target ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.pass ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.pass_success ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.key_pass ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.save ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.foul ?? 0}</td>
                    <td className="py-2 px-2 text-center">{c.interception ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}