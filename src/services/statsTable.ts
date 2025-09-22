import { collection, collectionGroup, onSnapshot } from 'firebase/firestore'
import { db } from './firebase/client'

export type PlayerRow = {
  playerId: string
  name: string
  days: number
  matches: number
  goalDiff: number // suma de (GF - GC) por partido jugado
  goals: number
  goalsPerDay: number
  goalsPerMatch: number
  shots: number
  shotsOnTarget: number
  pctOnTarget: number | null // shots_on_target / shots
  pctGoalOnTarget: number | null // goals / shots_on_target
  assists: number
  assistsPerDay: number | null
  assistsPerMatch: number | null
  ga: number
  teamGoals: number
  pctTeamGA: number | null // (G+A)/teamGoals
  passes: number
  passesSuccess: number
  pctPass: number | null // pass_success / pass
  passesPerMatch: number | null
  passesSuccessPerMatch: number | null
  keyPass: number
  keyPassPerMatch: number | null
  assistPerKeyPass: number | null // assists/key_pass
  interceptions: number
  interceptionsPerMatch: number | null
  saves: number
  savesPerMatch: number | null
  goalsConceded: number
  ownGoals: number
}

export function computeStatsTable(input: {
  players: any[]
  matches: any[]
  events: any[]
}): PlayerRow[] {
  const { players, matches, events } = input
  const pmap = new Map(players.map((p: any) => [p.id, p]))

  // Index matches by player participation and collect per player days/matches/teamGoals and goalDiff
  const daysByPlayer = new Map<string, Set<string>>()
  const matchesByPlayer = new Map<string, Set<string>>()
  const teamGoalsByPlayer = new Map<string, number>()
  const goalDiffByPlayer = new Map<string, number>()

  for (const m of matches) {
    const t1: string[] = m.team1 ?? []
    const t2: string[] = m.team2 ?? []
    const t1Goals: number = m.result?.t1 ?? 0
    const t2Goals: number = m.result?.t2 ?? 0
    const dayId: string = m.dayId

    const add = (pid: string, gf: number, ga: number) => {
      if (!daysByPlayer.has(pid)) daysByPlayer.set(pid, new Set())
      daysByPlayer.get(pid)!.add(dayId)

      if (!matchesByPlayer.has(pid)) matchesByPlayer.set(pid, new Set())
      matchesByPlayer.get(pid)!.add(m.id)

      teamGoalsByPlayer.set(pid, (teamGoalsByPlayer.get(pid) ?? 0) + gf)
      goalDiffByPlayer.set(pid, (goalDiffByPlayer.get(pid) ?? 0) + (gf - ga))
    }

    for (const pid of t1) add(pid, t1Goals, t2Goals)
    for (const pid of t2) add(pid, t2Goals, t1Goals)
  }

  // Collect events by type per player
  const goalsByPlayer = new Map<string, number>()
  const ownGoalsByPlayer = new Map<string, number>()
  const assistsByPlayer = new Map<string, number>()
  const shotsByPlayer = new Map<string, number>()
  const shotsOnTargetByPlayer = new Map<string, number>()
  const passesByPlayer = new Map<string, number>()
  const passesSuccessByPlayer = new Map<string, number>()
  const keyPassByPlayer = new Map<string, number>()
  const interceptionsByPlayer = new Map<string, number>()
  const savesByPlayer = new Map<string, number>()
  const goalsConcededByPlayer = new Map<string, number>()

  for (const e of events) {
    const pid: string | undefined = e.playerId ?? undefined
    const type: string = e.type
    if (type === 'goal') {
      if (pid) goalsByPlayer.set(pid, (goalsByPlayer.get(pid) ?? 0) + 1)
      if (e.assistBy) {
        const a = String(e.assistBy)
        assistsByPlayer.set(a, (assistsByPlayer.get(a) ?? 0) + 1)
      }
      // keeperId conceded
      if (e.keeperId) {
        const k = String(e.keeperId)
        goalsConcededByPlayer.set(k, (goalsConcededByPlayer.get(k) ?? 0) + 1)
      }
    } else if (type === 'own_goal') {
      if (pid) ownGoalsByPlayer.set(pid, (ownGoalsByPlayer.get(pid) ?? 0) + 1)
      // own goals también cuentan como gol recibido si el evento apunta a un keeperId
      if (e.keeperId) {
        const k = String(e.keeperId)
        goalsConcededByPlayer.set(k, (goalsConcededByPlayer.get(k) ?? 0) + 1)
      }
    } else if (type === 'assist') {
      if (pid) assistsByPlayer.set(pid, (assistsByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'shot') {
      if (pid) shotsByPlayer.set(pid, (shotsByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'shot_on_target') {
      if (pid) shotsOnTargetByPlayer.set(pid, (shotsOnTargetByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'pass') {
      if (pid) passesByPlayer.set(pid, (passesByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'pass_success') {
      if (pid) passesSuccessByPlayer.set(pid, (passesSuccessByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'key_pass') {
      if (pid) keyPassByPlayer.set(pid, (keyPassByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'interception') {
      if (pid) interceptionsByPlayer.set(pid, (interceptionsByPlayer.get(pid) ?? 0) + 1)
    } else if (type === 'save') {
      if (pid) savesByPlayer.set(pid, (savesByPlayer.get(pid) ?? 0) + 1)
    }
  }

  const rows: PlayerRow[] = []
  for (const [pid, p] of pmap) {
    const days = daysByPlayer.get(pid)?.size ?? 0
    const matchesCount = matchesByPlayer.get(pid)?.size ?? 0
    const teamGoals = teamGoalsByPlayer.get(pid) ?? 0
    const g = goalsByPlayer.get(pid) ?? 0
    const a = assistsByPlayer.get(pid) ?? 0
    const ga = g + a

    const shots = shotsByPlayer.get(pid) ?? 0
    const shotsOn = shotsOnTargetByPlayer.get(pid) ?? 0
    const passes = passesByPlayer.get(pid) ?? 0
    const passesOk = passesSuccessByPlayer.get(pid) ?? 0
    const keyPass = keyPassByPlayer.get(pid) ?? 0
    const interceptions = interceptionsByPlayer.get(pid) ?? 0
    const saves = savesByPlayer.get(pid) ?? 0
    const goalsConceded = goalsConcededByPlayer.get(pid) ?? 0
    const ownGoals = ownGoalsByPlayer.get(pid) ?? 0

    const goalDiff = goalDiffByPlayer.get(pid) ?? 0

    const safeDiv = (num: number, den: number): number | null => den > 0 ? num / den : null

    const row: PlayerRow = {
      playerId: pid,
      name: p.name,
      days,
      matches: matchesCount,
      goalDiff,
      goals: g,
      goalsPerDay: days > 0 ? g / days : 0,
      goalsPerMatch: matchesCount > 0 ? g / matchesCount : 0,
      shots,
      shotsOnTarget: shotsOn,
      pctOnTarget: safeDiv(shotsOn, shots),
      pctGoalOnTarget: safeDiv(g, shotsOn),
      assists: a,
      assistsPerDay: safeDiv(a, days || 0),
      assistsPerMatch: safeDiv(a, matchesCount || 0),
      ga,
      teamGoals,
      pctTeamGA: safeDiv(ga, teamGoals || 0),
      passes,
      passesSuccess: passesOk,
      pctPass: safeDiv(passesOk, passes || 0),
      passesPerMatch: safeDiv(passes, matchesCount || 0),
      passesSuccessPerMatch: safeDiv(passesOk, matchesCount || 0),
      keyPass,
      keyPassPerMatch: safeDiv(keyPass, matchesCount || 0),
      assistPerKeyPass: safeDiv(a, keyPass || 0),
      interceptions,
      interceptionsPerMatch: safeDiv(interceptions, matchesCount || 0),
      saves,
      savesPerMatch: safeDiv(saves, matchesCount || 0),
      goalsConceded,
      ownGoals
    }
    rows.push(row)
  }

  // Default sort by name
  rows.sort((a, b) => a.name.localeCompare(b.name))
  return rows
}

export function listenStatsTable(cb: (rows: PlayerRow[]) => void) {
  let events: any[] = []
  let matches: any[] = []
  let players: any[] = []
  const recompute = () => {
    if (!players.length) return
    cb(computeStatsTable({ players, matches, events }))
  }

  const unsubEvents = onSnapshot(collectionGroup(db, 'events'), (snap) => {
    events = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    recompute()
  })
  const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
    matches = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    recompute()
  })
  const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
    players = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    recompute()
  })

  return () => { unsubEvents(); unsubMatches(); unsubPlayers(); }
}