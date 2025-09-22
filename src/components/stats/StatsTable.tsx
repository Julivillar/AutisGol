import { useState, useMemo } from 'react'
import { useStatsTable } from '../../hooks/useStatsTable'
import { usePlayers } from '../../hooks/usePlayers'
import type { PlayerRow } from '../../services/statsTable'

export function StatsTable() {
  const s = useStatsTable()
  const { players } = usePlayers()


  const columns: { key: keyof PlayerRow, label: string, fmt?: 'int' | 'pct' | 'ratio', numeric?: boolean }[] = [
    { key: 'name', label: 'Jugador' },
    { key: 'days', label: 'Días', fmt: 'int', numeric: true },
    { key: 'matches', label: 'Partidos', fmt: 'int', numeric: true },
    { key: 'goalDiff', label: 'Ventaja/Des', fmt: 'int', numeric: true },
    { key: 'goals', label: 'Goles', fmt: 'int', numeric: true },
    { key: 'goalsPerDay', label: 'Goles/Día', fmt: 'ratio', numeric: true },
    { key: 'goalsPerMatch', label: 'Goles/Partido', fmt: 'ratio', numeric: true },
    { key: 'shots', label: 'Tiros', fmt: 'int', numeric: true },
    { key: 'shotsOnTarget', label: 'Tiros a puerta', fmt: 'int', numeric: true },
    { key: 'pctOnTarget', label: '% tiro a puerta', fmt: 'pct', numeric: true },
    { key: 'pctGoalOnTarget', label: '% puerta a gol', fmt: 'pct', numeric: true },
    { key: 'assists', label: 'Asistencias', fmt: 'int', numeric: true },
    { key: 'assistsPerDay', label: 'Asis/Día', fmt: 'ratio', numeric: true },
    { key: 'assistsPerMatch', label: 'Asis/Partido', fmt: 'ratio', numeric: true },
    { key: 'ga', label: 'G+A', fmt: 'int', numeric: true },
    { key: 'teamGoals', label: 'Goles de su equipo', fmt: 'int', numeric: true },
    { key: 'pctTeamGA', label: 'Partic. G+A equipo', fmt: 'pct', numeric: true },
    { key: 'passes', label: 'Pases', fmt: 'int', numeric: true },
    { key: 'passesSuccess', label: 'Pases acertados', fmt: 'int', numeric: true },
    { key: 'pctPass', label: '% pase', fmt: 'pct', numeric: true },
    { key: 'passesPerMatch', label: 'Pases/Partido', fmt: 'ratio', numeric: true },
    { key: 'passesSuccessPerMatch', label: 'Pases ac./Partido', fmt: 'ratio', numeric: true },
    { key: 'keyPass', label: 'Pases clave', fmt: 'int', numeric: true },
    { key: 'keyPassPerMatch', label: 'Claves/Partido', fmt: 'ratio', numeric: true },
    { key: 'assistPerKeyPass', label: 'Asis/Clave', fmt: 'ratio', numeric: true },
    { key: 'interceptions', label: 'Intercepciones', fmt: 'int', numeric: true },
    { key: 'interceptionsPerMatch', label: 'Interc./Partido', fmt: 'ratio', numeric: true },
    { key: 'saves', label: 'Paradas', fmt: 'int', numeric: true },
    { key: 'savesPerMatch', label: 'Paradas/Partido', fmt: 'ratio', numeric: true },
    { key: 'goalsConceded', label: 'Goles recibidos', fmt: 'int', numeric: true },
    { key: 'ownGoals', label: 'Gol en propia', fmt: 'int', numeric: true }
  ]

  const PRESETS: Record<string, (keyof PlayerRow)[]> = {
    'Básico': ['name', 'days', 'matches', 'goalDiff', 'goals', 'ga', 'teamGoals', 'pctTeamGA'],
    'Tiro': ['name', 'shots', 'shotsOnTarget', 'pctOnTarget', 'pctGoalOnTarget', 'goals', 'goalsPerMatch'],
    'Pase': ['name', 'passes', 'passesSuccess', 'pctPass', 'passesPerMatch', 'passesSuccessPerMatch', 'keyPass', 'keyPassPerMatch', 'assistPerKeyPass', 'assists', 'assistsPerMatch', 'assistsPerDay'],
    'Defensa': ['name', 'interceptions', 'interceptionsPerMatch'],
    'Portería': ['name', 'saves', 'savesPerMatch', 'goalsConceded', 'ownGoals'],
    'Todo': columns.map(c => c.key)
  }

  const [visible, setVisible] = useState<Set<keyof PlayerRow>>(new Set(PRESETS['Básico']))
  const [preset, setPreset] = useState<string>('Básico')
  const visibleColumns = useMemo(() => columns.filter(c => visible.has(c.key)), [columns, visible])

  function applyPreset(name: string) {
    const keys = PRESETS[name] || PRESETS['Todo']
    setPreset(name)
    setVisible(new Set(keys))
  }

  function fmtVal(v: any, fmt?: 'int' | 'pct' | 'ratio') {
    if (fmt === 'int') return v ?? 0
    if (fmt === 'pct') return v == null ? '—' : (v * 100).toFixed(2) + '%'
    if (fmt === 'ratio') return v == null ? '—' : Number(v).toFixed(2)
    return String(v ?? '')
  }

  return (
    <div className="space-y-3">
      {/* Controles arriba: no deben scrollear horizontal */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Buscar jugador…"
          value={s.search}
          onChange={e => s.setSearch(e.target.value)}
        />

        {/* Botones de presets */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              className={`px-2 py-1 rounded border text-sm ${preset === name ? 'bg-primary text-white border-primary' : 'bg-white'}`}
              onClick={() => applyPreset(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Card contenedora: oculta overflow horizontal */}
      <div className="rounded-2xl bg-white p-3 shadow-sm border overflow-x-hidden">
        {/* Filtros de jugadores (estáticos, sin scroll horizontal) */}
        <div className="mb-2">
          <div className="text-sm text-gray-600 mb-1">Filtrar jugadores</div>
          <div className="flex flex-wrap gap-2">
            {usePlayers().players.map(p => {
              const active = s.selected.includes(p.id)
              return (
                <button
                  key={p.id}
                  className={`px-2 py-1 rounded border text-sm ${active ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                  onClick={() => s.toggleSelected(p.id)}
                >
                  {p.name}
                </button>
              )
            })}
            {s.selected.length > 0 && (
              <button className="px-2 py-1 rounded border text-sm" onClick={s.clearSelected}>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* SOLO la tabla scrollea horizontalmente */}
        <div className="relative overflow-x-auto">
          <table className="w-max min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                {visibleColumns.map(col => (
                  <th
                    key={String(col.key)}
                    className={`py-2 px-3 whitespace-nowrap ${col.key === 'name' ? 'min-w-[180px]' : 'min-w-[140px]'} ${col.numeric ? 'text-right' : ''} cursor-pointer select-none`}
                    onClick={() => s.toggleSort(col.key)}
                    title="Ordenar"
                  >
                    {col.label}
                    {s.sortKey === col.key ? (s.sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.filtered.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length} className="py-4 text-center text-gray-500">
                    Sin datos
                  </td>
                </tr>
              )}
              {s.filtered.map((r) => (
                <tr key={r.playerId} className="border-t last:border-b">
                  {visibleColumns.map(col => (
                    <td
                      key={String(col.key)}
                      className={`py-2 px-3 whitespace-nowrap ${col.key === 'name' ? 'min-w-[180px]' : 'min-w-[140px]'} ${col.numeric ? 'text-right' : ''}`}
                    >
                      {fmtVal(r[col.key], col.fmt)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}