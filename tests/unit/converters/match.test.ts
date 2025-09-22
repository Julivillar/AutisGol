import { describe, it, expect } from 'vitest'
import { buildMatchInput, parseGoalRows } from '../../../src/converters/match'

describe('match converters', () => {
  it('builds a valid match input and name', () => {
    const input = buildMatchInput({
      dayId: 'day-1',
      indexInDay: 1,
      videoRef: 7,
      team1: ['a','b'],
      team2: ['c','d'],
      result: { t1: 3, t2: 2 },
      team1Names: ['Pablo','Jose'],
      team2Names: ['Julian','Jordi']
    })
    expect(input.name).toBe('Pablo, Jose vs Julian, Jordi')
  })

  it('parses goal rows', () => {
    const rows = parseGoalRows([
      { minuteStr: '09:05', team: 'team1', ownGoal: false, scorerId: 'a', assistId: 'b', keeperId: 'c' }
    ])
    expect(rows[0].minuteSec).toBe(545)
  })
})