'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { lessons, quizPool } from '@/lib/data'

export default function ResultView({ id }: { id: string }) {
  const lesson = lessons.find((l) => l.id === id)!
  const sp = useSearchParams()
  const r = sp.get('r') ?? ''
  const order = (sp.get('o') ?? '').split('').map(Number).filter((n) => !Number.isNaN(n))
  const items = order.map((i, n) => ({ n: n + 1, q: quizPool[i], ok: r[i] === '1' })).filter((x) => x.q)
  const score = items.filter((x) => x.ok).length
  const wrong = items.filter((x) => !x.ok)
  const nextLesson = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title}　確認テスト結果</h1>
      <p className="card py-6 text-center text-4xl font-bold">{score} / {items.length} 問正解</p>

      {/* ④ 全問の○✕と、不正解だった問題の問題文・正解 */}
      <div className="flex flex-wrap gap-2" aria-label="全問の結果">
        {items.map((x) => (
          <span key={x.n} className={`flex h-9 w-9 items-center justify-center rounded-full border font-bold ${x.ok ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'}`} title={`問題${x.n}`}>{x.ok ? '○' : '✕'}</span>
        ))}
      </div>
      {wrong.length > 0 && (
        <ul className="space-y-2">
          {wrong.map((x) => (
            <li key={x.n} className="card border-red-300 bg-red-50">
              <p className="font-bold">問題 {x.n}：{x.q.q}</p>
              <p className="mt-1 text-sm">正解：{x.q.choices[x.q.answer]}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/lessons/${lesson.id}/quiz`} className="btn btn-sub">もう一度受ける</Link>
        <Link href={`/tests/${lesson.id}`} className="btn">実技テストへ進む</Link>
        {nextLesson && <Link href={`/lessons/${nextLesson.id}`} className="btn">次のレッスンへ</Link>}
      </div>
      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
