'use client'

import { useEffect, useRef, useState } from 'react'
import { Fs, HOME, Line, TermState, diffFs, exec, shortPath } from '@/lib/terminal'

type Diff = { id: number; added: string[]; removed: Fs } // F-10：直前のコマンドで増減したもの

type T = { s: TermState; lines: Line[]; log: string[]; diff: Diff | null }

// 疑似ターミナルの状態（F-02）。ターミナル・ファイルツリー・判定で共有する
export function useTerminal(initialFs: Fs, initialCwd: string = HOME, preload: Line[] = []) {
  const init = (): T => ({ s: { fs: initialFs, cwd: initialCwd }, lines: preload, log: [], diff: null })
  const [t, setT] = useState(init)
  const remoteHydrated = useRef(false)
  const initialFsRef = useRef(initialFs)

  // 疑似リモートだけはレッスンを移動しても共有できるよう、ブラウザ内に保存する。
  // ファイルや作業ディレクトリなど、通常のターミナル状態は保存しない。
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('linux-dojo:simulated-remotes:v1') ?? '{}') as Record<string, string>
      setT((prev) => {
        const fs = { ...prev.s.fs }
        for (const [path, value] of Object.entries(saved)) {
          if (!path.startsWith(`${HOME}/.sim-remotes/`)) continue
          let merged = value
          const seedValue = fs[path]
          // レッスン14の「他の人が追加した更新」を、レッスン13でpushした内容にも適用できるよう引き継ぐ。
          if (typeof seedValue === 'string') {
            try {
              const savedSnapshot = JSON.parse(value) as Record<string, unknown>
              const seedSnapshot = JSON.parse(seedValue) as Record<string, unknown>
              if (!savedSnapshot.pullUpdate && seedSnapshot.pullUpdate) {
                merged = JSON.stringify({ ...savedSnapshot, pullUpdate: seedSnapshot.pullUpdate })
              }
            } catch { /* 壊れた保存データはそのまま扱い、コマンド側でエラーにする */ }
          }
          fs[path] = merged
        }
        return { ...prev, s: { ...prev.s, fs } }
      })
    } catch { /* localStorage が使えない環境でも通常の疑似ターミナルは動作する */ }
    remoteHydrated.current = true
  }, [])

  useEffect(() => {
    if (!remoteHydrated.current) return
    try {
      const saved = JSON.parse(localStorage.getItem('linux-dojo:simulated-remotes:v1') ?? '{}') as Record<string, string>
      const current: Record<string, string> = {}
      for (const [path, value] of Object.entries(t.s.fs)) {
        if (!path.startsWith(`${HOME}/.sim-remotes/`) || typeof value !== 'string') continue
        // 初期状態へのリセットでは、別レッスンでpush済みのリモートを初期スナップショットで上書きしない。
        if (typeof initialFsRef.current[path] === 'string' && value === initialFsRef.current[path] && saved[path]) continue
        current[path] = value
      }
      if (Object.keys(current).length) {
        localStorage.setItem('linux-dojo:simulated-remotes:v1', JSON.stringify({ ...saved, ...current }))
      }
    } catch { /* localStorage が使えない環境でも通常の疑似ターミナルは動作する */ }
  }, [t.s.fs])

  const run = (cmd: string) => {
    if (!cmd.trim()) return // 空の入力は何もしない
    setT((p) => {
      const r = exec(p.s, cmd)
      const log = [...p.log, cmd]
      if (r.clear) return { ...p, lines: [], log }
      const d = diffFs(p.s.fs, r.state.fs)
      const changed = d.added.length > 0 || Object.keys(d.removed).length > 0
      return {
        s: r.state,
        lines: [...p.lines, { kind: 'in', text: `${shortPath(p.s.cwd)}$ ${cmd}` }, ...r.out],
        log,
        diff: changed ? { id: (p.diff?.id ?? 0) + 1, ...d } : p.diff,
      }
    })
  }

  // ハイライトは2秒だけ見せる
  const diffId = t.diff?.id
  useEffect(() => {
    if (diffId === undefined) return
    const timer = setTimeout(() => setT((p) => (p.diff?.id === diffId ? { ...p, diff: null } : p)), 2000)
    return () => clearTimeout(timer)
  }, [diffId])

  // 「リセット」「やり直し」：ファイルシステム・現在地・履歴を初期状態に戻す（F-03）
  const reset = () => setT(init())
  return { fs: t.s.fs, cwd: t.s.cwd, lines: t.lines, log: t.log, diff: t.diff, run, reset }
}
export type Term = ReturnType<typeof useTerminal>

const COLOR: Record<Line['kind'], string> = { in: 'text-[#9ad0ff]', out: '', err: 'text-[#ff8a80]', note: 'text-[#ffd479]' }

// 疑似ターミナルの表示：Enterで実行、↑↓で過去の入力を呼び出す。新しい行が増えたら最下部へスクロール
export default function Terminal({ term, className = 'h-72' }: { term: Term; className?: string }) {
  const [value, setValue] = useState('')
  const [pos, setPos] = useState<number | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const history = term.log

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight })
  }, [term.lines])

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) return // 日本語変換の確定Enterは無視
      term.run(value)
      setValue('')
      setPos(null)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (!history.length) return
      const next = e.key === 'ArrowUp' ? Math.max(0, (pos ?? history.length) - 1) : (pos ?? history.length) + 1
      if (next >= history.length) {
        setPos(null)
        setValue('')
      } else {
        setPos(next)
        setValue(history[next])
      }
    }
  }

  return (
    <div
      ref={box}
      onClick={() => input.current?.focus()}
      className={`${className} overflow-y-auto rounded-lg border border-[#444] bg-[#1e1e1e] p-3 font-mono text-sm leading-6 text-[#e6e6e6]`}
      role="log"
      aria-label="疑似ターミナル"
    >
      {term.lines.map((l, i) => (
        <div key={i} className={`whitespace-pre-wrap break-all ${COLOR[l.kind]}`}>
          {l.text}
        </div>
      ))}
      <div className="flex">
        <span className="shrink-0 text-[#9ad0ff]">{shortPath(term.cwd)}$&nbsp;</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="コマンド入力"
          className="min-w-0 flex-1 bg-transparent text-[#e6e6e6] outline-none"
        />
      </div>
    </div>
  )
}
