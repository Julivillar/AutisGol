import { db, auth } from './client'
import {
  addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, where, onSnapshot
} from 'firebase/firestore'

export type LiveEventType =
  | 'shot' | 'shot_on_target' | 'pass' | 'pass_success' | 'key_pass'
  | 'interception' | 'save' | 'foul'

export const LIVE_EVENT_TYPES: LiveEventType[] = [
  'shot','shot_on_target','pass','pass_success','key_pass','interception','save','foul'
]

export async function addLiveEvent(args: {
  matchId: string
  playerId: string
  team: 'team1'|'team2'
  type: LiveEventType
  minuteSec: number
  videoRef: number
}) {
  const { matchId, playerId, team, type, minuteSec, videoRef } = args
  const uid = auth.currentUser?.uid ?? 'dev-unknown'
  const eventsCol = collection(db, 'matches', matchId, 'events')
  const ref = await addDoc(eventsCol, {
    matchId,
    playerId,
    team,
    type,
    minuteSec,
    videoRef,
    createdBy: uid,
    ts: serverTimestamp()
  })
  return ref.id
}

/** Remove the most recent event for (matchId, playerId, type). */
export async function removeLastLiveEvent(args: {
  matchId: string
  playerId: string
  type: LiveEventType
}) {
  const { matchId, playerId, type } = args
  const eventsCol = collection(db, 'matches', matchId, 'events')
  // Latest by server timestamp; emulator may need composite index if you add more filters
  const q = query(
    eventsCol,
    where('matchId', '==', matchId),
    where('playerId', '==', playerId),
    where('type', '==', type),
    orderBy('ts', 'desc'),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docRef = snap.docs[0].ref
  await deleteDoc(docRef)
  return docRef.id
}

/** Listen to events of a match and aggregate counts per player/type. */
export function listenLiveCounts(matchId: string, cb: (counts: Record<string, Record<string, number>>) => void) {
  const eventsCol = collection(db, 'matches', matchId, 'events')
  // We only need the 8 live types. 'in' supports up to 10 values.
  const q = query(eventsCol, where('type', 'in', [
    'shot','shot_on_target','pass','pass_success','key_pass','interception','save','foul'
  ]))
  return onSnapshot(q, (snap) => {
    const counts: Record<string, Record<string, number>> = {}
    for (const d of snap.docs) {
      const e = d.data() as any
      const pid = e.playerId as string | undefined
      const type = e.type as string
      if (!pid) continue
      counts[pid] ||= {}
      counts[pid][type] = (counts[pid][type] ?? 0) + 1
    }
    cb(counts)
  })
}