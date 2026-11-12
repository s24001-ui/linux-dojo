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
  [/not a git repository/, 'ここは git のリポジトリではありません。git init でリポジトリを作るか、リポジトリのあるフォルダへ cd で移動しましょう。'],
  [/pathspec .* did not match/, '指定した名前のファイルがありません。ls で名前を確認しましょう。'],
  [/Nothing specified, nothing added|Maybe you wanted to say/, '追加するファイル名を指定してください。すべて追加するなら git add . です。'],
  [/nothing (added )?to commit|no changes added to commit/, 'コミットできる変更がありません。ファイルを作ったり編集したあと、git add でコミットに入れるファイルを選びましょう。'],
  [/Aborting commit|requires a value/, 'コミットにはメッセージが必要です。git commit -m "メッセージ" のように書きます。'],
  [/is not a git command/, 'git のあとのコマンド名を確認しましょう（init / status / add / commit / log / diff）。'],
  [/does not have any commits yet/, 'まだコミットがありません。git add のあと git commit で、最初の記録を作りましょう。'],
  [/not supported in this practice terminal/, 'この練習用ターミナルでは、まだ使えないコマンドです。'],
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
}

const commands: Record<string, (e: Env) => void> = {
  pwd: (e) => e.say(e.cwd),

  echo(e) {
    const i = e.rest.findIndex((a) => a === '>' || a === '>>')
    if (i < 0) return e.say(e.rest.join(' '))
    const append = e.rest[i] === '>>'
    const target = e.rest[i + 1]
    if (!target) return e.err('bash: syntax error near unexpected token `newline\'')
    const t = e.R(target)
    if (isDir(e.fs, t)) return e.err(`bash: ${target}: Is a directory`)
    if (!isDir(e.fs, parentOf(t))) return e.err(`bash: ${target}: No such file or directory`)
    let old = append && isFile(e.fs, t) ? (e.fs[t] as string) : ''
    if (old && !old.endsWith('\n')) old += '\n'
    e.fs = { ...e.fs, [t]: old + e.rest.slice(0, i).join(' ') + '\n' }
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
    } else if (names.length) e.say(names.join('  '))
  },

  cd(e) {
    const arg = e.args[0]
    const t = arg ? e.R(arg) : HOME
    if (!exists(e.fs, t)) e.err(`bash: cd: ${arg}: No such file or directory`)
    else if (isFile(e.fs, t)) e.err(`bash: cd: ${arg}: Not a directory`)
    else e.cwd = t
  },

  cat(e) {
    if (!e.args.length) return e.err('cat: missing file operand')
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

  cp: (e) => copyMove(e, 'cp'),
  mv: (e) => copyMove(e, 'mv'),

  git: (e) => gitCommand(e),
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

/* ---------- git（疑似） ----------
   リポジトリの情報は、疑似ファイルシステムの .git フォルダの中に「文字列のファイル」として置く。
     .git/HEAD    … 今のブランチ（"ref: refs/heads/main"）
     .git/index   … ステージ（git add 済み）のファイル一覧。JSON：{ "相対パス": "中身" }
     .git/commits … コミットの履歴。JSON：[{ id, msg, date, tree }]（tree は、そのときの全ファイル）
   ブラウザの中だけで動く。本物の git や通信は使わない。
   対応：init / status / add / commit / log / diff / branch / switch / merge / remote / push / pull / clone（すべて疑似動作） */

type Tree = Record<string, string> // リポジトリのルートからの相対パス → ファイルの中身
type Commit = { id: string; msg: string; date: string; tree: Tree; parents?: string[] }
type Op = { t: ' ' | '+' | '-'; s: string }

const BLANK = ' ' // 空行（空文字だと高さがなくなるので、空白を1つ入れる）
const GIT_SUBS = ['init', 'status', 'add', 'commit', 'log', 'diff', 'branch', 'checkout', 'switch', 'merge', 'remote', 'push', 'pull', 'clone']
const GIT_LATER = ['fetch', 'restore', 'reset', 'stash', 'rm', 'mv', 'tag', 'show']

// 文字列から16進のハッシュを作る（コミットIDなどに使う。本物のSHA-1ではない）
function hash(s: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
}
const sha = (s: string) => [0, 1, 2, 3, 4].map((i) => hash(s, i)).join('').slice(0, 40)
const blob = (s: string) => hash(s).slice(0, 7)

function gitDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  const off = -d.getTimezoneOffset()
  const a = Math.abs(off)
  const w = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]
  return `${w} ${m} ${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${d.getFullYear()} ${off >= 0 ? '+' : '-'}${p(Math.floor(a / 60))}${p(a % 60)}`
}

