/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, collection, getDocs } from 'firebase/firestore'
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { buildMatchInput, parseGoalRows } from '../../src/converters/match'
import { createMatchWithGoals } from '../../src/services/firebase/firestore'

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

describe('matches.create (emu)', () => {
  it('creates match and nested goal events', async () => {
    const input = buildMatchInput({
      dayId: 'day-1',
      indexInDay: 1,
      videoRef: 10,
      team1: ['p1','p2'],
      team2: ['p3','p4'],
      result: { t1: 1, t2: 0 },
      team1Names: ['P1','P2'],
      team2Names: ['P3','P4']
    })
    const goals = parseGoalRows([
      { minuteStr: '00:30', team: 'team1', ownGoal: false, scorerId: 'p1' }
    ])
    const id = await createMatchWithGoals(input, goals)
    expect(typeof id).toBe('string')

    // list events
    const app = getApps()[0]!
    const db = getFirestore(app)
    const snap = await getDocs(collection(db, 'matches', id, 'events'))
    expect(snap.size).toBe(1)
  })
})