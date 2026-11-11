// 疑似ターミナルの中身（F-03 疑似ファイルシステム / F-04 基本コマンド / F-08 エラー表示）。
// ブラウザ内のメモリだけで動き、DBには何も保存しない。
//
// ファイルシステムは「絶対パス → 内容」の表。内容が null のものはフォルダ。
export type Fs = Record<string, string | null>
export type TermState = { fs: Fs; cwd: string }
// in=入力した行 / out=実行結果 / err=英文エラー / note=日本語の解説・もしかして候補
export type Line = { kind: 'in' | 'out' | 'err' | 'note'; text: string }

export const HOME = '/home/student'

/* ---------- F-03 疑似ファイルシステム ---------- */

// 初期ファイル構成データ → 木構造。パスはホームからの相対で書く
// 例: makeFs({ dirs: ['work'], files: { 'docs/a.txt': '中身' } })
export function makeFs(spec: { dirs?: string[]; files?: Record<string, string> }): Fs {
  const fs: Fs = { '/': null, '/home': null, [HOME]: null }
  const addParents = (p: string) => {
    const parts = p.split('/').slice(0, -1)
    for (let i = 1; i <= parts.length; i++) fs[`${HOME}/${parts.slice(0, i).join('/')}`] = null
  }
  for (const d of spec.dirs ?? []) {
    addParents(d + '/x')
    fs[`${HOME}/${d}`] = null
  }
  for (const [p, c] of Object.entries(spec.files ?? {})) {
    addParents(p)
    fs[`${HOME}/${p}`] = c
  }
  return fs
}

export const exists = (fs: Fs, path: string) => path in fs
export const isDir = (fs: Fs, path: string) => fs[path] === null
export const isFile = (fs: Fs, path: string) => typeof fs[path] === 'string'

// 絶対パス・相対パス・特殊ディレクトリ（. .. ~）を解釈する
export function resolve(cwd: string, p: string): string {
  if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1)
  const out: string[] = []
  for (const s of (p.startsWith('/') ? p : `${cwd}/${p}`).split('/')) {
    if (!s || s === '.') continue
    if (s === '..') out.pop()
    else out.push(s)
  }
  return '/' + out.join('/')
}

const parentOf = (p: string) => p.replace(/\/[^/]*$/, '') || '/'
const baseOf = (p: string) => p.split('/').pop() ?? ''
const childrenOf = (fs: Fs, dir: string) =>
  Object.keys(fs).filter((k) => k !== '/' && k !== dir && parentOf(k) === dir).map(baseOf).sort()

export const shortPath = (cwd: string) =>
  cwd === HOME ? '~' : cwd.startsWith(HOME + '/') ? '~' + cwd.slice(HOME.length) : cwd

// コマンド実行前後の差分（F-10 の一時ハイライト用）
export function diffFs(before: Fs, after: Fs) {
  const added = Object.keys(after).filter((k) => !(k in before))
  const removed: Fs = {}
  for (const k of Object.keys(before)) if (!(k in after)) removed[k] = before[k]
  return { added, removed }
}

/* ---------- F-08 エラー表示 ---------- */

// 英文エラーの下に出す、日本語の原因と対処
const EXPLAIN: [RegExp, string][] = [
  [/No such file or directory/, '指定した名前のファイルやフォルダがありません。ls で名前を確認しましょう（綴りや、いる場所も確認）。'],
  [/Not a directory/, 'フォルダではなくファイルを指定しています。フォルダを指定してください。'],
  [/Is a directory/, 'フォルダにはそのまま使えない操作です。フォルダを対象にするときは、rm -r のようにオプションが必要なコマンドもあります。'],
  [/File exists/, '同じ名前がすでにあります。別の名前にするか、ls で確認しましょう。'],
  [/-r not specified/, 'フォルダをコピーするときは、cp -r を使います。'],
  [/missing (file )?operand|missing destination/, 'コマンドに必要な引数（対象の名前など）が足りません。'],
  [/command not found/, 'そのコマンドは存在しません。綴りを確認しましょう。'],
]