const base = (root: string) => (root === '/' ? '' : root)
const gitFile = (root: string, name: string) => `${base(root)}/.git/${name}`

// いまいる場所から上へたどって、.git があるフォルダ（リポジトリのルート）を探す
function gitRoot(fs: Fs, cwd: string): string | null {
  for (let p = cwd; ; p = parentOf(p)) {
    if (isDir(fs, `${base(p)}/.git`)) return p
    if (p === '/') return null
  }
}

function readJson<T>(fs: Fs, path: string, fallback: T): T {
  try {
    const v = fs[path]
    return typeof v === 'string' ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
const readIndex = (fs: Fs, root: string) => readJson<Tree>(fs, gitFile(root, 'index'), {})
const readCommits = (fs: Fs, root: string) => readJson<Commit[]>(fs, gitFile(root, 'commits'), [])
type BranchMap = Record<string, string | null>
const readBranches = (fs: Fs, root: string): BranchMap => {
  const saved = readJson<BranchMap | null>(fs, gitFile(root, 'branches'), null)
  if (saved) return saved
  const commits = readCommits(fs, root)
  return { main: commits.at(-1)?.id ?? null }
}
const currentBranch = (fs: Fs, root: string) => {
  const head = fs[gitFile(root, 'HEAD')]
  const match = typeof head === 'string' ? head.match(/refs\/heads\/([^\s]+)/) : null
  return match?.[1] ?? 'main'
}
const branchCommits = (fs: Fs, root: string, branch = currentBranch(fs, root)): Commit[] => {
  const all = readCommits(fs, root)
  const refs = readBranches(fs, root)
  let id = refs[branch] ?? null
  const found: Commit[] = []
  const seen = new Set<string>()
  while (id && !seen.has(id)) {
    seen.add(id)
    const commit = all.find((c) => c.id === id)
    if (!commit) break
    found.push(commit)
    id = commit.parents ? (commit.parents[0] ?? null) : (all[all.indexOf(commit) - 1]?.id ?? null)
  }
  return found.reverse()
}
const headCommit = (fs: Fs, root: string, branch = currentBranch(fs, root)) => {
  const commits = branchCommits(fs, root, branch)
  return commits.at(-1)
}
const remoteNameFromUrl = (url: string) => {
  const part = url.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? 'repository'
  return part.replace(/\.git$/i, '') || 'repository'
}
const remoteStorePath = (name: string) => `${HOME}/.sim-remotes/${name}.json`
type RemoteSnapshot = { defaultBranch: string; branches: BranchMap; commits: Commit[]; files?: Tree; pullUpdate?: { branch: string; commit: Commit; baseTree?: Tree } }

// 作業フォルダにあるファイル（.git の中は除く）
function workTree(fs: Fs, root: string): Tree {
  const t: Tree = {}
  for (const [k, v] of Object.entries(fs)) {
    if (typeof v === 'string' && k.startsWith(base(root) + '/') && !k.startsWith(`${base(root)}/.git/`)) t[k.slice(base(root).length + 1)] = v
  }
  return t
}

// cwd から見た相対パス（git status の表示用）
function relTo(cwd: string, abs: string): string {
  const a = cwd.split('/').filter(Boolean)
  const b = abs.split('/').filter(Boolean)
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return [...Array<string>(a.length - i).fill('..'), ...b.slice(i)].join('/') || '.'
}

const toLines = (s: string) => (s === '' ? [] : s.replace(/\n$/, '').split('\n'))

// 行ごとの差分（最長共通部分列）
function lineDiff(a: string[], b: string[]): Op[] {
  const n = a.length
  const m = b.length
  const L = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const ops: Op[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ t: ' ', s: a[i] })
      i++
      j++
    } else if (L[i + 1][j] >= L[i][j + 1]) ops.push({ t: '-', s: a[i++] })
    else ops.push({ t: '+', s: b[j++] })
  }
  while (i < n) ops.push({ t: '-', s: a[i++] })
  while (j < m) ops.push({ t: '+', s: b[j++] })
  return ops
}

