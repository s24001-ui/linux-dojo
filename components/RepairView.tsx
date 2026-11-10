'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { saveAttempt } from '@/app/actions'
import { allPass, toAbs } from '@/lib/condition'
import { makeFs, shortPath } from '@/lib/terminal'
import type { RepairRow } from '@/lib/types'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'

export default function RepairView({ mission }: { mission: RepairRow }) {
  const s = mission.setup
  const cwd0 = s.cwd ? toAbs(s.cwd) : '/home/student'
  // エラーが表示された状態から始める
  const term = useTerminal(makeFs(s.fs), cwd0, [{ kind: 'in', text: `${shortPath(cwd0)}$ ${s.error.cmd}` }, { kind: 'err', text: s.error.msg }])
  const [hints, setHints] = useState(0)
  const done = allPass(s.checks, { fs: term.fs, cwd: term.cwd, log: term.log })

  // 修復できたら結果をDBに保存（1回だけ）
  const saved = useRef(false)
  useEffect(() => {
    if (done && !saved.current) {
      saved.current = true
      saveAttempt(mission.id, 'repair', true).catch(() => (saved.current = false))
    }
  }, [done, mission.id])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{mission.title}</h1>
      <p className="card">{mission.body}</p>

      {/* ヒントは段階的に表示（読み方→原因→コマンド例） */}
      <div>
        <button className="btn btn-sub !py-1.5 text-sm" onClick={() => setHints(hints + 1)} disabled={hints >= s.hints.length}>
          {hints === 0 ? 'ヒントを見る' : hints < s.hints.length ? '次のヒントを見る' : 'ヒントは以上です'}
        </button>
        {hints > 0 && (
          <ol className="mt-2 space-y-1 rounded border-2 border-dashed border-amber-500 bg-amber-50 p-2 text-sm">
            {s.hints.slice(0, hints).map((h, i) => <li key={i}>💡 ヒント{i + 1}：{h}</li>)}
          </ol>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Terminal term={term} />
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      {done && <p className="rounded-lg border-2 border-green-600 bg-green-50 p-3 text-xl font-bold text-green-700">修復成功！</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-sub" onClick={() => { term.reset(); setHints(0) }}>リセット</button>
        <Link href="/repair" className="btn">一覧へ戻る</Link>
      </div>
    </div>
  )
}