// コマンドの綴り間違い候補を探す（編集距離が2以内で、いちばん近いもの）
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}
export function suggest(cmd: string): string | null {
  let best: [string, number] | null = null
  for (const name of [...Object.keys(commands), 'clear']) {
    const dist = distance(cmd, name)
    if (dist <= 2 && (!best || dist < best[1])) best = [name, dist]
  }
  return best ? best[0] : null
}

/* ---------- F-04 基本コマンド（コマンドごとに分けて登録。追加は下の表に足すだけ） ---------- */

type Env = {
  fs: Fs
  cwd: string
  args: string[] // オプション以外の引数
  flags: string // 「-al」→「al」
  rest: string[] // 引数すべて（echo 用）
  R: (p: string) => string // cwd から絶対パスへ
  say: (t: string) => void
  err: (t: string) => void
  stdin: string[] | null // パイプで渡された入力（なければ null）
  piped: boolean // 出力がパイプで次のコマンドに渡されるか
}

/* --- ファイルの中身を行ごとに読む道具（head / tail / wc / grep 用） --- */
const linesOf = (c: string) => (c === '' ? [] : c.replace(/\n$/, '').split('\n'))

function fileLines(e: Env, name: string, cmd: string): string[] | null {
  const t = e.R(name)
  if (!exists(e.fs, t)) return e.err(`${cmd}: ${name}: No such file or directory`), null
  if (isDir(e.fs, t)) return e.err(`${cmd}: ${name}: Is a directory`), null
  return linesOf(e.fs[t] as string)
}

// 読む対象。ファイル名があればそのファイル、なければパイプで渡された入力
function sources(e: Env, files: string[], cmd: string) {
  if (!files.length) {
    if (e.stdin) return [{ name: null as string | null, lines: e.stdin }]
    return e.err(`${cmd}: missing file operand`), null
  }
  const out: { name: string | null; lines: string[] }[] = []
  for (const f of files) {
    const l = fileLines(e, f, cmd)
    if (l) out.push({ name: f, lines: l })
  }
  return out
}

// head / tail：-n 3、-n3、-3 のどれでも行数を指定できる（指定なしは10行）
function headTail(e: Env, cmd: 'head' | 'tail') {
  let n = 10
  const files: string[] = []
  const r = e.rest
  for (let i = 0; i < r.length; i++) {
    const a = r[i]
    if (a === '-n' && /^\d+$/.test(r[i + 1] ?? '')) n = Number(r[++i])
    else if (/^-n\d+$/.test(a)) n = Number(a.slice(2))
    else if (/^-\d+$/.test(a)) n = Number(a.slice(1))
    else if (!a.startsWith('-')) files.push(a)
  }
  const srcs = sources(e, files, cmd)
  if (!srcs) return
  srcs.forEach((src, i) => {
    if (srcs.length > 1) {
      if (i) e.say('')
      e.say(`==> ${src.name} <==`)
    }
    const pick = cmd === 'head' ? src.lines.slice(0, n) : src.lines.slice(Math.max(0, src.lines.length - n))
    pick.forEach((l) => e.say(l))
  })
}

