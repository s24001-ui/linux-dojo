// クリア条件（DBの JSON）を判定する。レッスンのステップ・実技テスト・エラー修復・シナリオで共通。
// パスは「ホームからの相対パス」で書く（~/xxx や /絶対パスも可）。書かれた条件は すべて満たしたとき成功。
import { Fs, HOME, isDir, isFile, exists, getMode, gitSnapshot } from './terminal'

export type Cond = {
  label?: string // 不合格のとき「不足している点」として表示する文
  cwd?: string // 現在地がここであること
  dirs?: string[] // これらのフォルダがあること
  files?: string[] // これらのファイルがあること
  absent?: string[] // これらが存在しないこと
  modes?: Record<string, string> // 権限がこの8進数どおりであること（例: { "run.sh": "755" }）
  userPerms?: Record<string, string> // 所有者（左の3文字）にこの権限があること。r・w・x の組み合わせ（例: { "run.sh": "x" }）
  commands?: string[] // 入力したコマンド履歴の中に、この正規表現に合うものがあること
  git?: GitCond // Git の状態（コミットできたか、ブランチ、リモートなど）
  tab?: { completed?: boolean; listed?: boolean } // commands に合う入力のとき Tab 補完を使っていたこと（completed=補完した / listed=候補一覧を出した）。commands と一緒に書く
}
// 1回の入力（Enter まで）で Tab 補完を使ったか
export type TabUse = { completed: boolean; listed: boolean }
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
export type FsSpec = { dirs?: string[]; files?: Record<string, string>; modes?: Record<string, string> } // modes … 最初の権限（例: { "secret.txt": "000" }）
export type Ctx = { fs: Fs; cwd: string; log: string[]; tabLog?: TabUse[] } // tabLog … log と同じ順番で、各入力で Tab を使ったか（レッスン画面だけが渡す）

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

// 「Tab を使って打った、その入力」が履歴にあるか（commands に合う入力の、Tab の使用記録を見る）
function tabOk(c: Cond, x: Ctx): boolean {
  if (c.tab === undefined) return true
  const res = (c.commands ?? []).map((re) => new RegExp(re))
  return x.log.some((l, i) => {
    const used = x.tabLog?.[i]
    return res.every((r) => r.test(l.trim())) && (!c.tab?.completed || used?.completed === true) && (!c.tab?.listed || used?.listed === true)
  })
}

export function passes(c: Cond, x: Ctx): boolean {
  return (
    (c.git === undefined || gitOk(c.git, x)) &&
    tabOk(c, x) &&
    (c.cwd === undefined || x.cwd === toAbs(c.cwd)) &&
    (c.dirs ?? []).every((p) => isDir(x.fs, toAbs(p))) &&
    (c.files ?? []).every((p) => isFile(x.fs, toAbs(p))) &&
    (c.absent ?? []).every((p) => !exists(x.fs, toAbs(p))) &&
    Object.entries(c.modes ?? {}).every(([p, o]) => exists(x.fs, toAbs(p)) && getMode(x.fs, toAbs(p)) === parseInt(o, 8)) &&
    Object.entries(c.userPerms ?? {}).every(([p, perms]) => exists(x.fs, toAbs(p)) && [...perms].every((ch) => ((getMode(x.fs, toAbs(p)) >> 6) & ({ r: 4, w: 2, x: 1 } as Record<string, number>)[ch]) !== 0)) &&
    (c.commands ?? []).every((re) => x.log.some((l) => new RegExp(re).test(l.trim())))
  )
}
export const allPass = (cs: Cond[], x: Ctx) => cs.every((c) => passes(c, x))
export const failedLabels = (cs: Cond[], x: Ctx) => cs.filter((c) => !passes(c, x)).map((c) => c.label ?? '条件を満たしていません')