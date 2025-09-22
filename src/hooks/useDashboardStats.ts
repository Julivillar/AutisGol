import { useEffect, useState } from 'react'
import { listenDashboardStats } from '../services/stats'

export function useDashboardStats() {
  const [data, setData] = useState<ReturnType<typeof init> | null>(null)

  useEffect(() => {
    const unsub = listenDashboardStats((d) => setData({
      kpi: d.kpi,
      topGoals: d.topGoals.slice(0, 5),
      topPassPct: d.topPassPct.slice(0, 5),
      topAssists: d.topAssists.slice(0, 5),
      topKeyPass: d.topKeyPass.slice(0, 5),
      topInterceptions: d.topInterceptions.slice(0, 5)
    } as any))
    return () => { unsub && unsub() }
  }, [])

  return data ?? init()
}

function init() {
  return {
    kpi: {
      goalsTotal: 0,
      assistsTotal: 0,
      passPctAvg: 0,
      shotsOnTargetTotal: 0,
      interceptionsTotal: 0,
      savesTotal: 0
    },
    topGoals: [] as { playerId: string, name: string, goals: number, ga: number }[],
    topPassPct: [] as { playerId: string, name: string, passPct: number, passes: number, days: number }[],
    topAssists: [] as { playerId: string, name: string, assists: number }[],
    topKeyPass: [] as { playerId: string, name: string, keyPasses: number }[],
    topInterceptions: [] as { playerId: string, name: string, interceptions: number }[]
  }
}