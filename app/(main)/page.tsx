import Link from 'next/link'
import { Suspense } from 'react'
import { getLessonOverview } from '@/lib/db'
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
  const { lessons, cleared, best } = await getLessonOverview()
  const scores = Object.values(best)
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null
  const clearedCount = lessons.filter((l) => cleared.has(l.code)).length
  const lessonProgress = lessons.length ? Math.round((clearedCount / lessons.length) * 100) : 0
  const scoreProgress = avg === null ? 0 : Math.round((avg / QUIZ_SIZE) * 100)
  const nextLesson = lessons.find((l) => !cleared.has(l.code))

  // 並び順（sort_order）のまま、同じカテゴリが続くレッスンをひとまとめにする。番号は全体の通し番号
  const groups: { category: string; items: { l: (typeof lessons)[number]; no: number }[] }[] = []
  lessons.forEach((l, i) => {
    const last = groups[groups.length - 1]
    if (last && last.category === l.category) last.items.push({ l, no: i + 1 })
    else groups.push({ category: l.category, items: [{ l, no: i + 1 }] })
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">レッスン一覧</h1>
        <p className="mt-1 text-sm text-gray-600">コマンドを学習して、確認テストに挑戦しましょう</p>
      </div>

      {nextLesson && (
        <section aria-label="次に学ぶレッスン">
          <Link
            href={`/lessons/${nextLesson.code}`}
            className="card flex flex-col gap-4 border-2 border-[#3d5a80] bg-[#f3f6fa] transition-transform hover:bg-[#eef2f7] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-bold text-[#3d5a80]">次に学ぶ</p>
              <p className="mt-1 text-lg font-bold">{nextLesson.title}</p>
              <p className="mt-1 text-sm text-gray-600">{nextLesson.category}</p>
            </div>
            <span className="btn shrink-0">レッスンを始める</span>
          </Link>
        </section>
      )}

      {!nextLesson && lessons.length > 0 && (
        <section aria-label="全レッスンクリア">
          <div className="card border-2 border-green-600 bg-green-50">
            <div>
              <p className="text-lg font-bold text-green-700">全レッスンクリア！</p>
              <p className="mt-1 text-sm text-gray-700">次は実践問題をやってみよう</p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="学習状況">
        <div className="card text-center">
          <p className="text-sm text-gray-600">クリア済みレッスン</p>
          <p className="mt-1 text-3xl font-bold">{clearedCount} / {lessons.length}</p>
          <div className="mt-3 flex items-center justify-between text-sm font-bold text-[#3d5a80]">
            <span>達成率</span>
            <span>{lessonProgress}%</span>
          </div>
          <div
            className="mt-1 h-3 overflow-hidden rounded-full bg-[#d4d4d4]"
            role="progressbar"
            aria-label="レッスンのクリア進捗"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={lessonProgress}
            aria-valuetext={`${clearedCount} / ${lessons.length}`}
          >
            <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${lessonProgress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {lessonProgress === 100 ? '全レッスンクリア！' : `あと ${lessons.length - clearedCount} レッスン`}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">確認テストの平均点</p>
          <p className="mt-1 text-3xl font-bold">{avg === null ? '－' : `${avg} / ${QUIZ_SIZE}`}</p>
          <div className="mt-3 flex items-center justify-between text-sm font-bold text-[#3d5a80]">
            <span>得点率</span>
            <span>{avg === null ? '－' : `${scoreProgress}%`}</span>
          </div>
          <div
            className="mt-1 h-3 overflow-hidden rounded-full bg-[#d4d4d4]"
            role="progressbar"
            aria-label="確認テストの平均点"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={scoreProgress}
            aria-valuetext={avg === null ? '未受験' : `${avg} / ${QUIZ_SIZE}`}
          >
            <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${scoreProgress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {scores.length === 0 ? 'まずは確認テストに挑戦しましょう' : `受験済み：${scores.length}件`}
          </p>
        </div>
      </section>

      <section>
        {groups.map((g) => (
          <div key={g.category} className="mb-5">
            <h3 className="mb-2 text-lg font-bold text-[#3d5a80]">{g.category}</h3>
            <ul className="space-y-2">
              {g.items.map(({ l, no }) => {
                const isCleared = cleared.has(l.code)
                return (
                  <li key={l.id}>
                    <div className="card flex min-h-16 items-center justify-between gap-3 transition-transform hover:bg-[#f3f6fa]">
                      <Link
                        href={`/lessons/${l.code}`}
                        className="font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80]"
                      >
                        {no}. {l.title}
                      </Link>
                      <span className="flex shrink-0 items-center gap-3 text-sm">
                        <span className={`badge ${isCleared ? 'badge-ok' : 'badge-ng'}`}>
                          <span aria-hidden="true">{isCleared ? '✓' : '□'}</span>{' '}
                          {isCleared ? 'クリア済み' : '未クリア'}
                        </span>
                        {isCleared && (
                          <Link
                            href={`/lessons/${l.code}/quiz`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#3d5a80] bg-[#eef2f7] px-2.5 py-1 text-xs font-bold text-[#3d5a80] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80]"
                          >
                            <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3.5" y="2.5" width="9" height="11" rx="1" />
                              <path d="M6 2.5h4M6 6.5h4M6 9h1M8.5 9H10M6 11.5h1M8.5 11.5H10" />
                            </svg>
                            確認テストへ進む
                          </Link>
                        )}
                        <span className="w-14 text-right font-mono">{best[l.code] != null ? `${best[l.code]}/${QUIZ_SIZE}` : '－'}</span>
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>

    </div>
  )
}