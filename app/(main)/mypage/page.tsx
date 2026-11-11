import { Suspense } from 'react'
import LogoutButton from '@/components/LogoutButton'
import { getLessons, getMe, getProgress } from '@/lib/db'
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
  const [me, lessons, { cleared, best }] = await Promise.all([getMe(), getLessons(), getProgress()])
  const scores = Object.values(best)
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      <section className="card">
        <p className="text-sm text-gray-600">表示名</p>
        <p className="font-bold">{me?.name ?? '－'}</p>
        <p className="mt-3 text-sm text-gray-600">メールアドレス</p>
        <p className="font-bold">{me?.email ?? '－'}</p>
      </section>
      <section className="card">
        <h2 className="mb-2 font-bold">学習の記録</h2>
        <p>クリア済みレッスン：{lessons.filter((l) => cleared.has(l.code)).length} / {lessons.length}</p>
        <p>確認テストの平均点：{avg === null ? '－' : `${avg} / ${QUIZ_SIZE}`}</p>
      </section>
      <LogoutButton />
    </div>
  )
}