const commands: Record<string, (e: Env) => void> = {
  pwd: (e) => e.say(e.cwd),

  echo(e) {
    const i = e.rest.indexOf('>')
    if (i < 0) return e.say(e.rest.join(' '))
    const target = e.rest[i + 1]
    if (!target) return e.err('bash: syntax error near unexpected token `newline\'')
    const t = e.R(target)
    if (isDir(e.fs, t)) e.err(`bash: ${target}: Is a directory`)
    else if (!isDir(e.fs, parentOf(t))) e.err(`bash: ${target}: No such file or directory`)
    else e.fs = { ...e.fs, [t]: e.rest.slice(0, i).join(' ') + '\n' }
  },

  ls(e) {
    const arg = e.args[0]
    const t = e.R(arg ?? '.')
    if (!exists(e.fs, t)) return e.err(`ls: cannot access '${arg}': No such file or directory`)
    if (isFile(e.fs, t)) return e.say(baseOf(t))
    let names = childrenOf(e.fs, t)
    names = e.flags.includes('a') ? ['.', '..', ...names] : names.filter((n) => !n.startsWith('.'))
    if (e.flags.includes('l')) {
      e.say(`total ${names.length * 4}`)
      for (const n of names) {
        const dir = n === '.' || n === '..' || isDir(e.fs, `${t}/${n}`)
        const size = dir ? 4096 : (e.fs[`${t}/${n}`] as string).length
        e.say(`${dir ? 'drwxr-xr-x' : '-rw-r--r--'} 1 student student ${String(size).padStart(4)} Nov  5 10:00 ${n}`)
      }
    } else if (names.length) {
      if (e.piped) names.forEach((n) => e.say(n))
      else e.say(names.join('  '))
    }
  },

  cd(e) {
    const arg = e.args[0]
    const t = arg ? e.R(arg) : HOME
    if (!exists(e.fs, t)) e.err(`bash: cd: ${arg}: No such file or directory`)
    else if (isFile(e.fs, t)) e.err(`bash: cd: ${arg}: Not a directory`)
    else e.cwd = t
  },

  cat(e) {
    if (!e.args.length) {
      if (e.stdin) return e.stdin.forEach((l) => e.say(l))
      return e.err('cat: missing file operand')
    }
    for (const a of e.args) {
      const t = e.R(a)
      if (!exists(e.fs, t)) e.err(`cat: ${a}: No such file or directory`)
      else if (isDir(e.fs, t)) e.err(`cat: ${a}: Is a directory`)
      else (e.fs[t] as string).replace(/\n$/, '').split('\n').forEach((l) => e.say(l))
    }
  },

  mkdir(e) {
    if (!e.args.length) return e.err('mkdir: missing operand')
    for (const a of e.args) {
      const t = e.R(a)
      if (exists(e.fs, t)) {
        if (!e.flags.includes('p')) e.err(`mkdir: cannot create directory ‘${a}’: File exists`)
      } else if (!e.flags.includes('p') && !isDir(e.fs, parentOf(t))) {
        e.err(`mkdir: cannot create directory ‘${a}’: No such file or directory`)
      } else {
        e.fs = { ...e.fs }
        for (let p = t; !exists(e.fs, p); p = parentOf(p)) e.fs[p] = null
      }
    }
  },

  touch(e) {
    if (!e.args.length) return e.err('touch: missing file operand')
    for (const a of e.args) {
      const t = e.R(a)
      if (!isDir(e.fs, parentOf(t))) e.err(`touch: cannot touch '${a}': No such file or directory`)
      else if (!exists(e.fs, t)) e.fs = { ...e.fs, [t]: '' }
    }
  },

  rm(e) {
    if (!e.args.length) return e.err('rm: missing operand')
    for (const a of e.args) {
      const t = e.R(a)
      if (!exists(e.fs, t)) e.err(`rm: cannot remove '${a}': No such file or directory`)
      else if (isDir(e.fs, t) && !e.flags.includes('r')) e.err(`rm: cannot remove '${a}': Is a directory`)
      else if (t === '/' || t === HOME || e.cwd.startsWith(t + '/') || e.cwd === t) e.err(`rm: refusing to remove '${a}'`)
      else e.fs = Object.fromEntries(Object.entries(e.fs).filter(([k]) => k !== t && !k.startsWith(t + '/')))
    }
  },

  head: (e) => headTail(e, 'head'),
  tail: (e) => headTail(e, 'tail'),

  // 行数・単語数・バイト数。-l -w -c で1つだけ表示
  wc(e) {
    const srcs = sources(e, e.args, 'wc')
    if (!srcs) return
    const all = !/[lwc]/.test(e.flags)
    const rows = srcs.map((src) => {
      const text = src.lines.join('\n')
      const cols: number[] = []
      if (all || e.flags.includes('l')) cols.push(src.lines.length)
      if (all || e.flags.includes('w')) cols.push(text.split(/\s+/).filter(Boolean).length)
      if (all || e.flags.includes('c')) cols.push(new TextEncoder().encode(text + (src.lines.length ? '\n' : '')).length)
      return { cols, name: src.name }
    })
    if (rows.length > 1) rows.push({ cols: rows[0].cols.map((_, i) => rows.reduce((a, r) => a + r.cols[i], 0)), name: 'total' })
    for (const r of rows) e.say([...r.cols.map((c) => (all ? String(c).padStart(2) : String(c))), r.name].filter((x) => x !== null).join(' '))
  },

  // 文字を探す。-i 大小無視 / -n 行番号 / -c 件数 / -v 含まない行
  grep(e) {
    const [pattern, ...files] = e.args
    if (pattern === undefined) return e.err('Usage: grep [OPTION]... PATTERNS [FILE]...')
    const flag = e.flags.includes('i') ? 'i' : ''
    let re: RegExp
    try {
      re = new RegExp(pattern, flag)
    } catch {
      re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flag)
    }
    const srcs = sources(e, files, 'grep')
    if (!srcs) return
    for (const src of srcs) {
      const label = srcs.length > 1 && src.name ? `${src.name}:` : ''
      let count = 0
      src.lines.forEach((l, i) => {
        if (re.test(l) === e.flags.includes('v')) return
        count++
        if (!e.flags.includes('c')) e.say(`${label}${e.flags.includes('n') ? `${i + 1}:` : ''}${l}`)
      })
      if (e.flags.includes('c')) e.say(`${label}${count}`)
    }
  },

  // ファイルを名前で探す。find [場所] -name "パターン" [-type f|d]
  find(e) {
    const r = e.rest
    const start = r[0] && !r[0].startsWith('-') ? r[0] : '.'
    let name: string | null = null
    let type: string | null = null
    for (let i = start === r[0] ? 1 : 0; i < r.length; i++) {
      if (r[i] === '-name') name = r[++i] ?? null
      else if (r[i] === '-type') type = r[++i] ?? null
    }
    const root = e.R(start)
    if (!exists(e.fs, root)) return e.err(`find: ‘${start}’: No such file or directory`)
    const re = name === null ? null : new RegExp('^' + name.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    const walk = (abs: string, shown: string) => {
      const dir = isDir(e.fs, abs)
      if ((!re || re.test(baseOf(shown))) && (!type || (type === 'd') === dir)) e.say(shown)
      if (dir) for (const n of childrenOf(e.fs, abs)) walk(`${abs === '/' ? '' : abs}/${n}`, `${shown.replace(/\/$/, '')}/${n}`)
    }
    walk(root, start)
  },

  cp: (e) => copyMove(e, 'cp'),
  mv: (e) => copyMove(e, 'mv'),
}

