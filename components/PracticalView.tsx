'use client'

import Link from 'next/link'
import { useState } from 'react'
import { saveAttempt } from '@/app/actions'
import { failedLabels, toAbs } from '@/lib/condition'
import { makeFs } from '@/lib/terminal'
import type { PracticalRow } from '@/lib/types'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'

export default function PracticalView({ test }: { test: PracticalRow }) {
  const s = test.setup
  const term = useTerminal(makeFs(s.fs), s.cwd ? toAbs(s.cwd) : undefined)
  const [missing, setMissing] = useState<string[] | null>(null) // null=未判定

  // 途中経過ではなく、最終状態だけで判定する（ヒントは出さない）
  const judge = () => {
    const m = failedLabels(s.checks, { fs: term.fs, cwd: term.cwd, log: term.log })
    setMissing(m)
    saveAttempt(test.id, 'practical', m.length === 0).catch(() => {})
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{test.title}</h1>
      <p className="card text-lg">{test.body}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Terminal term={term} />
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={judge}>判定する</button>
        <button className="btn btn-sub" onClick={() => { term.reset(); setMissing(null) }}>やり直す</button>
      </div>

      {missing && (missing.length === 0 ? (
        <p className="rounded-lg border-2 border-green-600 bg-green-50 p-3 text-xl font-bold text-green-700">合格！</p>
      ) : (
        <div className="rounded-lg border-2 border-red-600 bg-red-50 p-3" role="alert">
          <p className="font-bold text-red-700">不合格</p>
          <ul className="mt-1 list-disc pl-5 text-sm">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      ))}

      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
