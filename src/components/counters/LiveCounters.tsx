import { useEffect, useMemo, useState } from 'react'
import { useMatch } from '../../hooks/useMatch'
import { usePlayers } from '../../hooks/usePlayers'
import { useLiveCounts } from '../../hooks/useLiveCounts'
import { addLiveEvent, removeLastLiveEvent, LIVE_EVENT_TYPES, type LiveEventType } from '../../services/firebase/events'
import { useCountersStore } from '../../state/counters'
import { parseMinuteStrToSec, formatSecToMinuteStr } from '../../utils/time'
import { usePresence } from '../../hooks/usePresence'
import clsx from 'clsx'

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
    <div className="space-y-4">
      <PartyBar
        dayId={match.dayId}
        indexInDay={match.indexInDay}
        videoRef={match.videoRef}
        result={match.result}
        minuteStr={minuteStr}
        setMinuteStr={setMinuteStr}
        presence={presence}
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roster.map((p: any) => (
          <PlayerCounters
            key={p.id}
            playerId={p.id}
            playerName={p.name}
            team={p.team}
            matchId={matchId}
            videoRef={match.videoRef}
            counts={counts[p.id] ?? {}}
          />
        ))}
      </div>
    </div>
  )
}

function PartyBar(props: {
  dayId: string
  indexInDay: number
  videoRef: number
  result: { t1: number, t2: number }
  minuteStr: string
  setMinuteStr: (s: string) => void
  presence: any[]
}) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm border flex items-center justify-between gap-3 flex-wrap">
      <div className="text-sm">
        <div className="font-medium">Día {props.dayId} · Partido {props.indexInDay} · Video {props.videoRef}</div>
        <div className="text-gray-500">Resultado: {props.result?.t1 ?? 0} - {props.result?.t2 ?? 0}</div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Minuto</label>
        <input className="border px-2 py-1 rounded w-24 text-center" value={props.minuteStr} onChange={e=>props.setMinuteStr(e.target.value)} />
      </div>
      <PresenceChips list={props.presence} />
    </div>
  )
}

function PresenceChips({ list }: { list: any[] }) {
  if (!list || list.length === 0) return <div className="text-xs text-gray-500">Sin admins conectados</div>
  return (
    <div className="flex items-center gap-2">
      {list.map((u: any) => (
        <div key={u.uid} className="flex items-center gap-2 px-2 py-1 border rounded-full bg-white">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
            {avatarInitials(u.displayName || u.email || 'A')}
          </div>
          <div className="text-xs">
            <div className="font-medium">{(u.displayName || u.email || '').split('@')[0]}</div>
            {typeof u.minuteSec === 'number' && <div className="text-gray-500">{formatSecToMinuteStr(u.minuteSec)}</div>}
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

function PlayerCounters(props: {
  playerId: string
  playerName: string
  team: 'team1'|'team2'
  matchId: string
  videoRef: number
  counts: Record<string, number>
}) {
  const [minuteStr, setMinuteStr] = useState('')
  const globalMinute = useCountersStore(s => s.currentMinuteSec)
  const pending = useCountersStore(s => s.pending)
  const addPending = useCountersStore(s => s.addPending)
  const clearPending = useCountersStore(s => s.clearPending)

  useEffect(() => {
    setMinuteStr(formatSecToMinuteStr(globalMinute))
  }, [globalMinute])

  function optimisticDelta(type: string) {
    const k = `${props.playerId}:${type}` as `${string}:${string}`
    return pending[k] ?? 0
  }

  async function inc(type: LiveEventType) {
    const minuteSec = parseMinuteStrToSec(minuteStr || '00:00')
    addPending(props.playerId, type, +1)
    try {
      await addLiveEvent({
        matchId: props.matchId,
        playerId: props.playerId,
        team: props.team,
        type,
        minuteSec,
        videoRef: props.videoRef
      })
    } finally {
      clearPending(props.playerId, type)
    }
  }

  async function dec(type: LiveEventType) {
    addPending(props.playerId, type, -1)
    try {
      await removeLastLiveEvent({
        matchId: props.matchId,
        playerId: props.playerId,
        type
      })
    } finally {
      clearPending(props.playerId, type)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm border">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{props.playerName}</div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-600">Minuto</label>
        <input className="border px-2 py-1 rounded w-24 text-center" value={minuteStr} onChange={e=>setMinuteStr(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LIVE_EVENT_TYPES.map((t) => {
          const base = props.counts[t] ?? 0
          const overlay = optimisticDelta(t)
          const value = base + overlay
          return (
            <Counter key={t} label={t} value={value} onInc={() => inc(t)} onDec={() => dec(t)} pending={overlay !== 0} />
          )
        })}
      </div>
    </div>
  )
}

function Counter({ label, value, onInc, onDec, pending }: { label: string, value: number, onInc: ()=>void, onDec: ()=>void, pending: boolean }) {
  return (
    <div className={clsx("border rounded p-2", pending && "opacity-70")}>
    
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <button className="px-2 py-1 border rounded" onClick={onDec}>−</button>
        <div className="font-semibold">{value}</div>
        <button className="px-2 py-1 border rounded" onClick={onInc}>＋</button>
      </div>
    </div>
  )
}