function copyMove(e: Env, name: 'cp' | 'mv') {
  if (e.args.length < 2) return e.err(`${name}: missing destination file operand after '${e.args[0] ?? ''}'`)
  const src = e.R(e.args[0])
  let dst = e.R(e.args[1])
  if (!exists(e.fs, src)) return e.err(`${name}: cannot stat '${e.args[0]}': No such file or directory`)
  if (name === 'cp' && isDir(e.fs, src) && !e.flags.includes('r')) return e.err(`cp: -r not specified; omitting directory '${e.args[0]}'`)
  if (isDir(e.fs, dst)) dst = `${dst}/${baseOf(src)}`
  if (dst === src) return e.err(`${name}: '${e.args[0]}' and '${e.args[1]}' are the same file`)
  if (dst.startsWith(src + '/')) return e.err(`${name}: cannot ${name === 'cp' ? 'copy' : 'move'} '${e.args[0]}' to a subdirectory of itself, '${e.args[1]}'`)
  if (!isDir(e.fs, parentOf(dst))) return e.err(`${name}: cannot ${name === 'cp' ? 'create regular file' : 'move'} '${e.args[1]}': No such file or directory`)
  const next = { ...e.fs }
  for (const [k, v] of Object.entries(e.fs)) {
    if (k === src || k.startsWith(src + '/')) {
      next[dst + k.slice(src.length)] = v
      if (name === 'mv') delete next[k]
    }
  }
  e.fs = next
}

