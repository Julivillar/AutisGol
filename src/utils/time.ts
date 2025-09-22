export function parseMinuteStrToSec(input: string): number {
  // Permite 0–999 minutos: m:ss o mm:ss o mmm:ss
  const m = input.trim().match(/^(\d{1,3}):([0-5]\d)$/)
  if (!m) throw new Error('Formato inválido, use mm:ss')
  const [_, mm, ss] = m
  return parseInt(mm, 10) * 60 + parseInt(ss, 10)
}

/** Format integer seconds to mm:ss */
export function formatSecToMinuteStr(sec: number): string {
  if (!Number.isInteger(sec) || sec < 0) throw new Error('Segundos inválidos')
  const mm = Math.floor(sec / 60)
  const ss = sec % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}