// 変更のある範囲（前後3行つき）を、diff の「@@ ... @@」の形にする
function hunk(ops: Op[]): string[] {
  const hit = ops.map((o, k) => (o.t === ' ' ? -1 : k)).filter((k) => k >= 0)
  if (!hit.length) return []
  const from = Math.max(0, hit[0] - 3)
  const to = Math.min(ops.length, hit[hit.length - 1] + 4)
  const part = ops.slice(from, to)
  const before = ops.slice(0, from)
  const aStart = before.filter((o) => o.t !== '+').length + 1
  const bStart = before.filter((o) => o.t !== '-').length + 1
  const aLen = part.filter((o) => o.t !== '+').length
  const bLen = part.filter((o) => o.t !== '-').length
  const range = (start: number, len: number) => (len === 1 ? `${start}` : `${len === 0 ? start - 1 : start},${len}`)
  return [`@@ -${range(aStart, aLen)} +${range(bStart, bLen)} @@`, ...part.map((o) => o.t + o.s)]
}

// 2つの状態（ファイルの一覧）の違いを、git diff の形で出す
function diffTrees(a: Tree, b: Tree): string[] {
  const out: string[] = []
  for (const p of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
    const x = a[p]
    const y = b[p]
    if (x === y) continue
    out.push(`diff --git a/${p} b/${p}`)
    if (x === undefined) out.push('new file mode 100644', `index 0000000..${blob(y ?? '')}`)
    else if (y === undefined) out.push('deleted file mode 100644', `index ${blob(x)}..0000000`)
    else out.push(`index ${blob(x)}..${blob(y)} 100644`)
    out.push(x === undefined ? '--- /dev/null' : `--- a/${p}`, y === undefined ? '+++ /dev/null' : `+++ b/${p}`)
    out.push(...hunk(lineDiff(toLines(x ?? ''), toLines(y ?? ''))))
  }
  return out
}

// 最後のコミット・ステージ・作業フォルダの3つを比べる
function compare(head: Tree, index: Tree, work: Tree) {
  const staged: [string, string][] = []
  for (const p of [...new Set([...Object.keys(head), ...Object.keys(index)])].sort()) {
    if (head[p] === index[p]) continue
    staged.push([head[p] === undefined ? 'new file' : index[p] === undefined ? 'deleted' : 'modified', p])
  }
  const unstaged: [string, string][] = []
  for (const p of Object.keys(index).sort()) {
    if (work[p] === undefined) unstaged.push(['deleted', p])
    else if (work[p] !== index[p]) unstaged.push(['modified', p])
  }
  const untracked = Object.keys(work).filter((p) => !(p in index)).sort()
  return { staged, unstaged, untracked }
}

// git status の表示
function statusLines(fs: Fs, root: string, cwd: string, index = readIndex(fs, root)): string[] {
  const commits = branchCommits(fs, root)
  const branch = currentBranch(fs, root)
  const st = compare(commits.at(-1)?.tree ?? {}, index, workTree(fs, root))
  const show = (rel: string) => relTo(cwd, `${base(root)}/${rel}`)
  const out = [`On branch ${branch}`]
  const tracking = readJson<Record<string, string>>(fs, gitFile(root, 'tracking'), {})
  if (tracking[branch]) out.push(`Your branch is up to date with '${tracking[branch]}'.`)
  if (!commits.length) out.push(BLANK, 'No commits yet')
  if (st.staged.length) {
    out.push(BLANK, 'Changes to be committed:', commits.length ? '  (use "git restore --staged <file>..." to unstage)' : '  (use "git rm --cached <file>..." to unstage)')
    for (const [label, p] of st.staged) out.push(`\t${(label + ':').padEnd(12)}${show(p)}`)
  }
  if (st.unstaged.length) {
    out.push(BLANK, 'Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)')
    for (const [label, p] of st.unstaged) out.push(`\t${(label + ':').padEnd(12)}${show(p)}`)
  }
  if (st.untracked.length) {
    out.push(BLANK, 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)')
    const names = new Set<string>()
    for (const p of st.untracked) {
      const top = p.split('/')[0]
      // 追跡中のファイルがないフォルダは、「フォルダ名/」とまとめて表示する
      if (p.includes('/') && !Object.keys(index).some((k) => k.startsWith(top + '/'))) names.add(show(top) + '/')
      else names.add(show(p))
    }
    for (const n of names) out.push(`\t${n}`)
  }
  if (!st.staged.length && !st.unstaged.length && !st.untracked.length) {
    if (commits.length) out.push('nothing to commit, working tree clean')
    else out.push(BLANK, 'nothing to commit (create/copy files and use "git add" to track)')
  } else if (!st.staged.length) {
    out.push(BLANK, st.unstaged.length ? 'no changes added to commit (use "git add" and/or "git commit -a")' : 'nothing added to commit but untracked files present (use "git add" to track)')
  }
  return out
}

