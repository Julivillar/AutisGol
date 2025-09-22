import { db, auth } from './client'
import {
  addDoc, collection, doc, serverTimestamp, writeBatch,
  getDocs, getDoc, setDoc, deleteDoc, query, orderBy, limit
} from 'firebase/firestore'
import type { GoalRowParsed } from '../../converters/match'
import type { MatchInput } from '../../types/domain'

export async function createMatchWithGoals(input: MatchInput, goals: GoalRowParsed[]) {
  const matchesCol = collection(db, 'matches')
  const matchRef = await addDoc(matchesCol, {
    ...input,
    createdAt: serverTimestamp()
  })

  if (goals.length > 0) {
    const batch = writeBatch(db)
    const eventsCol = collection(matchRef, 'events')
    const uid = auth.currentUser?.uid ?? 'dev-unknown'

    for (const g of goals) {
      const evRef = doc(eventsCol)
      const base = {
        matchId: matchRef.id,
        minuteSec: g.minuteSec,
        team: g.team,
        videoRef: input.videoRef,
        createdBy: uid,
        ts: serverTimestamp()
      }
      if (g.ownGoal) {
        batch.set(evRef, { ...base, type: 'own_goal', playerId: g.scorerId ?? null, assistBy: g.assistId ?? null, keeperId: g.keeperId ?? null })
      } else {
        batch.set(evRef, { ...base, type: 'goal', playerId: g.scorerId ?? null, assistBy: g.assistId ?? null, keeperId: g.keeperId ?? null })
      }
    }
    await batch.commit()
  }

  return matchRef.id
}

export async function listRecentMatches(max = 20) {
  const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
}

export async function loadMatchWithGoals(matchId: string) {
  const matchRef = doc(db, 'matches', matchId)
  const matchDoc = await getDoc(matchRef)
  if (!matchDoc.exists()) throw new Error('Match no encontrado')

  const eventsSnap = await getDocs(collection(matchRef, 'events'))
  const events = eventsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
  return { id: matchDoc.id, ...(matchDoc.data() as any), events }
}

export async function updateMatchWithGoals(matchId: string, input: MatchInput, goals: GoalRowParsed[]) {
  const matchRef = doc(db, 'matches', matchId)
  await setDoc(matchRef, { ...input }, { merge: true })

  // delete existing events
  const existingSnap = await getDocs(collection(matchRef, 'events'))
  if (existingSnap.size > 0) {
    const delBatch = writeBatch(db)
    for (const d of existingSnap.docs) {
      delBatch.delete(d.ref)
    }
    await delBatch.commit()
  }

  // add new events
  if (goals.length > 0) {
    const addBatch = writeBatch(db)
    const eventsCol = collection(matchRef, 'events')
    const uid = auth.currentUser?.uid ?? 'dev-unknown'
    for (const g of goals) {
      const evRef = doc(eventsCol)
      const base = {
        matchId,
        minuteSec: g.minuteSec,
        team: g.team,
        videoRef: input.videoRef,
        createdBy: uid,
        ts: serverTimestamp()
      }
      if (g.ownGoal) {
        addBatch.set(evRef, { ...base, type: 'own_goal', playerId: g.scorerId ?? null, assistBy: g.assistId ?? null, keeperId: g.keeperId ?? null })
      } else {
        addBatch.set(evRef, { ...base, type: 'goal', playerId: g.scorerId ?? null, assistBy: g.assistId ?? null, keeperId: g.keeperId ?? null })
      }
    }
    await addBatch.commit()
  }

  return matchId
}
