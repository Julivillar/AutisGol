import { useEffect, useMemo, useState } from 'react'
import { useMatch } from '../../hooks/useMatch'
import { usePlayers } from '../../hooks/usePlayers'
import { useLiveCounts } from '../../hooks/useLiveCounts'
import { addLiveEvent, removeLastLiveEvent, LIVE_EVENT_TYPES, type LiveEventType } from '../../services/firebase/events'
import { useCountersStore } from '../../state/counters'
import { parseMinuteStrToSec, formatSecToMinuteStr } from '../../utils/time'
import { usePresence } from '../../hooks/usePresence'

const COLUMNS: { key: LiveEventType, label: string }[] = [
  { key: 'shot', label: 'Tiros' },
  { key: 'shot_on_target', label: 'Tiros a puerta' },
  { key: 'pass', label: 'Pases' },
  { key: 'pass_success', label: 'Pases acertados' },
  { key: 'key_pass', label: 'Pases clave' },
  { key: 'interception', label: 'Intercepciones' },
  { key: 'save', label: 'Paradas' },
  { key: 'foul', label: 'Faltas' }
]

export function LiveCounters({ matchId }: { matchId: string }) {
  const { match, loading, error } = useMatch(matchId)
  const { players } = usePlayers()
  const counts = useLiveCounts(matchId)

  const [minuteStr, setMinuteStr] = useState('00:00')
  const minuteSec = (() => { try { return parseMinuteStrToSec(minuteStr) } catch { return 0 } })()
  const setCurrentMinuteSec = useCountersStore(s => s.setCurrentMinuteSec)
  const presence = usePresence(matchId, minuteSec)

  useEffect(() => {
    setCurrentMinuteSec(minuteSec)
  }, [minuteSec, setCurrentMinuteSec])

  const roster = useMemo(() => {
    if (!match) return []
    const pmap = new Map(players.map(p => [p.id, p]))
    const t1 = (match.team1 ?? []).map((id: string) => ({ ...pmap.get(id), id, team: 'team1' as const })).filter(Boolean)
    const t2 = (match.team2 ?? []).map((id: string) => ({ ...pmap.get(id), id, team: 'team2' as const })).filter(Boolean)
    return [...t1, ...t2]
  }, [match, players])

  if (loading) return <div>Cargando…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!match) return null

  return (
    <section className="space-y-4">
      {/* Header (party bar compacta) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Registro de Eventos por Jugador</h2>
          <p className="text-gray-500 text-sm">Actualiza el rendimiento en tiempo real</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Minuto</label>
            <input className="border px-2 py-1 rounded w-24 text-center" value={minuteStr} onChange={e=>setMinuteStr(e.target.value)} />
          </div>
          <PresenceChips list={presence} />
        </div>
      </div>

      {/* Tabla scrolleable sola */}
      <div className="rounded-2xl bg-white border shadow-sm p-0 overflow-x-hidden">
        <div className="relative overflow-x-auto">
          <table className="w-max min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="text-left px-2 py-3 min-w-[20px]">Jugador</th>
                {COLUMNS.map(col => (
                  <th key={col.key} className="text-center px-2 py-3 whitespace-nowrap min-w-[40px]">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roster.map((p: any) => {
                const rowCounts = counts[p.id] ?? {}
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} />
                        <div className="leading-tight">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.team === 'team1' ? 'Equipo 1' : 'Equipo 2'}</div>
                        </div>
                      </div>
                    </td>
                    {COLUMNS.map(col => (
                      <CellCounter
                        key={col.key}
                        value={rowCounts[col.key] ?? 0}
                        onInc={() => inc({ type: col.key, playerId: p.id, team: p.team, matchId: matchId, videoRef: match.videoRef, minuteStr })}
                        onDec={() => dec({ type: col.key, playerId: p.id, matchId: matchId })}
                      />
                    ))}
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

function Avatar({ name }: { name: string }) {
  const initials = (name || '?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  )
}

function PresenceChips({ list }: { list: any[] }) {
  if (!list || list.length === 0) return <div className="text-xs text-gray-500">Sin admins conectados</div>
  return (
    <div className="flex items-center gap-2">
      {list.map((u: any) => (
        <div key={u.uid} className="flex items-center gap-2 px-2 py-1 border rounded-full bg-white">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium">
            {avatarInitials(u.displayName || u.email || 'A')}
          </div>
          <div className="text-xs">
            <div className="font-medium">{(u.displayName || u.email || '').split('@')[0]}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
function avatarInitials(s: string) {
  const p = s.trim().split(/\s+/)
  if (p.length === 1) return p[0].slice(0,2).toUpperCase()
  return (p[0][0] + p[p.length-1][0]).toUpperCase()
}

function CellCounter({ value, onInc, onDec }: { value: number, onInc: ()=>void, onDec: ()=>void }) {
  return (
    <td className="px-4 py-3 text-center">
      <div className="inline-flex items-center gap-3">
        <button className="text-gray-500 hover:text-gray-700 px-2" onClick={onDec} aria-label="Restar">−</button>
        <span className="font-semibold tabular-nums">{value}</span>
        <button className="text-emerald-600 hover:text-emerald-700 px-2" onClick={onInc} aria-label="Sumar">＋</button>
      </div>
    </td>
  )
}

async function inc(args: { type: LiveEventType, playerId: string, team: 'team1'|'team2', matchId: string, videoRef: number, minuteStr: string }) {
  const minuteSec = parseMinuteStrToSec(args.minuteStr || '00:00')
  await addLiveEvent({
    matchId: args.matchId,
    playerId: args.playerId,
    team: args.team,
    type: args.type,
    minuteSec,
    videoRef: args.videoRef
  })
}

async function dec(args: { type: LiveEventType, playerId: string, matchId: string }) {
  await removeLastLiveEvent({
    matchId: args.matchId,
    playerId: args.playerId,
    type: args.type
  })
}