function gitInit(e: Env) {
  const target = e.rest.slice(1).find((a) => !a.startsWith('-'))
  const dir = target ? e.R(target) : e.cwd
  if (target && isFile(e.fs, dir)) return e.err(`fatal: cannot mkdir ${target}: File exists`)
  const next = { ...e.fs }
  for (let p = dir; !exists(next, p); p = parentOf(p)) next[p] = null
  if (isDir(next, `${base(dir)}/.git`)) {
    e.say(`Reinitialized existing Git repository in ${base(dir)}/.git/`)
    e.fs = next
    return
  }
  next[`${base(dir)}/.git`] = null
  next[gitFile(dir, 'HEAD')] = `ref: refs/heads/main\n`
  next[gitFile(dir, 'index')] = '{}'
  next[gitFile(dir, 'commits')] = '[]'
  next[gitFile(dir, 'branches')] = JSON.stringify({ main: null })
  e.fs = next
  e.say(`Initialized empty Git repository in ${base(dir)}/.git/`)
}

function gitAdd(e: Env, root: string) {
  const a = e.rest.slice(1)
  const all = a.includes('-A') || a.includes('--all')
  const targets = a.filter((x) => !x.startsWith('-'))
  if (!targets.length && !all) {
    e.err('Nothing specified, nothing added.')
    e.say("hint: Maybe you wanted to say 'git add .'?")
    return
  }
  const index = { ...readIndex(e.fs, root) }
  const work = workTree(e.fs, root)
  const names = new Set([...Object.keys(work), ...Object.keys(index)])
  const picked = new Set<string>()
  for (const t of all ? [base(root) || '/'] : targets) {
    const abs = all ? base(root) : e.R(t)
    const rel = abs === base(root) ? '' : abs.startsWith(base(root) + '/') ? abs.slice(base(root).length + 1) : null
    if (rel === null) return e.err(`fatal: ${t}: '${t}' is outside repository at '${base(root)}'`)
    const hits = [...names].filter((p) => rel === '' || p === rel || p.startsWith(rel + '/'))
    if (!hits.length) return e.err(`fatal: pathspec '${t}' did not match any files`)
    hits.forEach((p) => picked.add(p))
  }
  for (const p of picked) {
    if (work[p] !== undefined) index[p] = work[p]
    else delete index[p] // 消したファイルは「削除」をステージする
  }
  e.fs = { ...e.fs, [gitFile(root, 'index')]: JSON.stringify(index) }
}

