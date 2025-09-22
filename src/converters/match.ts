import { z } from 'zod'
import { parseMinuteStrToSec, formatSecToMinuteStr } from '../utils/time'
import type { GoalRow, MatchInput } from '../types/domain'

export const matchInputSchema = z.object({
  dayId: z.string().min(1, 'Día obligatorio'),
  indexInDay: z.number().int().min(0),
  videoRef: z.number().int().nonnegative(),
  team1: z.array(z.string()).max(8),
  team2: z.array(z.string()).max(8),
  result: z.object({
    t1: z.number().int().min(0),
    t2: z.number().int().min(0)
  }),
  name: z.string().min(3)
}).refine(v => v.team1.length > 0 && v.team2.length > 0, { message: 'Ambos equipos deben tener jugadores' })

export const goalRowSchema = z.object({
  minuteStr: z.string().regex(/^(\d{1,3}):([0-5]\d)$/, 'Formato inválido (usa m:ss o mm:ss, p.ej. 0:30, 12:05, 75:10)'),
  scorerId: z.string().optional(),
  assistId: z.string().optional(),
  keeperId: z.string().optional(),
  team: z.enum(['team1','team2']),
  ownGoal: z.boolean()
})

export type GoalRowParsed = {
  minuteSec: number
  scorerId?: string
  assistId?: string
  keeperId?: string
  team: 'team1' | 'team2'
  ownGoal: boolean
}

export function parseGoalRows(rows: GoalRow[]): GoalRowParsed[] {
  return rows.map((r, i) => {
    try {
      const g = goalRowSchema.parse(r)
      return {
        minuteSec: parseMinuteStrToSec(g.minuteStr),
        scorerId: g.scorerId,
        assistId: g.assistId,
        keeperId: g.keeperId,
        team: g.team,
        ownGoal: g.ownGoal
      }
    } catch (e: any) {
      const msg = e?.issues?.[0]?.message ?? e?.message ?? 'Fila inválida'
      throw new Error(`Goles · Fila ${i + 1}: ${msg}`)
    }
  })
}

export function unparseGoalRows(parsed: GoalRowParsed[]): GoalRow[] {
  return parsed.map(g => ({
    minuteStr: formatSecToMinuteStr(g.minuteSec),
    scorerId: g.scorerId,
    assistId: g.assistId,
    keeperId: g.keeperId,
    team: g.team,
    ownGoal: g.ownGoal
  }))
}

export function computeMatchName(team1Names: string[], team2Names: string[]): string {
  return `${team1Names.join(', ')} vs ${team2Names.join(', ')}`
}

export function buildMatchInput(args: Omit<MatchInput, 'name'> & { team1Names: string[], team2Names: string[] }): MatchInput {
  const name = `${args.dayId} - ${computeMatchName(args.team1Names, args.team2Names)}`
  const m: MatchInput = {
    dayId: args.dayId,
    indexInDay: args.indexInDay,
    videoRef: args.videoRef,
    team1: args.team1,
    team2: args.team2,
    result: args.result,
    name
  }
  return matchInputSchema.parse(m)
}
