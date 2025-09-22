import { useDashboardStats } from '../../hooks/useDashboardStats'
import { KPIs } from '../../components/dashboard/KPIs'
import { MiniRankings } from '../../components/dashboard/MiniRankings'

export function DashboardHome() {
  const data = useDashboardStats()

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <h3 className="font-medium mb-3">KPIs</h3>
        <KPIs data={data.kpi} />
      </div>

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
    </section>
  )
}