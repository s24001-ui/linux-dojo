'use client'

import Link from 'next/link'
import { useState } from 'react'
import { lessons } from '@/lib/data'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'

export default function LessonView({ id }: { id: string }) {
  const lesson = lessons.find((l) => l.id === id)!
  const term = useTerminal(lesson.fs)
  const [step, setStep] = useState(0)
  const [start, setStart] = useState(0) // このステップを始めたときのコマンド履歴の位置
  const [hint, setHint] = useState(false)
  const total = lesson.steps.length
  const cur = lesson.steps[step]
  // ⑨ そのステップを始めてからの入力と、ファイルシステムの状態で判定する
  const cleared = cur.check({ fs: term.fs, cwd: term.cwd, log: term.log.slice(start) })
  const last = step === total - 1

  const next = () => {
    setStep(step + 1)
    setStart(term.log.length)
    setHint(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{lesson.title}</h1> {/* ② */}

      {/* ③ 進捗表示：完了は緑、現在は青、未着手は灰色 */}
      <div>
        <p className="mb-1 text-sm font-bold">ステップ {step + 1} / {total}</p>
        <div className="flex gap-1" role="progressbar" aria-valuenow={step + 1} aria-valuemax={total}>
          {lesson.steps.map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded ${i < step || (i === step && cleared) ? 'bg-green-500' : i === step ? 'bg-blue-500' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          {/* ④ 課題文 ⑤ ヒントボタン ⑥ ヒント表示欄 */}
          <div className="card">
            <p className="text-lg">{cur.task}</p>
            <button className="btn btn-sub mt-3 !py-1.5 text-sm" onClick={() => setHint(true)} disabled={hint}>ヒントを見る</button>
            {hint && <p className="mt-3 rounded border-2 border-dashed border-amber-500 bg-amber-50 p-2 text-sm">💡 {cur.hint}</p>}
          </div>
          <Terminal term={term} />
        </div>
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      {/* ⑨ ステップクリア表示 ⑩ 次のステップへ ⑪ 確認テストへ */}
      {cleared && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border-2 border-green-600 bg-green-50 p-3">
          <p className="text-xl font-bold text-green-700">OK！</p>
          {last ? <Link href={`/lessons/${lesson.id}/quiz`} className="btn">確認テストへ進む</Link> : <button className="btn" onClick={next}>次のステップへ</button>}
        </div>
      )}

      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link> {/* ⑫ */}
    </div>
  )
}
