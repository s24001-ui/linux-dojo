import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import LessonTable from '@/components/LessonTable'
import PracticeSection from '@/components/PracticeSection'
import HistorySection, { type History } from '@/components/HistorySection'

type Detail = {
  user: { id: number; name: string; email: string; created_at: string } | null
  lessons: {
    code: string
    title: string
    category: string
    completed_at: string | null
    best_quiz: number | null
    quiz_total: number | null
    quiz_attempts: number
  }[]
  weak: { command_tag: string; total: number; wrong: number }[]
  practice: {
    id: number
    question_type: 'repair' | 'scenario'
    title: string | null
    command_tag: string
    cleared: boolean
    attempts: number
  }[]
}

const date = (s: string) => new Date(s).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })

export default function StudentDetailPage({ params }: PageProps<'/admin/students/[id]'>) {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <Detail params={params} />
    </Suspense>
  )
}

async function Detail({ params }: { params: PageProps<'/admin/students/[id]'>['params'] }) {
  await connection()
  const { id } = await params
  const userId = Number(id)
  if (!Number.isInteger(userId)) notFound()

  const sb = await createClient()
  const [detailRes, historyRes] = await Promise.all([
    sb.rpc('admin_student_detail', { p_user_id: userId }),
    sb.rpc('admin_student_history', { p_user_id: userId }),
  ])
  const err = detailRes.error ?? historyRes.error
  if (err) return <p className="text-red-600">取得に失敗しました: {err.message}</p>

  const d = detailRes.data as Detail
  const history = historyRes.data as History
  if (!d.user) notFound()

  const cleared = d.lessons.filter((l) => l.completed_at).length
  const pct = d.lessons.length ? Math.round((cleared / d.lessons.length) * 100) : 0

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-[#3d5a80] underline">
        ← 生徒一覧へ
      </Link>

      <section className="card">
        <h1 className="text-2xl font-bold">{d.user.name}</h1>
        <p className="text-sm text-gray-600">{d.user.email}</p>
        <div className="mt-4 max-w-md">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>クリア済みレッスン</span>
            <span className="text-[#3d5a80]">
              {cleared} / {d.lessons.length}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]">
            <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">レッスン別の進捗</h2>
        <LessonTable
          lessons={d.lessons.map((l) => ({
            ...l,
            completed_label: l.completed_at ? date(l.completed_at) : null,
          }))}
        />
      </section>

      <section className="card">
        <h2 className="mb-1 font-bold">つまずいているコマンド（確認テスト）</h2>
        <p className="mb-3 text-xs text-gray-600">
          問題ごとに最新の回答だけを見て、不正解のままの問題があるコマンドを表示します。
        </p>
        {d.weak.length === 0 ? (
          <p className="text-sm text-gray-600">つまずいている問題はありません。</p>
        ) : (
          <ul className="space-y-3">
            {d.weak.map((w) => (
              <li key={w.command_tag}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{w.command_tag}</span>
                  <span>
                    <span className="font-bold text-[#3d5a80]">{w.wrong}</span>
                    <span className="text-gray-600"> / {w.total} 問</span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#d4d4d4]">
                  <div
                    className="h-full rounded-full bg-[#3d5a80]"
                    style={{ width: `${Math.round((w.wrong / w.total) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">実践問題の進捗</h2>
        <PracticeSection items={d.practice ?? []} />
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">テスト結果</h2>
        <HistorySection history={history} />
      </section>
    </div>
  )
}