/* export function KPIs({ data }: { data: {
  goalsTotal: number
  assistsTotal: number
  passPctAvg: number
  shotsOnTargetTotal: number
  interceptionsTotal: number
  savesTotal: number
} }) {
  const items = [
    { label: 'Goles totales', value: data.goalsTotal },
    { label: 'Asistencias totales', value: data.assistsTotal },
    { label: '% Pase medio', value: (data.passPctAvg * 100).toFixed(2) + '%' },
    { label: 'Tiros a puerta', value: data.shotsOnTargetTotal },
    { label: 'Intercepciones', value: data.interceptionsTotal },
    { label: 'Paradas', value: data.savesTotal }
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl bg-white p-4 shadow-sm border">
          <div className="text-sm text-gray-600">{it.label}</div>
          <div className="text-2xl font-semibold">{it.value}</div>
        </div>
      ))}
    </div>
  )
} */