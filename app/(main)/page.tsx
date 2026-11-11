import Link from 'next/link'
import { Suspense } from 'react'
import { getLessons, getProgress } from '@/lib/db'
import { QUIZ_SIZE } from '@/lib/quiz'

// S-02 トップページ
export default function TopPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <Top />
    </Suspense>
  )
}

async function Top() {
  const [lessons, { cleared, best }] = await Promise.all([getLessons(), getProgress()])
  const scores = Object.values(best)
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2" aria-label="学習状況">
        <div className="card text-center">
          <p className="text-sm text-gray-600">クリア済みレッスン</p>
          <p className="mt-1 text-3xl font-bold">{lessons.filter((l) => cleared.has(l.code)).length} / {lessons.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">確認テストの平均点</p>
          <p className="mt-1 text-3xl font-bold">{avg === null ? '－' : `${avg} / ${QUIZ_SIZE}`}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">レッスン一覧</h2>
        <ul className="space-y-2">
          {lessons.map((l, i) => (
            <li key={l.id}>
              <Link href={`/lessons/${l.code}`} className="card flex items-center justify-between gap-3 hover:bg-[#f3f6fa]">
                <span className="font-bold">{i + 1}. {l.title}</span>
                <span className="flex shrink-0 items-center gap-3 text-sm">
                  <span className={`badge ${cleared.has(l.code) ? 'badge-ok' : 'badge-ng'}`}>{cleared.has(l.code) ? 'クリア済み' : '未クリア'}</span>
                  <span className="w-12 text-right font-mono">{best[l.code] != null ? `${best[l.code]}/${QUIZ_SIZE}` : '－'}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/repair" className="btn">エラー修復ミッション</Link>
        <Link href="/scenarios" className="btn">シナリオ</Link>
      </section>
    </div>
  )
}