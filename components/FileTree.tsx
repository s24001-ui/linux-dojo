'use client'

import { useState } from 'react'
import { Fs, HOME } from '@/lib/terminal'

type Diff = { id: number; added: string[]; removed: Fs } | null

// ファイルツリー（F-10）：現在地を強調／増減を一時ハイライト／フォルダのクリックで開閉
export default function FileTree({ fs, cwd, diff = null, className = '' }: { fs: Fs; cwd: string; diff?: Diff; className?: string }) {
  const [closed, setClosed] = useState<Set<string>>(new Set())
  const toggle = (p: string) =>
    setClosed((s) => {
      const n = new Set(s)
      if (n.has(p)) n.delete(p)
      else n.add(p)
      return n
    })

  const all: Fs = { ...(diff?.removed ?? {}), ...fs } // 削除されたものも、消えるまでは薄く残す
  const added = new Set(diff?.added ?? [])
  const rows: { path: string; name: string; depth: number; dir: boolean }[] = []
  const walk = (dir: string, depth: number) => {
    Object.keys(all)
      .filter((k) => k !== '/' && k.replace(/\/[^/]*$/, '') === dir)
      .sort((a, b) => Number(all[b] === null) - Number(all[a] === null) || a.localeCompare(b))
      .forEach((k) => {
        rows.push({ path: k, name: k.split('/').pop()!, depth, dir: all[k] === null })
        if (all[k] === null && !closed.has(k)) walk(k, depth + 1)
      })
  }
  if (!closed.has(HOME)) walk(HOME, 1)

  const rowStyle = (path: string) =>
    path in fs
      ? added.has(path) ? 'bg-green-200' : path === cwd ? 'bg-[#cfe0f5] font-bold' : ''
      : 'bg-red-100 text-red-700 line-through' // 削除されたもの

  const row = ({ path, name, depth, dir }: { path: string; name: string; depth: number; dir: boolean }) => (
    <div key={path} style={{ paddingLeft: `${depth * 1.1}rem` }} className={`rounded px-1 transition-colors ${rowStyle(path)}`}>
      {dir ? (
        <button onClick={() => toggle(path)} className="text-left" aria-expanded={!closed.has(path)}>
          {closed.has(path) ? '▸' : '▾'} 📁 {name}
        </button>
      ) : (
        <span>📄 {name}</span>
      )}
      {path === cwd && <span className="ml-1 font-sans text-xs">← 現在地</span>}
    </div>
  )

  return (
    <div className={`${className} overflow-auto rounded-lg border border-[#444] bg-[#f6f6f6] p-3 font-mono text-sm`} aria-label="ファイルツリー">
      {row({ path: HOME, name: '~', depth: 0, dir: true })}
      {rows.map(row)}
    </div>
  )
}
