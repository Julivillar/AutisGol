import { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function RequireAuth({ children, message }: { children: ReactNode, message?: string }) {
  const { isAuthed, loading } = useAuth()

  if (loading) return <div className="text-sm text-gray-500">Comprobando sesión…</div>
  if (!isAuthed) {
    return (
      <div className="rounded-2xl border bg-white p-4 text-sm">
        {message || 'Debes iniciar sesión para continuar.'}
        <div className="text-gray-500 mt-1">Usa el botón de login en la barra superior.</div>
      </div>
    )
  }
  return <>{children}</>
}