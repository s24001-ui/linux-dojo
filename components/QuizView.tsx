'use client'

import { useRouter } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { lessons, quizPool } from '@/lib/data'

const noop = () => () => {}

// 毎回ちがう順番で10問を出す。サーバーと表示がずれないよう、ブラウザで表示してから抽出する
export default function QuizView({ id }: { id: string }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  return mounted ? <QuizBody id={id} /> : <p>問題を読み込み中…</p>
}

function QuizBody({ id }: { id: string }) {
  const lesson = lessons.find((l) => l.id === id)!
  const router = useRouter()
  const [order] = useState<number[]>(() => quizPool.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 10)) // 出題順（問題プールの番号）
  const [no, setNo] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<string[]>(() => quizPool.map(() => '0')) // 問題プール順の正誤（1=正解）

  const idx = order[no]
  const q = quizPool[idx]
  const L = ['A', 'B', 'C', 'D']
  const last = no === order.length - 1

  const answer = (i: number) => {
    if (picked !== null) return // 回答後は変更できない
    setPicked(i)
    setResults((r) => r.map((v, k) => (k === idx ? (i === q.answer ? '1' : '0') : v)))
  }
  const next = () => {
    if (last) router.push(`/lessons/${lesson.id}/result?r=${results.join('')}&o=${order.join('')}`)
    else {
      setNo(no + 1)
      setPicked(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">{lesson.title}　確認テスト</h1>
      <p className="font-bold">問題 {no + 1} / {order.length}</p>
      <p className="card text-lg">{q.q}</p>
      <div className="grid gap-2">
        {q.choices.map((c, i) => {
          const style = picked === null ? 'border-[#444] bg-white hover:bg-[#f3f6fa]' : i === q.answer ? 'border-green-600 bg-green-100' : i === picked ? 'border-red-600 bg-red-100' : 'border-gray-300 bg-white opacity-60'
          return (
            <button key={i} onClick={() => answer(i)} disabled={picked !== null} className={`rounded-lg border-2 px-4 py-3 text-left ${style}`}>
              <span className="mr-3 font-bold">{L[i]}</span>{c}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="space-y-3" aria-live="polite">
          <p className={`text-xl font-bold ${picked === q.answer ? 'text-green-700' : 'text-red-700'}`}>{picked === q.answer ? '正解' : '不正解'}</p>
          <p className="card bg-[#f6f6f6]">{q.explain}</p>
          <button className="btn" onClick={next}>{last ? '結果を見る' : '次の問題へ'}</button>
        </div>
      )}
    </div>
  )
}
