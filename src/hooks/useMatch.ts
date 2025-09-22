import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase/client'

export function useMatch(matchId?: string) {
  const [match, setMatch] = useState<any | null>(null)
  const [loading, setLoading] = useState(Boolean(matchId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) return
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const snap = await getDoc(doc(db, 'matches', matchId))
        if (!mounted) return
        if (!snap.exists()) throw new Error('Match no encontrado')
        setMatch({ id: snap.id, ...(snap.data() as any) })
      } catch (e: any) {
        setError(e?.message ?? String(e))
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [matchId])

  return { match, loading, error }
}