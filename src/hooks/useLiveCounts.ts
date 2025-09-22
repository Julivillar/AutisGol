import { useEffect, useState } from 'react'
import { listenLiveCounts } from '../services/firebase/events'

export function useLiveCounts(matchId?: string) {
  const [counts, setCounts] = useState<Record<string, Record<string, number>>>({})
  useEffect(() => {
    if (!matchId) return
    const unsub = listenLiveCounts(matchId, setCounts)
    return () => { unsub && unsub() }
  }, [matchId])
  return counts
}