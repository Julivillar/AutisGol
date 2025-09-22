import { useEffect } from 'react'
import { useSessionStore } from './state/session'
import { AppRouter } from './app/AppRouter'

export default function App() {
  const initialize = useSessionStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <AppRouter />
}
