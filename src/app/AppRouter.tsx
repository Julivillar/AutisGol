import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { DashboardHome } from './routes/DashboardHome'
import { StatsPage } from './routes/StatsPage'
import { MatchesPage } from './routes/MatchesPage'
import { EditMatchPage } from './routes/EditMatchPage'
import { ViewMatchPage } from './routes/ViewMatchPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/estadisticas" element={<StatsPage />} />
          <Route path="/partidos" element={<MatchesPage />} />
          <Route path="/partidos/:id" element={<ViewMatchPage />} />
          <Route path="/partidos/:id/editar" element={<EditMatchPage />} />
          <Route path="*" element={<DashboardHome />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}