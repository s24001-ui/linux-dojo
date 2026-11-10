// クリア条件（DBの JSON）を判定する。レッスンのステップ・実技テスト・エラー修復・シナリオで共通。
// パスは「ホームからの相対パス」で書く（~/xxx や /絶対パスも可）。書かれた条件は すべて満たしたとき成功。
import { Fs, HOME, isDir, isFile, exists } from './terminal'

export type Cond = {
  label?: string // 不合格のとき「不足している点」として表示する文
  cwd?: string // 現在地がここであること
  dirs?: string[] // これらのフォルダがあること
  files?: string[] // これらのファイルがあること
  absent?: string[] // これらが存在しないこと
  commands?: string[] // 入力したコマンド履歴の中に、この正規表現に合うものがあること
}
export type FsSpec = { dirs?: string[]; files?: Record<string, string> }
export type Ctx = { fs: Fs; cwd: string; log: string[] }

export const toAbs = (p: string) => (p === '~' ? HOME : p.startsWith('~/') ? HOME + p.slice(1) : p.startsWith('/') ? p : `${HOME}/${p}`)

export function passes(c: Cond, x: Ctx): boolean {
  return (
    (c.cwd === undefined || x.cwd === toAbs(c.cwd)) &&
    (c.dirs ?? []).every((p) => isDir(x.fs, toAbs(p))) &&
    (c.files ?? []).every((p) => isFile(x.fs, toAbs(p))) &&
    (c.absent ?? []).every((p) => !exists(x.fs, toAbs(p))) &&
    (c.commands ?? []).every((re) => x.log.some((l) => new RegExp(re).test(l.trim())))
  )
}
export const allPass = (cs: Cond[], x: Ctx) => cs.every((c) => passes(c, x))
export const failedLabels = (cs: Cond[], x: Ctx) => cs.filter((c) => !passes(c, x)).map((c) => c.label ?? '条件を満たしていません')
