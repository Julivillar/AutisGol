import { useEffect } from 'react'
import { useSessionStore } from './state/session'
import { Shell } from './app/layout/Shell'

export default function App() {
  const initialize = useSessionStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <Shell />
}
