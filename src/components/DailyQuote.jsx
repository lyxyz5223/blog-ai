import { useEffect, useState } from 'react'

export default function DailyQuote() {
  const [quote, setQuote] = useState('(｡･ω･｡)ﾉ♡ 获取中...')
  const [from, setFrom] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadQuote = async () => {
      try {
        const res = await fetch('https://v1.hitokoto.cn')
        const data = await res.json()
        if (!cancelled) {
          setQuote(data.hitokoto || '今天也要加油')
          setFrom(data.from_who || data.from || '')
        }
      } catch (err) {
        if (!cancelled) {
          setQuote('获取失败，稍后重试')
          setFrom('')
        }
        console.error(err)
      }
    }

    loadQuote()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="daily-quote" aria-label="每日一言">
      <p className="daily-quote-label">一言：</p>
      <p className="daily-quote-text">{quote}</p>
      {from ? <p className="daily-quote-from">- {from}</p> : null}
    </section>
  )
}
