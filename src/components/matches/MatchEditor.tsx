import { useEffect, useMemo, useState } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { buildMatchInput, parseGoalRows, unparseGoalRows } from '../../converters/match'
import { createMatchWithGoals, loadMatchWithGoals, updateMatchWithGoals } from '../../services/firebase/firestore'
import type { GoalRow } from '../../types/domain'
import clsx from 'clsx'

type Props = { onClose?: () => void, matchId?: string }

export function MatchEditor({ onClose, matchId }: Props) {
  const { players, loading } = usePlayers()

  const [dayId, setDayId] = useState('day-1')
  const [indexInDay, setIndexInDay] = useState(1)
  const [videoRef, setVideoRef] = useState(1)
  const [team1, setTeam1] = useState<string[]>([])
  const [team2, setTeam2] = useState<string[]>([])
  const [resultT1, setResultT1] = useState(0)
  const [resultT2, setResultT2] = useState(0)

  const [goals, setGoals] = useState<GoalRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okId, setOkId] = useState<string | null>(null)
  const isEdit = Boolean(matchId)
  const [loadingMatch, setLoadingMatch] = useState(false)

  useEffect(() => {
    if (!matchId) return
    let mounted = true
    async function run() {
      setLoadingMatch(true)
      setError(null)
      try {
        const m = await loadMatchWithGoals(matchId)
        if (!mounted) return
        setDayId(m.dayId)
        setIndexInDay(m.indexInDay)
        setVideoRef(m.videoRef)
        setTeam1(m.team1 ?? [])
        setTeam2(m.team2 ?? [])
        setResultT1(m.result?.t1 ?? 0)
        setResultT2(m.result?.t2 ?? 0)
        const parsed = (m.events ?? []).map((e: any) => ({
          minuteSec: e.minuteSec,
          scorerId: e.playerId ?? undefined,
          assistId: e.assistBy ?? undefined,
          keeperId: e.keeperId ?? undefined,
          team: e.team,
          ownGoal: e.type === 'own_goal'
        }))
        setGoals(unparseGoalRows(parsed))
      } catch (e: any) {
        setError(e?.message ?? String(e))
      } finally {
        setLoadingMatch(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [matchId])

  const team1Names = useMemo(() => team1.map(id => players.find(p=>p.id===id)?.name || '??'), [team1, players])
  const team2Names = useMemo(() => team2.map(id => players.find(p=>p.id===id)?.name || '??'), [team2, players])

  function togglePlayer(team: 'team1'|'team2', id: string) {
    if (team === 'team1') {
      setTeam1(prev => prev.includes(id) ? prev.filter(x=>x!==id) : (prev.length<8 ? [...prev, id] : prev))
      if (team2.includes(id)) setTeam2(prev => prev.filter(x=>x!==id))
    } else {
      setTeam2(prev => prev.includes(id) ? prev.filter(x=>x!==id) : (prev.length<8 ? [...prev, id] : prev))
      if (team1.includes(id)) setTeam1(prev => prev.filter(x=>x!==id))
    }
  }

  function addGoal() {
    setGoals(g => [...g, { minuteStr: '00:00', team: 'team1', ownGoal: false }])
  }
  function updateGoal(idx: number, patch: Partial<GoalRow>) {
    setGoals(g => g.map((row, i) => i===idx ? { ...row, ...patch } : row))
  }
  function removeGoal(idx: number) {
    setGoals(g => g.filter((_, i) => i!==idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setOkId(null)
    try {
      const input = buildMatchInput({
        dayId, indexInDay, videoRef,
        team1, team2,
        result: { t1: resultT1, t2: resultT2 },
        team1Names, team2Names
      })
      const parsedGoals = parseGoalRows(goals)
      const id = isEdit && matchId
        ? await updateMatchWithGoals(matchId, input, parsedGoals)
        : await createMatchWithGoals(input, parsedGoals)

      setOkId(id as string)
      if (!isEdit) {
        setGoals([]); setTeam1([]); setTeam2([]); setResultT1(0); setResultT2(0)
      }
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || (isEdit && loadingMatch)) return <div>Cargando…</div>

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{isEdit ? 'Editar partido' : 'Crear partido'}</h3>
        {onClose && <button type="button" className="px-2 py-1 rounded border" onClick={onClose}>Cerrar</button>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Día (id)</label>
          <input className="border px-3 py-2 rounded w-full" value={dayId} onChange={e=>setDayId(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Partido (índice)</label>
          <input type="number" className="border px-3 py-2 rounded w-full" value={indexInDay} onChange={e=>setIndexInDay(parseInt(e.target.value||'0'))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Video (número)</label>
          <input type="number" className="border px-3 py-2 rounded w-full" value={videoRef} onChange={e=>setVideoRef(parseInt(e.target.value||'0'))} />
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Resultado</label>
            <div className="flex items-center gap-2">
              <input type="number" className="border px-3 py-2 rounded w-16" value={resultT1} onChange={e=>setResultT1(parseInt(e.target.value||'0'))} />
              <span>-</span>
              <input type="number" className="border px-3 py-2 rounded w-16" value={resultT2} onChange={e=>setResultT2(parseInt(e.target.value||'0'))} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TeamPicker title="Equipo 1" players={players} selected={team1} onToggle={(id)=>togglePlayer('team1', id)} />
        <TeamPicker title="Equipo 2" players={players} selected={team2} onToggle={(id)=>togglePlayer('team2', id)} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Tabla de goles</h3>
          <button type="button" className="px-2 py-1 rounded border" onClick={addGoal}>+ Añadir</button>
        </div>
        <div className="grid gap-2">
          {goals.map((g, idx) => (
            <div key={idx} className="grid md:grid-cols-7 grid-cols-2 gap-2 items-center border rounded p-2">
              <input className="border px-2 py-1 rounded" placeholder="mm:ss" value={g.minuteStr} onChange={e=>updateGoal(idx, { minuteStr: e.target.value })} />
              <select className="border px-2 py-1 rounded" value={g.team} onChange={e=>updateGoal(idx, { team: e.target.value as any })}>
                <option value="team1">Team 1</option>
                <option value="team2">Team 2</option>
              </select>
              <select className="border px-2 py-1 rounded" value={g.scorerId ?? ''} onChange={e=>updateGoal(idx, { scorerId: e.target.value || undefined })}>
                <option value="">Goleador (opcional)</option>
                {(g.team==='team1'?team1:team2).map(id => (
                  <option key={id} value={id}>{players.find(p=>p.id===id)?.name}</option>
                ))}
              </select>
              <select className="border px-2 py-1 rounded" value={g.assistId ?? ''} onChange={e=>updateGoal(idx, { assistId: e.target.value || undefined })}>
                <option value="">Asistente (opcional)</option>
                {(g.team==='team1'?team1:team2).map(id => (
                  <option key={id} value={id}>{players.find(p=>p.id===id)?.name}</option>
                ))}
              </select>
              <select className="border px-2 py-1 rounded" value={g.keeperId ?? ''} onChange={e=>updateGoal(idx, { keeperId: e.target.value || undefined })}>
                <option value="">Portero rival (opcional)</option>
                {(g.team==='team1'?team2:team1).map(id => (
                  <option key={id} value={id}>{players.find(p=>p.id===id)?.name}</option>
                ))}
              </select>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" checked={g.ownGoal} onChange={e=>updateGoal(idx, { ownGoal: e.target.checked })} />
                <span>Gol en propia</span>
              </label>
              <button type="button" className="px-2 py-1 rounded border" onClick={()=>removeGoal(idx)}>Eliminar</button>
            </div>
          ))}
          {goals.length===0 && <p className="text-sm text-gray-500">No hay goles añadidos.</p>}
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {okId && <div className="text-green-700 text-sm">Guardado OK. ID: {okId}</div>}
          

      <div className="flex items-center gap-2">
        <button
          disabled={submitting}
          className={clsx('px-3 py-2 rounded-lg text-white', submitting ? 'bg-gray-400' : 'bg-secondary hover:opacity-90')}
        >
          {isEdit ? 'Guardar cambios' : 'Guardar partido'}
        </button>
        {onClose && <button type="button" className="px-3 py-2 rounded-lg border" onClick={onClose}>Cerrar</button>}
      </div>
    </form>
  )
}

function TeamPicker({ title, players, selected, onToggle }: { title: string, players: {id:string, name:string}[], selected: string[], onToggle: (id:string)=>void }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm border">
      <h3 className="font-medium mb-2">{title} <span className="text-xs text-gray-500">({selected.length}/8)</span></h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {players.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onToggle(p.id)}
            /* className={'px-2 py-1 rounded border text-left text-sm'} */
            className={clsx(
              'px-2 py-1 rounded border text-left text-sm',
              selected.includes(p.id) ? 'bg-primary text-white border-primary' : 'bg-white'
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
