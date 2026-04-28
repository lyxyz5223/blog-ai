import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatDateTime } from './formatDate'

describe('formatDateTime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test Case 1: 处理 UTC ISO 字符串
  it('应该正确格式化 UTC ISO 字符串', () => {
    const result = formatDateTime('2026-04-03T04:26:00.000Z')
    expect(result).toBeTruthy()
    expect(result).not.toContain('无效日期')
  })

  // Test Case 2: 处理 Date 对象
  it('应该正确格式化 Date 对象', () => {
    const date = new Date('2026-04-03T04:26:00.000Z')
    const result = formatDateTime(date)
    expect(result).toBeTruthy()
    expect(result).not.toContain('无效日期')
  })

  // Test Case 3: 处理本地时间字符串
  it('应该正确格式化本地时间字符串', () => {
    const result = formatDateTime('2026-04-03 04:26:00')
    expect(result).toBeTruthy()
    expect(result).not.toContain('无效日期')
  })

  // Test Case 4: 处理 null 值
  it('应该处理 null 值并返回"无日期"', () => {
    const result = formatDateTime(null)
    expect(result).toBe('无日期')
  })

  // Test Case 5: 处理 undefined 值
  it('应该处理 undefined 值并返回"无日期"', () => {
    const result = formatDateTime(undefined)
    expect(result).toBe('无日期')
  })

  // Test Case 6: 处理空字符串
  it('应该处理空字符串并返回"无日期"', () => {
    const result = formatDateTime('')
    expect(result).toBe('无日期')
  })

  // Test Case 7: 处理无效的日期字符串
  it('应该处理无效的日期字符串并返回"无效日期"', () => {
    const result = formatDateTime('invalid date string')
    expect(result).toBe('无效日期')
  })

  // Test Case 8: 处理无效的日期对象（NaN）
  it('应该处理无效的日期对象并返回"无效日期"', () => {
    const invalidDate = new Date('invalid')
    const result = formatDateTime(invalidDate)
    expect(result).toBe('无效日期')
  })

  // Test Case 9: 返回值应该是字符串
  it('应该始终返回字符串类型', () => {
    expect(typeof formatDateTime('2026-04-03T04:26:00.000Z')).toBe('string')
    expect(typeof formatDateTime(new Date())).toBe('string')
    expect(typeof formatDateTime(null)).toBe('string')
  })

  // Test Case 10: 返回值应该包含年月日时分秒
  it('返回的格式化日期应该包含日期和时间分量', () => {
    const result = formatDateTime('2026-04-03T04:26:00.000Z')
    // 中文日期格式应该包含数字
    expect(/\d+/.test(result)).toBe(true)
  })

  // Test Case 11: 处理不同类型的无效输入
  it('应该处理数字、对象等无效类型', () => {
    expect(formatDateTime(12345)).toBe('无效日期')
    expect(formatDateTime({})).toBe('无效日期')
    expect(formatDateTime([])).toBe('无效日期')
  })

  // Test Case 12: 应该不抛出错误
  it('应该优雅地处理所有输入而不抛出错误', () => {
    expect(() => formatDateTime('2026-04-03T04:26:00.000Z')).not.toThrow()
    expect(() => formatDateTime(null)).not.toThrow()
    expect(() => formatDateTime(undefined)).not.toThrow()
    expect(() => formatDateTime('invalid')).not.toThrow()
  })
})
