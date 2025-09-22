import { describe, it, expect } from 'vitest'
import { parseMinuteStrToSec, formatSecToMinuteStr } from '../../../src/utils/time'

describe('time utils', () => {
  it('parses mm:ss correctly', () => {
    expect(parseMinuteStrToSec('00:00')).toBe(0)
    expect(parseMinuteStrToSec('09:05')).toBe(545)
    expect(parseMinuteStrToSec('5:07')).toBe(307)
  })

  it('formats seconds to mm:ss', () => {
    expect(formatSecToMinuteStr(0)).toBe('00:00')
    expect(formatSecToMinuteStr(545)).toBe('09:05')
  })

  it('throws on invalid', () => {
    expect(() => parseMinuteStrToSec('9:5')).toThrow()
    expect(() => formatSecToMinuteStr(-1)).toThrow()
  })
})
