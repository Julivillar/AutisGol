import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { DashboardHome } from './routes/DashboardHome'
import { StatsPage } from './routes/StatsPage'
import { MatchesPage } from './routes/MatchesPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/estadisticas" element={<StatsPage />} />
          <Route path="/partidos" element={<MatchesPage />} />
          <Route path="*" element={<DashboardHome />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}