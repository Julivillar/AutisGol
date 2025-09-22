import { Dashboard } from '../routes/Dashboard'
import { DevAuth } from '../../components/common/DevAuth'

export function Shell() {
  return (
    <div className="min-h-screen grid grid-rows-[var(--header-h)_1fr]">
      <header className="h-[var(--header-h)] border-b bg-white flex items-center px-4 justify-between">
        <h1 className="font-semibold text-lg">⚽ Football Stats App</h1>
        <DevAuth />
      </header>
      <main className="p-4">
        <Dashboard />
      </main>
    </div>
  )
}