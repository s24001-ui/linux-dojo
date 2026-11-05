'use client'

import Link from 'next/link'
import { useState } from 'react'
import { scenarioDone, scenarios } from '@/lib/data'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'

export default function ScenarioView({ id }: { id: string }) {
  const scenario = scenarios.find((s) => s.id === id)!
  const term = useTerminal(scenario.fs)
  const [hints, setHints] = useState<number[]>(scenario.goals.map(() => 0)) // 目標ごとのヒント段階
  const ctx = { fs: term.fs, cwd: term.cwd, log: term.log }
  const done = scenarioDone(scenario, ctx)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{scenario.title}</h1>
      <p className="card">{scenario.story}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* ③ 目標チェックリスト（順序は自由）。各目標に段階ヒント */}
          <ul className="card space-y-3" aria-label="目標">
            {scenario.goals.map((g, i) => {
              const ok = g.check(ctx)
              return (
                <li key={g.label}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={ok ? 'text-green-700' : ''}>{ok ? '☑' : '☐'} {g.label}</span>
                    <button className="btn btn-sub !px-3 !py-1 text-xs" disabled={hints[i] >= g.hints.length} onClick={() => setHints(hints.map((h, k) => (k === i ? h + 1 : h)))}>ヒント</button>
                  </div>
                  {hints[i] > 0 && <p className="mt-1 rounded border-2 border-dashed border-amber-500 bg-amber-50 p-1.5 text-sm">💡 {g.hints.slice(0, hints[i]).join(' → ')}</p>}
                </li>
              )
            })}
          </ul>
          <Terminal term={term} />
        </div>
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      {/* ⑥ クリア表示 */}
      {done && <p className="rounded-lg border-2 border-green-600 bg-green-50 p-3 text-xl font-bold text-green-700">シナリオクリア！</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-sub" onClick={() => { term.reset(); setHints(scenario.goals.map(() => 0)) }}>リセット</button> {/* ⑦ */}
        <Link href="/scenarios" className="btn">一覧へ戻る</Link> {/* ⑧ */}
      </div>
    </div>
  )
}
