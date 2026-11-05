'use client'

import Link from 'next/link'
import { useState } from 'react'
import { practicals } from '@/lib/data'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'

export default function PracticalView({ id }: { id: string }) {
  const test = practicals.find((t) => t.id === id)!
  const term = useTerminal(test.fs)
  const [missing, setMissing] = useState<string[] | null>(null) // null=未判定

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{test.title}</h1>
      <p className="card text-lg">{test.task}</p> {/* ③ ヒントは表示しない */}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Terminal term={term} />
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={() => setMissing(test.judge(term.fs))}>判定する</button> {/* ⑥ 最終状態だけで判定 */}
        <button className="btn btn-sub" onClick={() => { term.reset(); setMissing(null) }}>やり直す</button> {/* ⑧ */}
      </div>

      {/* ⑦ 判定結果表示 */}
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
