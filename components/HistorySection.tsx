'use client'

import { useState } from 'react'
import Pager from './Pager'

type QuizRow = { at: string; score: number; total: number; title: string | null }
type PracticeRow = { at: string; passed: boolean; title: string | null }

export type History = {
  quiz: QuizRow[]
  repair: PracticeRow[]
  scenario: PracticeRow[]
}

type Kind = 'quiz' | 'repair' | 'scenario'

const PAGE_SIZE = 10
const TABS: { kind: Kind; label: string }[] = [
  { kind: 'quiz', label: '確認テスト' },
  { kind: 'repair', label: 'エラー修復' },
  { kind: 'scenario', label: 'シナリオ' },
]

const dateTime = (s: string) =>
  new Date(s).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function HistorySection({ history }: { history: History }) {
  const [kind, setKind] = useState<Kind>('quiz')
  const [page, setPage] = useState(1)

  const list = history[kind]
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const rows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const blanks = Array.from({ length: PAGE_SIZE - rows.length })

  return (
    <div>
      {/* 種類のタブ */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => {
              setKind(t.kind)
              setPage(1)
            }}
            className={`rounded-full border px-3 py-1 text-sm ${
              kind === t.kind ? 'border-[#3d5a80] bg-[#3d5a80] font-bold text-white' : 'border-[#d4d4d4] bg-white hover:bg-[#f7f7f7]'
            }`}
            aria-pressed={kind === t.kind}
          >
            {t.label}（{history[t.kind].length}）
          </button>
        ))}
      </div>

      {/* 表（列の幅と行の高さを固定して、ページを切り替えても位置が動かないようにする） */}
      <table className="mt-3 w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[50%]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#444]">
            <th className="py-2 pr-4">日時</th>
            <th className="py-2 pr-4">{kind === 'quiz' ? 'レッスン' : '問題'}</th>
            <th className="py-2">結果</th>
          </tr>
        </thead>
        <tbody>
          {kind === 'quiz'
            ? (rows as QuizRow[]).map((r, i) => (
                <tr key={i} className="h-11 border-b border-[#d4d4d4]">
                  <td className="pr-4">{dateTime(r.at)}</td>
                  <td className="truncate pr-4">{r.title ?? '－'}</td>
                  <td className="font-bold">
                    {r.score} / {r.total}
                  </td>
                </tr>
              ))
            : (rows as PracticeRow[]).map((r, i) => (
                <tr key={i} className="h-11 border-b border-[#d4d4d4]">
                  <td className="pr-4">{dateTime(r.at)}</td>
                  <td className="truncate pr-4">{r.title ?? '－'}</td>
                  <td className={r.passed ? 'font-bold text-green-700' : 'text-gray-500'}>
                    {r.passed ? 'クリア' : '未クリア'}
                  </td>
                </tr>
              ))}
          {blanks.map((_, i) => (
            <tr key={`blank-${i}`} className="h-11 border-b border-transparent" aria-hidden="true">
              <td colSpan={3} />
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p className="mt-2 text-sm text-gray-600">まだ記録がありません。</p>}
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  )
}