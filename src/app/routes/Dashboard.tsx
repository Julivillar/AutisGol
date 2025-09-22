import { useState } from 'react'
import { MatchEditor } from '../../components/matches/MatchEditor'
import { MatchesList } from '../../components/matches/MatchesList'
import { LiveCounters } from '../../components/counters/LiveCounters'
import { useDashboardStats } from '../../hooks/useDashboardStats'
/* import { KPIs } from '../../components/dashboard/KPIs' */
import { MiniRankings } from '../../components/dashboard/MiniRankings'
import { StatsTable } from '../../components/stats/StatsTable'

export function Dashboard() {
  const [openCreate, setOpenCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [countId, setCountId] = useState<string | null>(null)

  const data = useDashboardStats()

  return (
    <section className="space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90"
            onClick={() => { setCountId(null); setEditId(null); setOpenCreate(true) }}
          >
            Crear partido
          </button>
        </div>
      </div>

      {/* <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <h3 className="font-medium mb-3">KPIs</h3>
        <KPIs data={data.kpi} />
      </div> */}

      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <h3 className="font-medium mb-3">Mini-rankings</h3>
        <MiniRankings
          topGoals={data.topGoals}
          topPassPct={data.topPassPct}
          topAssists={data.topAssists}
          topKeyPass={data.topKeyPass}
          topInterceptions={data.topInterceptions}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <h3 className="font-medium mb-3">Estadísticas generales</h3>
        <StatsTable />
      </div>

      {countId && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Registro por jugador</h3>
            <button className="px-2 py-1 border rounded" onClick={() => setCountId(null)}>Cerrar</button>
          </div>
          <LiveCounters matchId={countId} />
        </div>
      )}

      {(openCreate || editId) && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <MatchEditor matchId={editId ?? undefined} onClose={() => { setOpenCreate(false); setEditId(null) }} />
        </div>
      )}

      {!countId && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <h3 className="font-medium mb-2">Partidos recientes</h3>
          <MatchesList onEdit={(id) => { setEditId(id); setOpenCreate(false); setCountId(null) }} onCount={(id) => { setCountId(id); setEditId(null); setOpenCreate(false) }} />
        </div>
      )}
    </section>
  )
}