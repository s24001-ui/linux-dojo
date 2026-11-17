'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { ScenarioRow } from '@/lib/types'

export default function ScenarioListView({ scenarios }: { scenarios: ScenarioRow[] }) {
  const [query, setQuery] = useState('')
  const clearedCount = scenarios.filter((scenario) => scenario.cleared).length
  const commands = [...new Set(scenarios.flatMap((scenario) => scenario.setup.commands.split('/').map((command) => command.trim()).filter(Boolean)))]
  const gitCommands = new Set(['add', 'commit', 'log', 'branch', 'switch', 'merge', 'remote', 'push', 'pull', 'clone'])
  const orderedCommands = [
    ...commands.filter((command) => !command.toLowerCase().startsWith('git ') && !gitCommands.has(command.toLowerCase())),
    ...commands.filter((command) => command.toLowerCase().startsWith('git ') || gitCommands.has(command.toLowerCase())),
  ]
  const filteredScenarios = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return scenarios
    return scenarios.filter((scenario) => scenario.setup.commands.toLowerCase().includes(normalizedQuery))
  }, [scenarios, query])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">シナリオ</h1>
        <p className="mt-1 text-sm text-gray-600">実際の作業を想定したシナリオに挑戦しましょう</p>
      </div>

      <section className="card" aria-label="シナリオ達成状況">
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span>達成状況</span>
          <span className="text-[#3d5a80]">{clearedCount} / {scenarios.length} 件</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#d4d4d4]">
          <div
            className="h-full rounded-full bg-[#3d5a80]"
            style={{ width: `${scenarios.length ? (clearedCount / scenarios.length) * 100 : 0}%` }}
          />
        </div>
      </section>

      <label className="block">
        <span className="text-sm font-bold">コマンドを検索</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例：git、grep"
          className="mt-1 w-full rounded border border-[#444] bg-white px-3 py-2 focus:border-[#3d5a80] focus:outline-none focus:ring-2 focus:ring-[#3d5a80]/30"
        />
      </label>
      <div aria-label="使用コマンド一覧">
        <div className="flex flex-wrap gap-2">
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

      {filteredScenarios.length > 0 ? (
        <ul className="space-y-2">
          {filteredScenarios.map((scenario) => (
            <li key={scenario.id}>
              <Link href={`/scenarios/${scenario.id}`} className="card block hover:bg-[#f3f6fa]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">{scenario.title}</span>
                  <span className={`badge shrink-0 ${scenario.cleared ? 'badge-ok' : 'badge-ng'}`}>
                    <span aria-hidden="true">{scenario.cleared ? '✓' : '□'}</span>{' '}
                    {scenario.cleared ? 'クリア済み' : '未クリア'}
                  </span>
                </div>
                <p className="mt-2 text-sm">{scenario.setup.summary}</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-600">使用コマンド</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {scenario.setup.commands.split('/').map((command) => command.trim()).filter(Boolean).map((command) => (
                        <code key={command} className="rounded bg-[#eef2f7] px-2 py-0.5 font-mono text-sm font-bold text-[#3d5a80]">{command}</code>
                      ))}
                    </div>
                  </div>
                  <span className="btn !px-4 !py-1.5 text-sm">{scenario.cleared ? 'もう一度挑戦' : 'シナリオを開始'}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card text-center text-sm text-gray-600">該当するコマンドのシナリオはありません。</p>
      )}
    </div>
  )
}
