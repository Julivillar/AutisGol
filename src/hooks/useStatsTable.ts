import { useEffect, useMemo, useState } from 'react'
import { listenStatsTable, type PlayerRow } from '../services/statsTable'

export type SortKey = keyof PlayerRow

export function useStatsTable() {
  const [rows, setRows] = useState<PlayerRow[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([]) // playerIds
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const unsub = listenStatsTable(setRows)
    return () => { unsub && unsub() }
  }, [])

  const filtered = useMemo(() => {
    let list = rows
    if (selected.length > 0) list = list.filter(r => selected.includes(r.playerId))
    if (search.trim()) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    list = [...list].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string') return dir * av.localeCompare(bv)
      return dir * (Number(av ?? 0) - Number(bv ?? 0))
    })
    return list
  }, [rows, search, selected, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function toggleSelected(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return {
    rows,
    filtered,
    search, setSearch,
    selected, toggleSelected, clearSelected: () => setSelected([]),
    sortKey, sortDir, toggleSort
  }
}