'use client'

import Link from 'next/link'
import { useState } from 'react'
import { missions } from '@/lib/data'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'
import { shortPath } from '@/lib/terminal'

export default function RepairView({ id }: { id: string }) {
  const mission = missions.find((m) => m.id === id)!
  // エラーが表示された状態から始める
  const preload = (cwd: string) => [{ kind: 'in' as const, text: `${shortPath(cwd)}$ ${mission.error.cmd}` }, { kind: 'err' as const, text: mission.error.msg }]
  const cwd0 = mission.cwd ?? '/home/user'
  const term = useTerminal(mission.fs, cwd0, preload(cwd0))
  const [hints, setHints] = useState(0)
  const done = mission.done(term.fs, term.cwd)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{mission.title}</h1>
      <p className="card">{mission.status}</p> {/* ③ 状況説明 */}

      {/* ④ ヒントボタン ⑤ ヒント表示欄：段階的に表示（読み方→原因→コマンド例） */}
      <div>
        <button className="btn btn-sub !py-1.5 text-sm" onClick={() => setHints(hints + 1)} disabled={hints >= mission.hints.length}>
          {hints === 0 ? 'ヒントを見る' : hints < mission.hints.length ? '次のヒントを見る' : 'ヒントは以上です'}
        </button>
        {hints > 0 && (
          <ol className="mt-2 space-y-1 rounded border-2 border-dashed border-amber-500 bg-amber-50 p-2 text-sm">
            {mission.hints.slice(0, hints).map((h, i) => <li key={i}>💡 ヒント{i + 1}：{h}</li>)}
          </ol>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Terminal term={term} />
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      {/* ⑧ 達成表示 */}
      {done && <p className="rounded-lg border-2 border-green-600 bg-green-50 p-3 text-xl font-bold text-green-700">修復成功！</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-sub" onClick={() => { term.reset(); setHints(0) }}>リセット</button> {/* ⑨ */}
        <Link href="/repair" className="btn">一覧へ戻る</Link> {/* ⑩ */}
      </div>
    </div>
  )
}
