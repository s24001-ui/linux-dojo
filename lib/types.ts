// DBから取り出すデータの型（サーバー・クライアント共通。関数は含めない）
import type { Cond, FsSpec } from './condition'

export type LessonRow = { id: number; code: string; title: string; sort_order: number; category: string }
export type StepRow = { step_number: number; body: string; hint: string; clear_condition: Cond; setup_data: (FsSpec & { cwd?: string }) | null }
export type QuizRow = { id: number; command_tag: string; body: string; choices: string[]; correct_index: number; explanation: string | null }

type Base = { id: number; command_tag: string; title: string; body: string }
export type PracticalRow = Base & { lessonCode: string; setup: { fs: FsSpec; cwd?: string; checks: Cond[] } }
export type RepairRow = Base & { cleared: boolean; setup: { fs: FsSpec; cwd?: string; error: { cmd: string; msg: string }; hints: string[]; checks: Cond[] } }
export type ScenarioRow = Base & { cleared: boolean; setup: { summary: string; commands: string; fs: FsSpec; cwd?: string; goals: (Cond & { label: string; hints: string[] })[]; checks: Cond[] } }
