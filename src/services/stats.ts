import { db } from './firebase/client'
import { collection, collectionGroup, onSnapshot } from 'firebase/firestore'

export type KPI = {
  goalsTotal: number
  assistsTotal: number
  passPctAvg: number // 0..1
  shotsOnTargetTotal: number
  interceptionsTotal: number
  savesTotal: number
}

export type TopGoalsRow = { playerId: string, name: string, goals: number, ga: number }
export type TopPassPctRow = { playerId: string, name: string, passPct: number, passes: number, days: number }
export type TopAssistRow = { playerId: string, name: string, assists: number }
export type TopKeyPassRow = { playerId: string, name: string, keyPasses: number }
export type TopInterceptionRow = { playerId: string, name: string, interceptions: number }

export function computeDashboardStats(input: {
  events: any[],
  matches: any[],
  players: any[]
}) {
  const { events, matches, players } = input
  const pmap = new Map(players.map((p:any) => [p.id, p]))

  // --- KPIs aggregation ---
  let goalsTotal = 0
  let assistsTotal = 0
  let pass = 0, passSuccess = 0
  let shotsOnTarget = 0, interceptions = 0, saves = 0

  const goalsByPlayer = new Map<string, number>()
  const assistsByPlayer = new Map<string, number>()
  const passByPlayer = new Map<string, number>()
  const passSuccessByPlayer = new Map<string, number>()
  const keyPassByPlayer = new Map<string, number>()
  const interceptionsByPlayer = new Map<string, number>()

  for (const e of events) {
    const type = e.type
    if (type === 'goal') {
      goalsTotal += 1
      if (e.playerId) {
        goalsByPlayer.set(e.playerId, (goalsByPlayer.get(e.playerId) ?? 0) + 1)
      }
      if (e.assistBy) {
        assistsTotal += 1
        assistsByPlayer.set(e.assistBy, (assistsByPlayer.get(e.assistBy) ?? 0) + 1)
      }
    } else if (type === 'pass') {
      pass += 1
      if (e.playerId) passByPlayer.set(e.playerId, (passByPlayer.get(e.playerId) ?? 0) + 1)
    } else if (type === 'pass_success') {
      passSuccess += 1
      if (e.playerId) passSuccessByPlayer.set(e.playerId, (passSuccessByPlayer.get(e.playerId) ?? 0) + 1)
    } else if (type === 'shot_on_target') {
      shotsOnTarget += 1
    } else if (type === 'interception') {
      interceptions += 1
      if (e.playerId) interceptionsByPlayer.set(e.playerId, (interceptionsByPlayer.get(e.playerId) ?? 0) + 1)
    } else if (type === 'save') {
      saves += 1
    } else if (type === 'key_pass') {
      if (e.playerId) keyPassByPlayer.set(e.playerId, (keyPassByPlayer.get(e.playerId) ?? 0) + 1)
    } else if (type === 'assist') {
      // In case we ever log 'assist' directly (not needed now), count it
      if (e.playerId) {
        assistsTotal += 1
        assistsByPlayer.set(e.playerId, (assistsByPlayer.get(e.playerId) ?? 0) + 1)
      }
    }
  }

  const passPctAvg = pass > 0 ? (passSuccess / pass) : 0

  // --- Days played per player (from matches rosters) ---
  const daysByPlayer = new Map<string, Set<string>>()
  for (const m of matches) {
    const dayId = m.dayId
    for (const pid of (m.team1 ?? [])) {
      if (!daysByPlayer.has(pid)) daysByPlayer.set(pid, new Set())
      daysByPlayer.get(pid)!.add(dayId)
    }
    for (const pid of (m.team2 ?? [])) {
      if (!daysByPlayer.has(pid)) daysByPlayer.set(pid, new Set())
      daysByPlayer.get(pid)!.add(dayId)
    }
  }

  // --- Top goals ---
  const topGoals: TopGoalsRow[] = []
  for (const [pid, player] of pmap) {
    const g = goalsByPlayer.get(pid) ?? 0
    const a = assistsByPlayer.get(pid) ?? 0
    if (g > 0 || a > 0) {
      topGoals.push({ playerId: pid, name: player.name, goals: g, ga: g + a })
    }
  }
  topGoals.sort((x, y) => y.goals - x.goals || y.ga - x.ga || x.name.localeCompare(y.name))

  // --- Top pass pct with filters ---
  const topPassPct: TopPassPctRow[] = []
  for (const [pid, player] of pmap) {
    const p = passByPlayer.get(pid) ?? 0
    const ps = passSuccessByPlayer.get(pid) ?? 0
    const days = daysByPlayer.get(pid)?.size ?? 0
    if (p >= 100 && days >= 4) {
      const pct = p > 0 ? ps / p : 0
      topPassPct.push({ playerId: pid, name: player.name, passPct: pct, passes: p, days })
    }
  }
  topPassPct.sort((a, b) => b.passPct - a.passPct || b.passes - a.passes || a.name.localeCompare(b.name))

  // --- Top assists ---
  const topAssists: TopAssistRow[] = []
  for (const [pid, player] of pmap) {
    const a = assistsByPlayer.get(pid) ?? 0
    if (a > 0) topAssists.push({ playerId: pid, name: player.name, assists: a })
  }
  topAssists.sort((a, b) => b.assists - a.assists || a.name.localeCompare(b.name))

  // --- Top key passes ---
  const topKeyPass: TopKeyPassRow[] = []
  for (const [pid, player] of pmap) {
    const kp = keyPassByPlayer.get(pid) ?? 0
    if (kp > 0) topKeyPass.push({ playerId: pid, name: player.name, keyPasses: kp })
  }
  topKeyPass.sort((a, b) => b.keyPasses - a.keyPasses || a.name.localeCompare(b.name))

  // --- Top interceptions ---
  const topInterceptions: TopInterceptionRow[] = []
  for (const [pid, player] of pmap) {
    const itc = interceptionsByPlayer.get(pid) ?? 0
    if (itc > 0) topInterceptions.push({ playerId: pid, name: player.name, interceptions: itc })
  }
  topInterceptions.sort((a, b) => b.interceptions - a.interceptions || a.name.localeCompare(b.name))

  return {
    kpi: {
      goalsTotal,
      assistsTotal,
      passPctAvg,
      shotsOnTargetTotal: shotsOnTarget,
      interceptionsTotal: interceptions,
      savesTotal: saves
    },
    topGoals,
    topPassPct,
    topAssists,
    topKeyPass,
    topInterceptions
  }
}

export function listenDashboardStats(cb: (data: ReturnType<typeof computeDashboardStats>) => void) {
  // Listen to events, matches, players
  let events: any[] = []
  let matches: any[] = []
  let players: any[] = []
  const recompute = () => {
    if (!players.length) return
    cb(computeDashboardStats({ events, matches, players }))
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