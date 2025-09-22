import { create } from 'zustand'
import type { LiveEventType } from '../services/firebase/events'

type Action = {
  op: 'add' | 'remove'
  matchId: string
  playerId: string
  type: LiveEventType
  minuteSec: number
  videoRef: number
  team: 'team1'|'team2'
  eventId?: string | null
}

type PendingKey = `${string}:${string}` // `${playerId}:${type}`

type CountersState = {
  currentMinuteSec: number
  setCurrentMinuteSec: (s: number) => void

  pending: Record<PendingKey, number>
  addPending: (playerId: string, type: string, delta: number) => void
  clearPending: (playerId: string, type: string) => void
}

export const useCountersStore = create<CountersState>((set, get) => ({
  currentMinuteSec: 0,
  setCurrentMinuteSec: (s) => set({ currentMinuteSec: s }),

  pending: {},
  addPending: (playerId, type, delta) => {
    const k = `${playerId}:${type}` as PendingKey
    const p = get().pending
    set({ pending: { ...p, [k]: (p[k] ?? 0) + delta } })
  },
  clearPending: (playerId, type) => {
    const k = `${playerId}:${type}` as PendingKey
    const p = { ...get().pending }
    delete p[k]
    set({ pending: p })
  }
}))