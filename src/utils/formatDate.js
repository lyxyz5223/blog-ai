/**
 * 格式化日期时间
 * 处理 Date 对象、UTC 字符串（Z）、本地时间字符串等格式
 * @param {string|Date} dateTimeValue - 日期值
 * @returns {string} 格式化后的日期字符串（中文）
 */
export const formatDateTime = (dateTimeValue) => {
  if (!dateTimeValue) return '无日期'
  try {
    let date

    if (typeof dateTimeValue === 'string') {
      // 处理 UTC ISO 字符串: "2026-04-03T04:26:00.000Z"
      if (dateTimeValue.includes('Z')) {
        date = new Date(dateTimeValue)
      } else {
        // 处理本地时间字符串或其他格式
        date = new Date(dateTimeValue)
      }
    } else if (dateTimeValue instanceof Date) {
      date = dateTimeValue
    } else {
      return '无效日期'
    }

    if (isNaN(date.getTime())) return '无效日期'

    // 使用本地时区显示
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    console.error('日期格式化错误:', dateTimeValue, e)
    return '无效日期'
  }
}
