'use client'

import { useState } from 'react'
import Pager from './Pager'

export type PracticeItem = {
  id: number
  question_type: 'repair' | 'scenario'
  title: string | null
  command_tag: string
  cleared: boolean
  attempts: number
}

type Kind = 'repair' | 'scenario'
type Filter = 'all' | 'uncleared' | 'cleared'

const PAGE_SIZE = 10
const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'repair', label: 'エラー修復' },
  { kind: 'scenario', label: 'シナリオ' },
]

const statusOf = (i: PracticeItem): Exclude<Filter, 'all'> => (i.cleared ? 'cleared' : 'uncleared')

export default function PracticeSection({ items }: { items: PracticeItem[] }) {
  const [kind, setKind] = useState<Kind>('repair')
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)

  const byKind = items.filter((i) => i.question_type === kind)
  const count = (f: Exclude<Filter, 'all'>) => byKind.filter((i) => statusOf(i) === f).length
  const filtered = filter === 'all' ? byKind : byKind.filter((i) => statusOf(i) === filter)

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const blanks = Array.from({ length: PAGE_SIZE - rows.length })

  const chips: { value: Filter; label: string; n: number }[] = [
  { value: 'all', label: 'すべて', n: byKind.length },
  { value: 'cleared', label: 'クリア', n: count('cleared') },
  { value: 'uncleared', label: '未クリア', n: count('uncleared') },
  ]

  return (
    <div>
      {/* 上のバー：進捗の要約と、表示する種類の切り替え */}
      <div className="grid gap-3 sm:grid-cols-2">
        {KINDS.map(({ kind: k, label }) => {
          const list = items.filter((i) => i.question_type === k)
          const done = list.filter((i) => i.cleared).length
          const pct = list.length ? Math.round((done / list.length) * 100) : 0
          const selected = k === kind
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKind(k)
                setFilter('all')
                setPage(1)
              }}
              className={`rounded-lg border-2 p-3 text-left ${selected ? 'border-[#3d5a80] bg-[#f3f6fa]' : 'border-[#d4d4d4] hover:bg-[#f7f7f7]'}`}
              aria-pressed={selected}
            >
              <div className="flex items-center justify-between text-sm font-bold">
                <span>{label}</span>
                <span className="text-[#3d5a80]">
                  {done} / {list.length} クリア
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]">
                <div className="h-full rounded-full bg-[#3d5a80]" style={{ width: `${pct}%` }} />
              </div>
            </button>
          )
        })}
      </div>

      {/* 状態の絞り込み */}
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setFilter(c.value)
              setPage(1)
            }}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === c.value ? 'border-[#3d5a80] bg-[#3d5a80] font-bold text-white' : 'border-[#d4d4d4] bg-white hover:bg-[#f7f7f7]'
            }`}
            aria-pressed={filter === c.value}
          >
            {c.label}（{c.n}）
          </button>
        ))}
      </div>

      {/* 問題の一覧（行の高さを固定して、ページを切り替えても位置が動かないようにする） */}
      <ul className="mt-3 text-sm">
        {rows.map((i) => (
          <li key={i.id} className="flex h-11 items-center justify-between gap-3 border-b border-[#d4d4d4]">
            <span className="truncate">
              {i.title ?? '（無題）'}
              <span className="ml-2 text-xs text-gray-500">{i.command_tag}</span>
            </span>
            {statusOf(i) === 'cleared' ? (
              <span className="shrink-0 font-bold text-green-700">クリア</span>
            ) : (
              <span className="shrink-0 text-gray-500">未クリア</span>
            )}
          </li>
        ))}
        {blanks.map((_, i) => (
          <li key={`blank-${i}`} className="h-11 border-b border-transparent" aria-hidden="true" />
        ))}
      </ul>
      {filtered.length === 0 && <p className="mt-2 text-sm text-gray-600">該当する問題はありません。</p>}
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  )
}