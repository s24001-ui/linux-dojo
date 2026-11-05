import Link from 'next/link'
import { lessons, progress } from '@/lib/data'

// S-02 トップページ
export default function TopPage() {
  const clearedCount = lessons.filter((l) => progress[l.id]?.cleared).length
  const scores = lessons.map((l) => progress[l.id]?.best).filter((b): b is number => b != null)
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null

  return (
    <div className="space-y-8">
      {/* ② 学習状況サマリー */}
      <section className="grid gap-4 sm:grid-cols-2" aria-label="学習状況">
        <div className="card text-center">
          <p className="text-sm text-gray-600">クリア済みレッスン</p>
          <p className="mt-1 text-3xl font-bold">{clearedCount} / {lessons.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">確認テストの平均点</p>
          <p className="mt-1 text-3xl font-bold">{avg === null ? '－' : `${avg}/10`}</p>
        </div>
      </section>

      {/* ③ レッスン一覧 */}
      <section>
        <h2 className="mb-3 text-xl font-bold">レッスン一覧</h2>
        <ul className="space-y-2">
          {lessons.map((l, i) => {
            const p = progress[l.id]
            return (
              <li key={l.id}>
                <Link href={`/lessons/${l.id}`} className="card flex items-center justify-between gap-3 hover:bg-[#f3f6fa]">
                  <span className="font-bold">{i + 1}. {l.title}</span>
                  <span className="flex shrink-0 items-center gap-3 text-sm">
                    <span className={`badge ${p?.cleared ? 'badge-ok' : 'badge-ng'}`}>{p?.cleared ? 'クリア済み' : '未クリア'}</span>
                    <span className="w-12 text-right font-mono">{p?.best != null ? `${p.best}/10` : '－'}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ④ ⑦ 各機能への入口 */}
      <section className="flex flex-wrap gap-3">
        <Link href="/repair" className="btn">エラー修復ミッション</Link>
        <Link href="/scenarios" className="btn">シナリオ</Link>
      </section>
    </div>
  )
}
