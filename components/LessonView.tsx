'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { completeLesson } from '@/app/actions'
import { passes, toAbs } from '@/lib/condition'
import { makeFs } from '@/lib/terminal'
import type { LessonRow, StepRow } from '@/lib/types'
import Terminal, { useTerminal } from './Terminal'
import FileTree from './FileTree'

export default function LessonView({ lesson, steps }: { lesson: Pick<LessonRow, 'code' | 'title'>; steps: StepRow[] }) {
  const first = steps[0].setup_data // 初期ファイル構成は1ステップ目に入っている。2ステップ目以降は前の状態を引き継ぐ
  const term = useTerminal(makeFs(first ?? {}), first?.cwd ? toAbs(first.cwd) : undefined)
  const [step, setStep] = useState(0)
  const [start, setStart] = useState(0) // このステップを始めたときのコマンド履歴の位置
  const [hint, setHint] = useState(false)
  const total = steps.length
  const cur = steps[step]
  // そのステップを始めてからの入力と、ファイルシステムの最終状態で判定する
  const cleared = passes(cur.clear_condition, { fs: term.fs, cwd: term.cwd, log: term.log.slice(start) })
  const last = step === total - 1

  // 全ステップをクリアしたときだけ、進捗をDBに登録（1回だけ）
  const saved = useRef(false)
  useEffect(() => {
    if (cleared && last && !saved.current) {
      saved.current = true
      completeLesson(lesson.code).catch(() => (saved.current = false))
    }
  }, [cleared, last, lesson.code])

  const next = () => {
    setStep(step + 1)
    setStart(term.log.length)
    setHint(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      <div>
        <p className="mb-1 text-sm font-bold">ステップ {step + 1} / {total}</p>
        <div className="flex gap-1" role="progressbar" aria-valuenow={step + 1} aria-valuemax={total}>
          {steps.map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded ${i < step || (i === step && cleared) ? 'bg-green-500' : i === step ? 'bg-blue-500' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="card">
            <p className="text-lg">{cur.body}</p>
            <button className="btn btn-sub mt-3 !py-1.5 text-sm" onClick={() => setHint(true)} disabled={hint}>ヒントを見る</button>
            {hint && <p className="mt-3 rounded border-2 border-dashed border-amber-500 bg-amber-50 p-2 text-sm">💡 {cur.hint}</p>}
          </div>
          <Terminal term={term} />
        </div>
        <FileTree fs={term.fs} cwd={term.cwd} diff={term.diff} className="h-72 lg:h-auto" />
      </div>

      {cleared && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border-2 border-green-600 bg-green-50 p-3">
          <p className="text-xl font-bold text-green-700">OK！</p>
          {last ? <Link href={`/lessons/${lesson.code}/quiz`} className="btn">確認テストへ進む</Link> : <button className="btn" onClick={next}>次のステップへ</button>}
        </div>
      )}

      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
