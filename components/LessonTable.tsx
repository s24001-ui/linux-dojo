'use client'

import { useState } from 'react'
import Pager from './Pager'

export type LessonProgress = {
  code: string
  title: string
  category: string
  completed_label: string | null
  best_quiz: number | null
  quiz_total: number | null
  quiz_attempts: number
}

const PAGE_SIZE = 10

export default function LessonTable({ lessons }: { lessons: LessonProgress[] }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(lessons.length / PAGE_SIZE))
  const rows = lessons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  // 最後のページで行が足りないときの、高さをそろえるための空行の数
  const blanks = Array.from({ length: PAGE_SIZE - rows.length })

  return (
    <>
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[46%]" />
          <col className="w-[24%]" />
          <col className="w-[18%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#444]">
            <th className="py-2 pr-4">レッスン</th>
            <th className="py-2 pr-4">状態</th>
            <th className="py-2 pr-4">確認テスト（最高点）</th>
            <th className="py-2">受験回数</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.code} className="h-11 border-b border-[#d4d4d4]">
              <td className="pr-4">
                <span className="font-bold">{l.title}</span>
                <span className="ml-2 text-xs text-gray-600">{l.category}</span>
              </td>
              <td className="pr-4">
                {l.completed_label ? (
                  <span className="font-bold text-green-700">クリア（{l.completed_label}）</span>
                ) : (
                  <span className="text-gray-500">未クリア</span>
                )}
              </td>
              <td className="pr-4">{l.best_quiz === null ? '－' : `${l.best_quiz} / ${l.quiz_total}`}</td>
              <td>{l.quiz_attempts}</td>
            </tr>
          ))}
          {blanks.map((_, i) => (
            <tr key={`blank-${i}`} className="h-11 border-b border-transparent" aria-hidden="true">
              <td colSpan={4} />
            </tr>
          ))}
        </tbody>
      </table>
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </>
  )
}