import { create } from 'zustand'

type SessionState = {
  initialized: boolean
  initialize: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  initialized: false,
  initialize: () => set({ initialized: true })
}))
