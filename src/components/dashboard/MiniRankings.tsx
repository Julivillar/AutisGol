export function MiniRankings({ topGoals, topPassPct, topAssists, topKeyPass, topInterceptions }: {
  topGoals: { playerId: string, name: string, goals: number, ga: number }[],
  topPassPct: { playerId: string, name: string, passPct: number, passes: number, days: number }[],
  topAssists: { playerId: string, name: string, assists: number }[],
  topKeyPass: { playerId: string, name: string, keyPasses: number }[],
  topInterceptions: { playerId: string, name: string, interceptions: number }[]
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CardGoals rows={topGoals} />
      <CardPassPct rows={topPassPct} />
      <CardAssists rows={topAssists} />
      <CardKeyPass rows={topKeyPass} />
      <CardInterceptions rows={topInterceptions} />
    </div>
  )
}

function CardGoals({ rows }: { rows: { name: string, goals: number, ga: number }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <h4 className="font-medium mb-2">Top goles</h4>
      <Table header={['Jugador','Goles','G+A']} rows={rows.map(r => [r.name, r.goals, r.ga])} colSpan={3} />
    </div>
  )
}
function CardPassPct({ rows }: { rows: { name: string, passPct: number, passes: number, days: number }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <h4 className="font-medium mb-2">Top % pase (≥100 pases y ≥4 días)</h4>
      <Table header={['Jugador','% Pase','Pases','Días']} rows={rows.map(r => [r.name, (r.passPct*100).toFixed(2)+'%', r.passes, r.days])} colSpan={4} />
    </div>
  )
}
function CardAssists({ rows }: { rows: { name: string, assists: number }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <h4 className="font-medium mb-2">Top asistencias</h4>
      <Table header={['Jugador','Asistencias']} rows={rows.map(r => [r.name, r.assists])} colSpan={2} />
    </div>
  )
}
function CardKeyPass({ rows }: { rows: { name: string, keyPasses: number }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <h4 className="font-medium mb-2">Top pases clave</h4>
      <Table header={['Jugador','Pases clave']} rows={rows.map(r => [r.name, r.keyPasses])} colSpan={2} />
    </div>
  )
}
function CardInterceptions({ rows }: { rows: { name: string, interceptions: number }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <h4 className="font-medium mb-2">Top intercepciones</h4>
      <Table header={['Jugador','Intercepciones']} rows={rows.map(r => [r.name, r.interceptions])} colSpan={2} />
    </div>
  )
}

function Table({ header, rows, colSpan }: { header: string[], rows: any[][], colSpan: number }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500">
          {header.map(h => <th key={h} className="py-1">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={colSpan} className="text-gray-500 py-2">Sin datos</td></tr>}
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => <td key={j} className="py-1">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}