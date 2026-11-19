// クリア条件（DBの JSON）を判定する。レッスンのステップ・実技テスト・エラー修復・シナリオで共通。
// パスは「ホームからの相対パス」で書く（~/xxx や /絶対パスも可）。書かれた条件は すべて満たしたとき成功。
import { Fs, HOME, isDir, isFile, exists, gitSnapshot } from './terminal'

export type Cond = {
  label?: string // 不合格のとき「不足している点」として表示する文
  cwd?: string // 現在地がここであること
  dirs?: string[] // これらのフォルダがあること
  files?: string[] // これらのファイルがあること
  absent?: string[] // これらが存在しないこと
  commands?: string[] // 入力したコマンド履歴の中に、この正規表現に合うものがあること
  git?: GitCond // Git の状態（コミットできたか、ブランチ、リモートなど）
  tab?: { completed?: number; listed?: number } // そのステップで Tab 補完を使った回数が、これ以上（completed=補完できた回数 / listed=候補一覧を出した回数）
}
// Git の状態の条件。書いたものは すべて満たしたとき成功。省略した項目は見ない
export type GitCond = {
  repo?: string // リポジトリのフォルダ（ホームからの相対パス）。省略すると、いまの場所から探す
  branch?: string // いまのブランチがこれ
  branches?: string[] // これらのブランチがある
  commits?: number // いまのブランチのコミット数が、この数以上
  committed?: string[] // いまのブランチの最新コミットに、これらのファイルが入っている
  staged?: string[] // これらが git add 済み（まだコミットしていない）
  clean?: boolean // 作業フォルダがきれい（true）／変更が残っている（false）
  remote?: string // この名前のリモートが登録されている
  tracking?: boolean // 送り先（上流）が設定されている（push -u 済み）
  pushed?: boolean // 最新コミットがリモートに送られている
  branchFiles?: Record<string, string[]> // 指定したブランチの最新コミットに、これらのファイルが入っている
}
export type FsSpec = { dirs?: string[]; files?: Record<string, string> }
export type Ctx = { fs: Fs; cwd: string; log: string[]; tab?: { completed: number; listed: number } } // tab … そのステップで Tab 補完を使った回数（レッスン画面だけが渡す）

export const toAbs = (p: string) => (p === '~' ? HOME : p.startsWith('~/') ? HOME + p.slice(1) : p.startsWith('/') ? p : `${HOME}/${p}`)

function gitOk(g: GitCond, x: Ctx): boolean {
  const s = gitSnapshot(x.fs, x.cwd, g.repo === undefined ? undefined : toAbs(g.repo))
  if (!s) return false
  const has = (list: string[], names: string[]) => names.every((n) => list.includes(n))
  return (
    (g.branch === undefined || s.branch === g.branch) &&
    has(s.branches, g.branches ?? []) &&
    (g.commits === undefined || s.commits >= g.commits) &&
    has(s.committed, g.committed ?? []) &&
    has(s.staged, g.staged ?? []) &&
    (g.clean === undefined || s.clean === g.clean) &&
    (g.remote === undefined || s.remotes.includes(g.remote)) &&
    (g.tracking === undefined || s.tracking === g.tracking) &&
    (g.pushed === undefined || s.pushed === g.pushed) &&
    Object.entries(g.branchFiles ?? {}).every(([b, files]) => has(s.branchFiles[b] ?? [], files))
  )
}

export function passes(c: Cond, x: Ctx): boolean {
  return (
    (c.git === undefined || gitOk(c.git, x)) &&
    (c.tab === undefined || ((x.tab?.completed ?? 0) >= (c.tab.completed ?? 0) && (x.tab?.listed ?? 0) >= (c.tab.listed ?? 0))) &&
    (c.cwd === undefined || x.cwd === toAbs(c.cwd)) &&
    (c.dirs ?? []).every((p) => isDir(x.fs, toAbs(p))) &&
    (c.files ?? []).every((p) => isFile(x.fs, toAbs(p))) &&
    (c.absent ?? []).every((p) => !exists(x.fs, toAbs(p))) &&
    (c.commands ?? []).every((re) => x.log.some((l) => new RegExp(re).test(l.trim())))
  )
}
export const allPass = (cs: Cond[], x: Ctx) => cs.every((c) => passes(c, x))
export const failedLabels = (cs: Cond[], x: Ctx) => cs.filter((c) => !passes(c, x)).map((c) => c.label ?? '条件を満たしていません')