function gitCommit(e: Env, root: string) {
  const a = e.rest.slice(1)
  let msg: string | undefined
  let all = false
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '-m' || a[i] === '-am') {
      if (a[i] === '-am') all = true
      if (a[i + 1] === undefined) return e.err("error: switch `m' requires a value")
      msg = a[++i]
    } else if (a[i] === '-a') all = true
  }
  const commits = branchCommits(e.fs, root)
  const allCommits = readCommits(e.fs, root)
  const branch = currentBranch(e.fs, root)
  const head = commits.at(-1)?.tree ?? {}
  const work = workTree(e.fs, root)
  const index = { ...readIndex(e.fs, root) }
  if (all) {
    for (const p of Object.keys(index)) {
      if (work[p] === undefined) delete index[p]
      else index[p] = work[p]
    }
  }
  const changed = [...new Set([...Object.keys(head), ...Object.keys(index)])].filter((p) => head[p] !== index[p]).sort()
  if (!changed.length) {
    const lines = statusLines(e.fs, root, e.cwd, index)
    const last = lines.pop() ?? ''
    lines.forEach((l) => e.say(l))
    return e.err(last)
  }
  if (!msg) return e.err('Aborting commit due to empty commit message.')

  const parent = commits.at(-1)
  const id = sha(JSON.stringify({ parent: parent?.id ?? null, msg, tree: index, time: gitDate() }))
  const commit: Commit = { id, msg, date: gitDate(), tree: index, parents: parent ? [parent.id] : [] }
  const refs = { ...readBranches(e.fs, root), [branch]: id }
  e.fs = { ...e.fs,
    [gitFile(root, 'commits')]: JSON.stringify([...allCommits, commit]),
    [gitFile(root, 'branches')]: JSON.stringify(refs),
    [gitFile(root, 'index')]: JSON.stringify(index)
  }

  let ins = 0
  let del = 0
  for (const p of changed) {
    for (const o of lineDiff(toLines(head[p] ?? ''), toLines(index[p] ?? ''))) {
      if (o.t === '+') ins++
      if (o.t === '-') del++
    }
  }
  const n = changed.length
  e.say(`[${branch}${parent ? '' : ' (root-commit)'} ${id.slice(0, 7)}] ${msg}`)
  e.say(` ${n} file${n > 1 ? 's' : ''} changed` + (!ins && !del ? ', 0 insertions(+), 0 deletions(-)' : '') + (ins ? `, ${ins} insertion${ins > 1 ? 's' : ''}(+)` : '') + (del ? `, ${del} deletion${del > 1 ? 's' : ''}(-)` : ''))
  for (const p of changed) {
    if (head[p] === undefined) e.say(` create mode 100644 ${p}`)
    else if (index[p] === undefined) e.say(` delete mode 100644 ${p}`)
  }
}

function gitLog(e: Env, root: string) {
  const commits = branchCommits(e.fs, root)
  const branch = currentBranch(e.fs, root)
  if (!commits.length) return e.err(`fatal: your current branch '${branch}' does not have any commits yet`)
  const oneline = e.rest.includes('--oneline')
  const tip = `(HEAD -> ${branch})`
  commits
    .map((c, i) => ({ c, latest: i === commits.length - 1 }))
    .reverse()
    .forEach(({ c, latest }) => {
      if (oneline) return e.say(`${c.id.slice(0, 7)} ${latest ? tip + ' ' : ''}${c.msg}`)
      e.say(`commit ${c.id}${latest ? ' ' + tip : ''}`)
      e.say('Author: student <student@example.com>')
      e.say(`Date:   ${c.date}`)
      e.say(BLANK)
      e.say(`    ${c.msg}`)
      e.say(BLANK)
    })
}

function gitDiff(e: Env, root: string) {
  const index = readIndex(e.fs, root)
  if (e.rest.includes('--staged') || e.rest.includes('--cached')) {
    return diffTrees(branchCommits(e.fs, root).at(-1)?.tree ?? {}, index).forEach((l) => e.say(l))
  }
  const work = workTree(e.fs, root)
  const now: Tree = {}
  for (const p of Object.keys(index)) if (work[p] !== undefined) now[p] = work[p]
  diffTrees(index, now).forEach((l) => e.say(l))
}


function checkoutTree(e: Env, root: string, tree: Tree) {
  const next = { ...e.fs }
  for (const p of Object.keys(next)) {
    if (p.startsWith(`${base(root)}/`) && !p.startsWith(`${base(root)}/.git/`) && typeof next[p] === 'string') delete next[p]
  }
  for (const [p, content] of Object.entries(tree)) next[`${base(root)}/${p}`] = content
  next[gitFile(root, 'index')] = JSON.stringify(tree)
  e.fs = next
}

function gitBranch(e: Env, root: string) {
  const args = e.rest.slice(1)
  const refs = readBranches(e.fs, root)
  const current = currentBranch(e.fs, root)
  if (!args.length) {
    Object.keys(refs).sort().forEach((name) => e.say(`${name === current ? '* ' : '  '}${name}`))
    return
  }
  if (args[0] === '-d' || args[0] === '-D') {
    const name = args[1]
    if (!name) return e.err("error: branch name required")
    if (name === current) return e.err(`error: Cannot delete branch '${name}' checked out`)
    if (!(name in refs)) return e.err(`error: branch '${name}' not found`)
    const next = { ...refs }; delete next[name]
    e.fs = { ...e.fs, [gitFile(root, 'branches')]: JSON.stringify(next) }
    return e.say(`Deleted branch ${name}.`)
  }
  const name = args[0]
  if (name.startsWith('-')) return e.err(`error: unknown option '${name}'`)
  if (name in refs) return e.err(`fatal: a branch named '${name}' already exists`)
  refs[name] = refs[current] ?? null
  e.fs = { ...e.fs, [gitFile(root, 'branches')]: JSON.stringify(refs) }
  e.say(`ブランチ '${name}' を作成しました。`)
}

