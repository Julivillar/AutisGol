/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, collection, getDocs, addDoc } from 'firebase/firestore'
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { addLiveEvent, removeLastLiveEvent } from '../../src/services/firebase/events'

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'autisgol'
const apiKey = process.env.VITE_FIREBASE_API_KEY || 'fake-key'
const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`

beforeAll(async () => {
  const app = getApps()[0] ?? initializeApp({ apiKey, authDomain, projectId })
  const db = getFirestore(app)
  const auth = getAuth(app)
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  try {
    await createUserWithEmailAndPassword(auth, 'admin@test.com', 'Password123!')
  } catch {}
  await signInWithEmailAndPassword(auth, 'admin@test.com', 'Password123!')
})

describe('live counters', () => {
  it('adds and removes events', async () => {
    // Create a temp match
    const app = getApps()[0]!
    const db = getFirestore(app)
    const matchRef = await addDoc(collection(db, 'matches'), {
      dayId: 'day-1',
      indexInDay: 1,
      videoRef: 1,
      team1: ['p1'],
      team2: ['p2'],
      result: { t1: 0, t2: 0 },
      name: 'P1 vs P2'
    })

    const matchId = matchRef.id

    const id1 = await addLiveEvent({
      matchId, playerId: 'p1', team: 'team1', type: 'shot', minuteSec: 30, videoRef: 1
    })
    expect(typeof id1).toBe('string')

    const removed = await removeLastLiveEvent({ matchId, playerId: 'p1', type: 'shot' })
    expect(removed).not.toBeNull()

    // events should be zero now
    const snap = await getDocs(collection(db, 'matches', matchId, 'events'))
    expect(snap.size).toBe(0)
  })
})