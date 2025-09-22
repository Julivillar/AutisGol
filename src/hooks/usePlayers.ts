import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase/client'
import type { Player } from '../types/domain'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function run() {
      const snap = await getDocs(collection(db, 'players'))
      const list: Player[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      if (mounted) {
        // sort by name for stable UI
        setPlayers(list.sort((a,b) => a.name.localeCompare(b.name)))
        setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  return { players, loading }
}