function gitSwitch(e: Env, root: string) {
  const name = e.rest[1]
  if (!name) return e.err('fatal: missing branch name')
  const refs = readBranches(e.fs, root)
  if (!(name in refs)) return e.err(`fatal: invalid reference: ${name}`)
  const status = compare(branchCommits(e.fs, root).at(-1)?.tree ?? {}, readIndex(e.fs, root), workTree(e.fs, root))
  if (status.staged.length || status.unstaged.length || status.untracked.length) return e.err('error: Your local changes would be overwritten by checkout.')
  const commit = headCommit(e.fs, root, name)
  const next = { ...e.fs, [gitFile(root, 'HEAD')]: `ref: refs/heads/${name}\n` }
  e.fs = next
  checkoutTree(e, root, commit?.tree ?? {})
  e.say(`Switched to branch '${name}'`)
}

function gitMerge(e: Env, root: string) {
  const name = e.rest[1]
  if (!name) return e.err('git merge: missing branch name')
  const refs = readBranches(e.fs, root)
  const current = currentBranch(e.fs, root)
  if (!(name in refs)) return e.err(`merge: ${name} - not something we can merge`)
  if (name === current) return e.err('Already up to date.')
  const ours = headCommit(e.fs, root, current)
  const theirs = headCommit(e.fs, root, name)
  if (!theirs) return e.err(`merge: ${name} has no commits`)
  if (ours?.id === theirs.id) return e.say('Already up to date.')
  const all = readCommits(e.fs, root)
  const isAncestor = (ancestor: string | undefined, descendant: Commit | undefined) => {
    if (!ancestor) return true
    let c = descendant
    const seen = new Set<string>()
    while (c && !seen.has(c.id)) {
      if (c.id === ancestor) return true
      seen.add(c.id)
      c = all.find((x) => x.id === c?.parents?.[0]) ?? undefined
    }
    return false
  }
  if (isAncestor(ours?.id, theirs)) {
    refs[current] = theirs.id
    e.fs = { ...e.fs, [gitFile(root, 'branches')]: JSON.stringify(refs) }
    checkoutTree(e, root, theirs.tree)
    return e.say(`Updating ${ours?.id.slice(0, 7) ?? '0000000'}..${theirs.id.slice(0, 7)}\nFast-forward`)
  }
  if (isAncestor(theirs.id, ours)) return e.say('Already up to date.')
  const tree = { ...(ours?.tree ?? {}), ...theirs.tree }
  const index = readIndex(e.fs, root)
  if (Object.keys(index).length) return e.err('error: Your local changes would be overwritten by merge.')
  const id = sha(JSON.stringify({ parents: [ours?.id, theirs.id], tree, msg: `Merge branch '${name}'` }))
  const commit: Commit = { id, msg: `Merge branch '${name}'`, date: gitDate(), tree, parents: [ours?.id, theirs.id].filter(Boolean) as string[] }
  refs[current] = id
  e.fs = { ...e.fs, [gitFile(root, 'commits')]: JSON.stringify([...all, commit]), [gitFile(root, 'branches')]: JSON.stringify(refs) }
  checkoutTree(e, root, tree)
  e.say(`Merge made by the 'ort' strategy.\n ${Object.keys(tree).length} files updated.`)
}

function gitRemote(e: Env, root: string) {
  const args = e.rest.slice(1)
  const remotes = readJson<Record<string, string>>(e.fs, gitFile(root, 'remotes'), {})
  if (args[0] === '-v') {
    Object.entries(remotes).forEach(([name, url]) => {
      e.say(`${name}\t${url} (fetch)`)
      e.say(`${name}\t${url} (push)`)
    })
    return
  }
  if (args[0] === 'add') {
    const [name, url] = args.slice(1)
    if (!name || !url) return e.err('usage: git remote add <name> <url>')
    if (remotes[name]) return e.err(`error: remote ${name} already exists.`)
    remotes[name] = url
    e.fs = { ...e.fs, [gitFile(root, 'remotes')]: JSON.stringify(remotes) }
    return
  }
  if (!args.length) return Object.keys(remotes).forEach((name) => e.say(name))
  e.err(`error: unknown subcommand: ${args[0]}`)
}

