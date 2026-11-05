import Link from 'next/link'
import { scenarios } from '@/lib/data'

// S-14 シナリオ一覧画面
export default function ScenarioListPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">シナリオ</h1>
      <ul className="space-y-2">
        {scenarios.map((s) => (
          <li key={s.id}>
            <Link href={`/scenarios/${s.id}`} className="card block hover:bg-[#f3f6fa]">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{s.title}</span>
                <span className={`badge shrink-0 ${s.cleared ? 'badge-ok' : 'badge-ng'}`}>{s.cleared ? 'クリア済み' : '未クリア'}</span>
              </div>
              <p className="mt-1 text-sm">{s.summary}</p>
              <p className="mt-1 text-sm text-gray-600">使うコマンド：{s.commands}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
