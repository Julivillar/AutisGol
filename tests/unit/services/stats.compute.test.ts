import { describe, it, expect } from 'vitest'
import { computeDashboardStats } from '../../../src/services/stats'

describe('computeDashboardStats', () => {
  it('computes goals, assists, pass pct and rankings', () => {
    const players = [
      { id: 'p1', name: 'Pablo' },
      { id: 'p2', name: 'Jose' },
      { id: 'p3', name: 'Julian' }
    ]
    const matches = [
      { id: 'm1', dayId: 'd1', team1: ['p1','p2'], team2: ['p3'] },
      { id: 'm2', dayId: 'd2', team1: ['p1'], team2: ['p2','p3'] },
      { id: 'm3', dayId: 'd3', team1: ['p1','p3'], team2: [] },
      { id: 'm4', dayId: 'd4', team1: ['p2'], team2: ['p3'] }
    ]
    const events = [
      { type: 'goal', playerId: 'p1', assistBy: 'p2' },
      { type: 'goal', playerId: 'p1' },
      { type: 'goal', playerId: 'p3', assistBy: 'p1' },
      { type: 'pass', playerId: 'p1' },
      { type: 'pass', playerId: 'p1' },
      { type: 'pass_success', playerId: 'p1' },
      { type: 'key_pass', playerId: 'p2' },
      { type: 'key_pass', playerId: 'p2' },
      { type: 'interception', playerId: 'p3' }
    ]

    const out = computeDashboardStats({ events, matches, players })
    expect(out.kpi.goalsTotal).toBe(3)
    expect(out.kpi.assistsTotal).toBe(2)
    expect(out.kpi.passPctAvg).toBeCloseTo(0.5)

    // Top goals
    expect(out.topGoals[0].name).toBe('Pablo')
    expect(out.topGoals[0].goals).toBe(2)

    // Top assists
    expect(out.topAssists[0].name).toBe('Jose')
    expect(out.topAssists[0].assists).toBe(1) // Jose assisted once; Pablo also 1, order by name

    // Top key passes
    expect(out.topKeyPass[0].name).toBe('Jose')
    expect(out.topKeyPass[0].keyPasses).toBe(2)

    // Top interceptions
    expect(out.topInterceptions[0].name).toBe('Julian')
    expect(out.topInterceptions[0].interceptions).toBe(1)
  })
})