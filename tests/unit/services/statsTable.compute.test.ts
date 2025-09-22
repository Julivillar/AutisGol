import { describe, it, expect } from 'vitest'
import { computeStatsTable } from '../../../src/services/statsTable'

describe('computeStatsTable', () => {
  it('computes key metrics and formats', () => {
    const players = [
      { id: 'p1', name: 'Pablo' },
      { id: 'p2', name: 'Jose' },
      { id: 'p3', name: 'Julian' }
    ]
    const matches = [
      { id: 'm1', dayId: 'd1', team1: ['p1','p2'], team2: ['p3'], result: { t1: 2, t2: 1 } },
      { id: 'm2', dayId: 'd1', team1: ['p1'], team2: ['p2','p3'], result: { t1: 0, t2: 1 } },
      { id: 'm3', dayId: 'd2', team1: ['p1','p3'], team2: [], result: { t1: 3, t2: 0 } }
    ]
    const events = [
      { type: 'goal', playerId: 'p1', assistBy: 'p2' },
      { type: 'goal', playerId: 'p1' },
      { type: 'goal', playerId: 'p3', assistBy: 'p1', keeperId: 'p2' },
      { type: 'shot', playerId: 'p1' },
      { type: 'shot', playerId: 'p1' },
      { type: 'shot_on_target', playerId: 'p1' },
      { type: 'pass', playerId: 'p1' },
      { type: 'pass_success', playerId: 'p1' },
      { type: 'key_pass', playerId: 'p2' },
      { type: 'interception', playerId: 'p3' },
      { type: 'save', playerId: 'p2' },
      { type: 'own_goal', playerId: 'p2' }
    ]

    const rows = computeStatsTable({ players, matches, events })
    const r1 = rows.find(r => r.playerId === 'p1')!
    expect(r1.days).toBe(2)     // d1, d2
    expect(r1.matches).toBe(3)  // in all 3 matches
    expect(r1.goals).toBe(2)
    expect(r1.assists).toBe(1)  // assisted p3 once
    expect(r1.ga).toBe(3)
    expect(r1.shots).toBe(2)
    expect(r1.shotsOnTarget).toBe(1)
    expect(r1.pctOnTarget).toBeCloseTo(0.5)
    expect(r1.pctGoalOnTarget).toBeCloseTo(2/1)

    const r2 = rows.find(r => r.playerId === 'p2')!
    expect(r2.ownGoals).toBe(1)
    expect(r2.saves).toBe(1)
    expect(r2.goalsConceded).toBe(1) // keeperId en un gol
  })
})