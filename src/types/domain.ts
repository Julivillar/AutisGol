export type Player = {
  id: string
  name: string
  slug: string
}

export type MatchInput = {
  dayId: string
  indexInDay: number
  videoRef: number
  team1: string[] // playerIds
  team2: string[] // playerIds
  result: { t1: number; t2: number }
  name: string
}

export type GoalRow = {
  minuteStr: string // mm:ss
  scorerId?: string
  assistId?: string
  keeperId?: string
  team: 'team1' | 'team2'
  ownGoal: boolean
}