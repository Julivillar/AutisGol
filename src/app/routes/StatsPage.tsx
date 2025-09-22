import { StatsTable } from '../../components/stats/StatsTable'

export function StatsPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Estadísticas generales</h2>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <StatsTable />
      </div>
    </section>
  )
}