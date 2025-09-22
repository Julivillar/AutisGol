import { useEffect, useState } from 'react'
import { joinPresence, heartbeatPresence, leavePresence, listenPresence } from '../services/firebase/presence'

export function usePresence(matchId?: string, minuteSec?: number) {
  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    if (!matchId) return
    let mounted = true
    // join on mount
    if (typeof minuteSec === 'number') {
      joinPresence(matchId, minuteSec).catch(()=>{})
    } else {
      joinPresence(matchId, 0).catch(()=>{})
    }
    const unsub = listenPresence(matchId, (arr) => {
      if (!mounted) return
      setList(arr)
    })

    const iv = setInterval(() => {
      heartbeatPresence(matchId!, minuteSec).catch(()=>{})
    }, 15000) // 15s heartbeat

    const onUnload = () => {
      leavePresence(matchId!).catch(()=>{})
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      mounted = false
      clearInterval(iv)
      unsub && unsub()
      window.removeEventListener('beforeunload', onUnload)
      leavePresence(matchId!).catch(()=>{})
    }
  }, [matchId])

  // Update minute when it changes
  useEffect(() => {
    if (!matchId) return
    heartbeatPresence(matchId, minuteSec).catch(()=>{})
  }, [matchId, minuteSec])

  return list
}