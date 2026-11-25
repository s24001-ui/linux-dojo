import { Suspense } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { getLessonOverview, getMe, getRepairs, getScenarios } from '@/lib/db'
import { QUIZ_SIZE } from '@/lib/quiz'

// S-13 マイページ（レベル・XP・バッジは【Want】のため未実装）
export default function MyPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <My />
    </Suspense>
  )
}

async function My() {
  const [me, overview, repairs, scenarios] = await Promise.all([getMe(), getLessonOverview(), getRepairs(), getScenarios()])
  const { lessons, cleared, best } = overview
  const scores = Object.values(best)
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null
  const clearedCount = lessons.filter((lesson) => cleared.has(lesson.code)).length
  const lessonProgress = lessons.length ? Math.round((clearedCount / lessons.length) * 100) : 0
  const scoreProgress = avg === null ? 0 : Math.round((avg / QUIZ_SIZE) * 100)
  const nextLesson = lessons.find((lesson) => !cleared.has(lesson.code))
  const clearedRepairs = repairs.filter((repair) => repair.cleared).length
  const clearedScenarios = scenarios.filter((scenario) => scenario.cleared).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      <div className="mx-auto max-w-xl space-y-6">
        <section className="card">
          <h2 className="mb-3 font-bold">プロフィール</h2>
          <p className="text-sm text-gray-600">表示名</p>
          <p className="font-bold">{me?.name ?? '－'}</p>
          <p className="mt-3 text-sm text-gray-600">メールアドレス</p>
          <p className="font-bold">{me?.email ?? '－'}</p>
        </section>
        <section className="card">
          <h2 className="mb-2 font-bold">学習の記録</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span>クリア済みレッスン</span>
                <span className="text-[#3d5a80]">{clearedCount} / {lessons.length}</span>
              </div>
              <div
                className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]"
                role="progressbar"
                aria-label="レッスンのクリア進捗"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={lessonProgress}
              >
                <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${lessonProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span>確認テストの平均点</span>
                <span className="text-[#3d5a80]">{avg === null ? '－' : `${avg} / ${QUIZ_SIZE}`}</span>
              </div>
              <div
                className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]"
                role="progressbar"
                aria-label="確認テストの平均点"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={scoreProgress}
              >
                <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${scoreProgress}%` }} />
              </div>
            </div>
          </div>
        </section>
        <section className="card">
          <h2 className="mb-3 font-bold">実践の記録</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'エラー修復', cleared: clearedRepairs, total: repairs.length, href: '/repair' },
              { label: 'シナリオ', cleared: clearedScenarios, total: scenarios.length, href: '/scenarios' },
            ].map((item) => {
              const progress = item.total ? Math.round((item.cleared / item.total) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>{item.label}</span>
                    <span className="text-[#3d5a80]">{item.cleared} / {item.total}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]">
                    <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${progress}%` }} />
                  </div>
                  <Link href={item.href} className="btn btn-sub mt-3 !px-3 !py-1.5 text-sm">
                    一覧を見る
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
        {nextLesson ? (
          <section aria-label="次に学ぶレッスン">
            <Link href={`/lessons/${nextLesson.code}`} className="card block border-2 border-[#3d5a80] bg-[#f3f6fa] hover:bg-[#eef2f7]">
              <p className="text-sm font-bold text-[#3d5a80]">次に学ぶ</p>
              <p className="mt-1 font-bold">{nextLesson.title}</p>
              <span className="btn mt-3">レッスンを始める</span>
            </Link>
          </section>
        ) : (
          <section className="card border-2 border-green-600 bg-green-50" aria-label="全レッスンクリア">
            <p className="font-bold text-green-700">全レッスンクリア！</p>
            <p className="mt-1 text-sm text-gray-700">次は実践問題をやってみましょう。</p>
          </section>
        )}
        <LogoutButton />
      </div>
    </div>
  )
}