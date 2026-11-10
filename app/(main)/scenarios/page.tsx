import Link from 'next/link'
import { Suspense } from 'react'
import { getScenarios } from '@/lib/db'

// S-14 シナリオ一覧画面
export default function ScenarioListPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <ScenarioList />
    </Suspense>
  )
}

async function ScenarioList() {
  const scenarios = await getScenarios()
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
              <p className="mt-1 text-sm">{s.setup.summary}</p>
              <p className="mt-1 text-sm text-gray-600">使うコマンド：{s.setup.commands}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
