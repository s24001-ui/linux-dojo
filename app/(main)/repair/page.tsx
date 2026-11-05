import Link from 'next/link'
import { missions } from '@/lib/data'

// S-06 エラー修復ミッション一覧画面
export default function RepairListPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">エラー修復ミッション</h1>
      <ul className="space-y-2">
        {missions.map((m) => (
          <li key={m.id}>
            <Link href={`/repair/${m.id}`} className="card flex items-center justify-between gap-3 hover:bg-[#f3f6fa]">
              <span><span className="font-bold">{m.title}</span><span className="ml-3 text-sm text-gray-600">対象コマンド：{m.command}</span></span>
              <span className={`badge shrink-0 ${m.cleared ? 'badge-ok' : 'badge-ng'}`}>{m.cleared ? 'クリア済み' : '未クリア'}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