function gitPush(e: Env, root: string) {
  const remotes = readJson<Record<string, string>>(e.fs, gitFile(root, 'remotes'), {})
  const remote = e.rest.slice(1).find((x) => !x.startsWith('-'))
  const url = remote ? remotes[remote] : undefined
  if (!remote || !url) return e.err(`fatal: '${remote ?? ''}' does not appear to be a git repository`)
  const branch = e.rest.slice(1).filter((x) => !x.startsWith('-'))[1] ?? currentBranch(e.fs, root)
  const refs = readBranches(e.fs, root)
  const commits = readCommits(e.fs, root)
  const snapshot: RemoteSnapshot = { defaultBranch: branch, branches: refs, commits, files: headCommit(e.fs, root, branch)?.tree ?? workTree(e.fs, root) }
  const store = remoteStorePath(remoteNameFromUrl(url))
  const dirs = { ...e.fs, [`${HOME}/.sim-remotes`]: null, [store]: JSON.stringify(snapshot) }
  if (e.rest.includes('-u')) {
    const tracking = readJson<Record<string, string>>(dirs, gitFile(root, 'tracking'), {})
    dirs[gitFile(root, 'tracking')] = JSON.stringify({ ...tracking, [branch]: `${remote}/${branch}` })
  }
  e.fs = dirs
  if (e.rest.includes('-u')) e.say(`branch '${branch}' set up to track '${remote}/${branch}'.`)
  e.say(`Enumerating objects: ${commits.length}, done.`)
  e.say(`To ${url}\n   ${headCommit(e.fs, root, branch)?.id.slice(0, 7) ?? '0000000'}  ${branch} -> ${branch}`)
}

function gitPull(e: Env, root: string) {
  const remotes = readJson<Record<string, string>>(e.fs, gitFile(root, 'remotes'), {})
  const remote = e.rest.slice(1).find((x) => !x.startsWith('-')) ?? 'origin'
  const url = remotes[remote]
  if (!url) return e.err(`fatal: '${remote}' does not appear to be a git repository`)
  const store = remoteStorePath(remoteNameFromUrl(url))
  const snapshot = readJson<RemoteSnapshot | null>(e.fs, store, null)
  if (!snapshot) return e.err(`fatal: unable to access '${url}': simulated remote repository not found`)
  const branch = e.rest.slice(1).filter((x) => !x.startsWith('-'))[1] ?? currentBranch(e.fs, root)
  let update = snapshot.pullUpdate?.branch === branch ? snapshot.pullUpdate.commit : null
  const currentRemoteHead = snapshot.branches[branch] ?? snapshot.branches[snapshot.defaultBranch]
  if (update && currentRemoteHead && update.parents?.[0] !== currentRemoteHead) {
    const baseCommit = snapshot.commits.find((c) => c.id === currentRemoteHead)
    const mergedTree = { ...(baseCommit?.tree ?? snapshot.files ?? {}) }
    if (snapshot.pullUpdate?.baseTree) {
      // seed に入れた「他の人の変更差分」だけを、push 済みの最新ツリーへ適用する。
      for (const [path, content] of Object.entries(update.tree)) {
        if (snapshot.pullUpdate.baseTree[path] !== content) mergedTree[path] = content
      }
      for (const path of Object.keys(snapshot.pullUpdate.baseTree)) {
        if (!(path in update.tree)) delete mergedTree[path]
      }
    } else {
      Object.assign(mergedTree, update.tree)
    }
    update = { ...update, id: sha(JSON.stringify({ parent: currentRemoteHead, msg: update.msg, tree: mergedTree })), parents: [currentRemoteHead], tree: mergedTree }
  }
  const remoteHead = update?.id ?? currentRemoteHead
  if (!remoteHead) return e.err(`fatal: couldn't find remote ref ${branch}`)
  const localAll = readCommits(e.fs, root)
  const combined = [...localAll]
  for (const c of snapshot.commits) if (!combined.some((x) => x.id === c.id)) combined.push(c)
  if (update && !combined.some((x) => x.id === update.id)) combined.push(update)
  const refs = { ...readBranches(e.fs, root), [branch]: remoteHead }
  e.fs = { ...e.fs, [gitFile(root, 'commits')]: JSON.stringify(combined), [gitFile(root, 'branches')]: JSON.stringify(refs) }
  const commit = combined.find((c) => c.id === remoteHead)
  if (branch === currentBranch(e.fs, root) && commit) checkoutTree(e, root, commit.tree)
  e.say(`From ${url}\n * branch            ${branch} -> FETCH_HEAD\nUpdating local branch '${branch}'.`)
  e.say(update ? `Fast-forward ${update.parents?.[0]?.slice(0, 7) ?? ''}..${update.id.slice(0, 7)}` : 'Already up to date.')
}

