'use client'

import { useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'
import { recordQuizAnswer, saveQuizResult } from '@/app/actions'
import { QUIZ_SIZE } from '@/lib/quiz'
import type { LessonRow, QuizRow } from '@/lib/types'

// レッスンごとの確認テスト（QUIZ_SIZE 問）を、登録順（id順）に毎回すべて出題する
export default function QuizView(props: { lesson: Pick<LessonRow, 'code' | 'title'>; questions: QuizRow[] }) {
  // Cache Components では、ページを離れても画面（Activity）が隠れるだけで状態が残る。
  // 「もう一度受ける」で戻ってきたとき、前回の最後の問題が表示されたままにならないよう、
  // 結果画面へ進んだあとに隠れたら key を変えて作り直す（最初の問題からやり直せる）。
  // 途中で離れただけなら、状態はそのまま残す。
  const [round, setRound] = useState(0)
  const finished = useRef(false)
  useLayoutEffect(() => {
    return () => {
      if (finished.current) {
        finished.current = false
        setRound((r) => r + 1)
      }
    }
  }, [])
  return <QuizBody key={round} {...props} onFinish={() => { finished.current = true }} />
}

function QuizBody({ lesson, questions, onFinish }: { lesson: Pick<LessonRow, 'code' | 'title'>; questions: QuizRow[]; onFinish: () => void }) {
  const router = useRouter()
  const qs = questions.slice(0, QUIZ_SIZE)
  const [no, setNo] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<Record<number, boolean>>({}) // 問題ID → 正解したか
  const [saving, setSaving] = useState(false)

  if (!qs.length) return <p>このレッスンの問題がまだ登録されていません。</p>
  const q = qs[no]
  const L = ['A', 'B', 'C', 'D']
  const last = no === qs.length - 1

  const answer = (i: number) => {
    if (picked !== null) return // 回答後は変更できない
    setPicked(i)
    setResults((r) => ({ ...r, [q.id]: i === q.correct_index }))
    recordQuizAnswer(q.id, i).catch(() => {}) // 1問ずつ回答履歴に保存（失敗しても学習は続けられる）
  }
  const next = async () => {
    if (!last) {
      setNo(no + 1)
      setPicked(null)
      return
    }
    setSaving(true)
    const score = qs.filter((x) => results[x.id]).length
    await saveQuizResult(lesson.code, score, qs.length).catch(() => {})
    const r = qs.map((x) => `${x.id}:${results[x.id] ? 1 : 0}`).join(',')
    onFinish() // 結果画面へ移動したあと、この画面が隠れたら作り直す
    router.push(`/lessons/${lesson.code}/result?r=${r}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">{lesson.title}　確認テスト</h1>
      <p className="font-bold">問題 {no + 1} / {qs.length}</p>
      <p className="card text-lg">{q.body}</p>
      <div className="grid gap-2">
        {q.choices.map((c, i) => {
          const style = picked === null ? 'border-[#444] bg-white hover:bg-[#f3f6fa]' : i === q.correct_index ? 'border-green-600 bg-green-100' : i === picked ? 'border-red-600 bg-red-100' : 'border-gray-300 bg-white opacity-60'
          return (
            <button key={i} onClick={() => answer(i)} disabled={picked !== null} className={`rounded-lg border-2 px-4 py-3 text-left ${style}`}>
              <span className="mr-3 font-bold">{L[i]}</span>{c}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="space-y-3" aria-live="polite">
          <p className={`text-xl font-bold ${picked === q.correct_index ? 'text-green-700' : 'text-red-700'}`}>{picked === q.correct_index ? '正解' : '不正解'}</p>
          {q.explanation && <p className="card bg-[#f6f6f6]">{q.explanation}</p>}
          <button className="btn" onClick={next} disabled={saving}>{last ? '結果を見る' : '次の問題へ'}</button>
        </div>
      )}
    </div>
  )
}