/* ---------- 入力の解析と実行 ---------- */

// 空白で区切り、引用符（"" または ''）の中は1つの引数にする
export function tokenize(input: string): string[] {
  return [...input.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3])
}

export type Result = { state: TermState; out: Line[]; clear?: boolean; error?: boolean }

// 「|」で区切る（引用符 "" '' の中の | は区切りにしない）
export function splitPipes(input: string): string[] {
  const parts: string[] = ['']
  let quote = ''
  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = ''
    } else if (ch === '"' || ch === "'") quote = ch
    else if (ch === '|') {
      parts.push('')
      continue
    }
    parts[parts.length - 1] += ch
  }
  return parts
}

// 入力1行を実行する。「|」があれば、左のコマンドの出力を右のコマンドの入力に渡していく
export function exec(state: TermState, input: string): Result {
  if (!input.trim()) return { state, out: [] }
  const stages = splitPipes(input)
  if (stages.length === 1) return runStage(state, input, null, false)
  if (stages.some((x) => !x.trim())) return { state, out: [{ kind: 'err', text: "bash: syntax error near unexpected token `|'" }], error: true }

  let st = state
  let stdin: string[] | null = null
  const side: Line[] = [] // 途中のエラーや解説は、そのまま表示する
  let last: Result = { state, out: [] }
  stages.forEach((cmd, i) => {
    last = runStage(st, cmd, stdin, i < stages.length - 1)
    st = { fs: last.state.fs, cwd: state.cwd } // パイプの途中で cd しても、現在地は変わらない
    stdin = last.out.filter((l) => l.kind === 'out').map((l) => l.text)
    if (i < stages.length - 1) side.push(...last.out.filter((l) => l.kind !== 'out'))
  })
  const l: Result = last
  return { state: st, out: [...side, ...l.out], error: l.error || side.some((x) => x.kind === 'err') }
}

function runStage(state: TermState, input: string, stdin: string[] | null, piped: boolean): Result {
  const out: Line[] = []
  let error = false
  const [cmd, ...rest] = tokenize(input)
  if (!cmd) return { state, out }
  if (cmd === 'clear') return { state, out, clear: true }

  const env: Env = {
    fs: state.fs,
    cwd: state.cwd,
    rest,
    args: rest.filter((a) => !/^-[A-Za-z]+$/.test(a)),
    flags: rest.filter((a) => /^-[A-Za-z]+$/.test(a)).map((a) => a.slice(1)).join(''),
    R: (p) => resolve(state.cwd, p),
    stdin,
    piped,
    say: (text) => out.push({ kind: 'out', text }),
    err(text) {
      error = true
      out.push({ kind: 'err', text })
      const why = EXPLAIN.find(([re]) => re.test(text))
      if (why) out.push({ kind: 'note', text: `💡 ${why[1]}` })
    },
  }

  const run = Object.hasOwn(commands, cmd) ? commands[cmd] : null
  if (run) run(env)
  else {
    env.err(`bash: ${cmd}: command not found`)
    const s = suggest(cmd)
    if (s) out.push({ kind: 'note', text: `💡 もしかして：${s}` })
  }
  return { state: { fs: env.fs, cwd: env.cwd }, out, error }
}