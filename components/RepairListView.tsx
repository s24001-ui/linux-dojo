'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { RepairRow } from '@/lib/types'

export default function RepairListView({ missions }: { missions: RepairRow[] }) {
  const [query, setQuery] = useState('')
  const clearedCount = missions.filter((mission) => mission.cleared).length
  const commands = [...new Set(missions.map((mission) => mission.command_tag))]
  const orderedCommands = [
    ...commands.filter((command) => !command.toLowerCase().startsWith('git ')),
    ...commands.filter((command) => command.toLowerCase().startsWith('git ')),
  ]
  const filteredMissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return missions
    return missions.filter((mission) => mission.command_tag.toLowerCase().includes(normalizedQuery))
  }, [missions, query])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">エラー修復</h1>
        <p className="mt-1 text-sm text-gray-600">コマンドのエラーを見つけて、正しく修復しましょう</p>
      </div>

      <section className="card" aria-label="修復状況">
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span>修復状況</span>
          <span className="text-[#3d5a80]">{clearedCount} / {missions.length} 件</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]">
          <div
            className="h-full rounded-full bg-[#3d5a80]"
            style={{ width: `${missions.length ? (clearedCount / missions.length) * 100 : 0}%` }}
          />
        </div>
      </section>

      <label className="block">
        <span className="text-sm font-bold">コマンドを検索</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例：cd、grep"
          className="mt-1 w-full rounded border border-[#444] bg-white px-3 py-2 focus:border-[#3d5a80] focus:outline-none focus:ring-2 focus:ring-[#3d5a80]/30"
        />
      </label>
      <div aria-label="対象コマンド一覧">
        <div className="mt-2 flex flex-wrap gap-2">
          {orderedCommands.map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => setQuery(command)}
              className={`rounded-full border px-3 py-1 font-mono text-sm font-bold ${
                query === command ? 'border-[#3d5a80] bg-[#3d5a80] text-white' : 'border-[#3d5a80] bg-[#eef2f7] text-[#3d5a80] hover:bg-[#dce6f2]'
              }`}
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {filteredMissions.length > 0 ? (
        <ul className="space-y-2">
          {filteredMissions.map((m) => (
            <li key={m.id}>
              <Link href={`/repair/${m.id}`} className="card block hover:bg-[#f3f6fa]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">{m.title}</span>
                  <span className={`badge shrink-0 ${m.cleared ? 'badge-ok' : 'badge-ng'}`}>
                    <span aria-hidden="true">{m.cleared ? '✓' : '□'}</span>{' '}
                    {m.cleared ? 'クリア済み' : '未クリア'}
                  </span>
                </div>
                <p className="mt-2 text-sm">{m.body}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    対象コマンド：
                    <code className="rounded bg-[#eef2f7] px-2 py-0.5 font-mono font-bold text-[#3d5a80]">{m.command_tag}</code>
                  </span>
                  <span className="btn !px-4 !py-1.5 text-sm">{m.cleared ? 'もう一度挑戦' : '修復を開始'}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card text-center text-sm text-gray-600">該当するコマンドの問題はありません。</p>
      )}
    </div>
  )
}
