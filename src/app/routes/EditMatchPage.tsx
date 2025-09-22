import { useParams, useNavigate } from 'react-router-dom'
import { MatchEditor } from '../../components/matches/MatchEditor'
import { RequireAuth } from '../../components/auth/RequireAuth'

export function EditMatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Editar Partido</h2>
          <p className="text-gray-500 text-sm">Actualiza la info del partido y sus goles.</p>
        </div>
        <button className="px-2 py-1 border rounded" onClick={() => navigate('/partidos')}>Volver</button>
      </div>

      <RequireAuth message="Inicia sesión para editar partidos.">
        <div className="rounded-2xl bg-white p-4 shadow-sm border">
          <MatchEditor matchId={id} onClose={() => navigate('/partidos')} />
        </div>
      </RequireAuth>
    </section>
  )
}