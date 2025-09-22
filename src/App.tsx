import { useEffect } from 'react'
import { useSessionStore } from './state/session'
import { AppShell } from './app/layout/AppShell'

export default function App() {
  const initialize = useSessionStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <AppShell children={undefined} />
}