function gitClone(e: Env) {
  const url = e.rest[1]
  if (!url) return e.err('usage: git clone <repository> [<directory>]')
  const name = e.rest[2] ?? remoteNameFromUrl(url)
  const dest = e.R(name)
  if (exists(e.fs, dest)) return e.err(`fatal: destination path '${name}' already exists and is not an empty directory.`)
  const store = remoteStorePath(remoteNameFromUrl(url))
  const snapshot = readJson<RemoteSnapshot | null>(e.fs, store, null)
  if (!snapshot) return e.err(`fatal: repository '${url}' not found in the simulated remote area`)
  const branch = snapshot.defaultBranch || 'main'
  const commit = snapshot.commits.find((c) => c.id === snapshot.branches[branch]) ?? snapshot.commits.at(-1)
  const files = commit?.tree ?? snapshot.files ?? {}
  const next = { ...e.fs, [dest]: null, [`${dest}/.git`]: null,
    [`${dest}/.git/HEAD`]: `ref: refs/heads/${branch}\n`,
    [`${dest}/.git/index`]: JSON.stringify(files),
    [`${dest}/.git/commits`]: JSON.stringify(snapshot.commits),
    [`${dest}/.git/branches`]: JSON.stringify(snapshot.branches),
    [`${dest}/.git/remotes`]: JSON.stringify({ origin: url }), [`${dest}/.git/tracking`]: JSON.stringify({ [branch]: `origin/${branch}` }) }
  for (const [path, content] of Object.entries(files)) next[`${dest}/${path}`] = content
  e.fs = next
  e.say(`Cloning into '${name}'...`)
  e.say('Receiving objects: 100% (simulated), done.')
}

function gitCommand(e: Env) {
  const sub = e.rest[0]
  if (!sub) {
    e.say('usage: git <command> [<args>]')
    e.say(BLANK)
    e.say('この練習用ターミナルで使えるコマンド：init status add commit log diff branch switch merge remote push pull clone')
    return
  }
  if (sub === '--version' || sub === 'version') return e.say('git version 2.43.0')
  if (sub === 'config') return
  if (!GIT_SUBS.includes(sub) && !GIT_LATER.includes(sub)) {
    e.err(`git: '${sub}' is not a git command. See 'git --help'.`)
    const near = GIT_SUBS.map((n) => [n, distance(sub, n)] as const).filter(([, d]) => d <= 2).sort((x, y) => x[1] - y[1])[0]
    if (near) e.say(`\nThe most similar command is\n\t${near[0]}`)
    return
  }
  if (sub === 'init') return gitInit(e)
  if (sub === 'clone') return gitClone(e)
  const root = gitRoot(e.fs, e.cwd)
  if (!root) return e.err('fatal: not a git repository (or any of the parent directories): .git')
  if (sub === 'status') return statusLines(e.fs, root, e.cwd).forEach((l) => e.say(l))
  if (sub === 'add') return gitAdd(e, root)
  if (sub === 'commit') return gitCommit(e, root)
  if (sub === 'log') return gitLog(e, root)
  if (sub === 'diff') return gitDiff(e, root)
  if (sub === 'branch') return gitBranch(e, root)
  if (sub === 'switch' || sub === 'checkout') return gitSwitch(e, root)
  if (sub === 'merge') return gitMerge(e, root)
  if (sub === 'remote') return gitRemote(e, root)
  if (sub === 'push') return gitPush(e, root)
  if (sub === 'pull') return gitPull(e, root)
}

/* ---------- 入力の解析と実行 ---------- */

// 空白で区切り、引用符（"" または ''）の中は1つの引数にする
export function tokenize(input: string): string[] {
  return [...input.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3])
}

export type Result = { state: TermState; out: Line[]; clear?: boolean; error?: boolean }

export function exec(state: TermState, input: string): Result {
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