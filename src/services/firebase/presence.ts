import { auth, db } from './client'
import { doc, setDoc, serverTimestamp, deleteDoc, onSnapshot, collection, query } from 'firebase/firestore'

export type PresenceDoc = {
  uid: string
  email?: string
  displayName?: string
  lastSeen: any
  minuteSec?: number
}

export async function joinPresence(matchId: string, minuteSec: number) {
  const u = auth.currentUser
  if (!u) return
  const ref = doc(db, 'matches', matchId, 'presence', u.uid)
  await setDoc(ref, {
    uid: u.uid,
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    lastSeen: serverTimestamp(),
    minuteSec
  }, { merge: true })
}

export async function heartbeatPresence(matchId: string, minuteSec?: number) {
  const u = auth.currentUser
  if (!u) return
  const ref = doc(db, 'matches', matchId, 'presence', u.uid)
  await setDoc(ref, {
    lastSeen: serverTimestamp(),
    ...(typeof minuteSec === 'number' ? { minuteSec } : {})
  }, { merge: true })
}

export async function leavePresence(matchId: string) {
  const u = auth.currentUser
  if (!u) return
  const ref = doc(db, 'matches', matchId, 'presence', u.uid)
  await deleteDoc(ref).catch(() => {})
}

export function listenPresence(matchId: string, cb: (list: PresenceDoc[]) => void) {
  const q = query(collection(db, 'matches', matchId, 'presence'))
  return onSnapshot(q, (snap) => {
    const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    cb(arr as any)
  })
}