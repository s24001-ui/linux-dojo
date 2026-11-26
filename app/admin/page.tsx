import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'

type Row = {
  user_id: number
  name: string
  email: string
  cleared_lessons: number
  total_lessons: number
  last_active: string | null
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">先生用ページ</h1>
        <p className="mt-1 text-sm text-gray-600">生徒の進捗（最終学習日が新しい順）</p>
      </div>
      <Suspense fallback={<p>読み込み中…</p>}>
        <Students />
      </Suspense>
    </div>
  )
}

async function Students() {
  await connection()
  const sb = await createClient()
  const { data, error } = await sb.rpc('admin_student_overview')
  if (error) return <p className="text-red-600">取得に失敗しました: {error.message}</p>

  // 最終学習日が新しい順。学習記録がない生徒は最後に、名前順で並べる
  const rows = ((data ?? []) as Row[]).sort((a, b) => {
    if (!a.last_active && !b.last_active) return a.name.localeCompare(b.name, 'ja')
    if (!a.last_active) return 1
    if (!b.last_active) return -1
    return new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
  })
  if (!rows.length) return <p>まだ生徒が登録されていません。</p>

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#444]">
            <th className="py-2 pr-4">名前</th>
            <th className="py-2 pr-4">レッスン進捗</th>
            <th className="py-2">最終学習日</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = r.total_lessons ? Math.round((r.cleared_lessons / r.total_lessons) * 100) : 0
            return (
              <tr key={r.user_id} className="border-b border-[#d4d4d4]">
                <td className="py-3 pr-4">
                  <Link href={`/admin/students/${r.user_id}`} className="font-bold text-[#3d5a80] underline">
                    {r.name}
                  </Link>
                  <p className="text-xs text-gray-600">{r.email}</p>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-32 overflow-hidden rounded-full bg-[#d4d4d4]">
                      <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-bold text-[#3d5a80]">
                      {r.cleared_lessons} / {r.total_lessons}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  {r.last_active
                    ? new Date(r.last_active).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
                    : '－'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}