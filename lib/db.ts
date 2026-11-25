// DBからの読み出し（サーバー専用）。テーブルは supabase/schema.sql を参照。
import { connection } from 'next/server'
import { cache } from 'react'
import { createClient } from './supabase-server'
import type { LessonRow, PracticalRow, QuizRow, RepairListRow, RepairRow, ScenarioListRow, ScenarioRow, StepRow } from './types'

// ログイン中のユーザー個別のデータを読むので、毎回リクエストのたびに実行する。
// Supabase の認証は、ログインの有効期限の確認に Date.now() を使う。これを事前描画に含めないため、
// connection() で「ここから先はリクエスト時に実行」と宣言する（Next.js の事前描画エラー対策）。
const client = cache(async () => {
  await connection()
  return createClient()
})

type Q = { id: number; command_tag: string; title: string | null; body: string; setup_data: never; lessons?: { code?: string; sort_order?: number } | null }

export async function getLessons(): Promise<LessonRow[]> {
  const sb = await client()
  const { data } = await sb.from('lessons').select('id, code, title, sort_order, category').order('sort_order')
  return data ?? []
}

// 自分のクリア済みレッスン（コード）と、確認テストの最高点
export async function getLessonOverview() {
  const sb = await client()
  const { data } = await sb
    .from('lessons')
    .select('id, code, title, sort_order, category, lesson_progress!left(id), test_results!left(score)')
    .eq('test_results.test_type', 'quiz')
    .order('sort_order')
  const rows = (data ?? []) as unknown as (LessonRow & {
    lesson_progress?: { id: number }[] | null
    test_results?: { score: number }[] | null
  })[]
  const cleared = new Set<string>()
  const best: Record<string, number> = {}
  const lessons = rows.map((row) => {
    if (row.lesson_progress?.length) cleared.add(row.code)
    for (const result of row.test_results ?? []) best[row.code] = Math.max(best[row.code] ?? 0, result.score)
    return {
      id: row.id,
      code: row.code,
      title: row.title,
      sort_order: row.sort_order,
      category: row.category,
    }
  })
  return { lessons, cleared, best }
}

export async function getLesson(code: string): Promise<{ lesson: LessonRow; steps: StepRow[] } | null> {
  const sb = await client()
  const { data } = await sb
    .from('lessons')
    .select('id, code, title, sort_order, category, lesson_steps(step_number, body, hint, clear_condition, setup_data)')
    .eq('code', code)
    .order('step_number', { referencedTable: 'lesson_steps' })
    .maybeSingle()
  if (!data) return null
  const { lesson_steps: steps, ...lesson } = data
  return { lesson, steps: steps ?? [] }
}

// 確認テストの問題（レッスンごと）。10問の抽出は画面側で行う
export async function getQuizQuestions(code: string): Promise<QuizRow[]> {
  const sb = await client()
  const { data } = await sb.from('questions').select('id, command_tag, body, choices, correct_index, explanation, lessons!inner(code)').eq('question_type', 'quiz').eq('lessons.code', code).order('id')
  return (data ?? []) as unknown as QuizRow[]
}

export async function getQuestionsByIds(ids: number[]): Promise<QuizRow[]> {
  if (!ids.length) return []
  const sb = await client()
  const { data } = await sb.from('questions').select('id, command_tag, body, choices, correct_index, explanation').in('id', ids)
  return (data ?? []) as QuizRow[]
}

export async function getPractical(code: string): Promise<PracticalRow | null> {
  const sb = await client()
  const { data } = await sb.from('questions').select('id, command_tag, title, body, setup_data, lessons!inner(code)').eq('question_type', 'practical').eq('lessons.code', code).order('id').limit(1).maybeSingle()
  if (!data) return null
  const q = data as unknown as Q
  return { id: q.id, command_tag: q.command_tag, title: q.title ?? '', body: q.body, lessonCode: code, setup: q.setup_data }
}

// 自分が正解したことのある問題ID（修復・シナリオの「クリア済み」判定）
async function correctIds(ids: number[]) {
  if (!ids.length) return new Set<number>()
  const sb = await client()
  const { data } = await sb.from('answer_logs').select('question_id').eq('is_correct', true).in('question_id', ids)
  return new Set((data ?? []).map((r) => r.question_id as number))
}

async function getById(id: number, type: 'repair' | 'scenario') {
  const sb = await client()
  const [result, done] = await Promise.all([
    sb.from('questions').select('id, command_tag, title, body, setup_data').eq('question_type', type).eq('id', id).maybeSingle(),
    correctIds([id]),
  ])
  const q = result.data as unknown as Q | null
  if (!q) return null
  return { id: q.id, command_tag: q.command_tag, title: q.title ?? '', body: q.body, cleared: done.has(q.id), setup: q.setup_data }
}

export async function getRepairs(): Promise<RepairListRow[]> {
  const sb = await client()
  const { data } = await sb
    .from('questions')
    .select('id, command_tag, title, body, lessons(sort_order), answer_logs!left(is_correct)')
    .eq('question_type', 'repair')
    .eq('answer_logs.is_correct', true)
    .order('id')
  const rows = (data ?? []) as unknown as {
    id: number
    command_tag: string
    title: string | null
    body: string
    lessons: { sort_order?: number } | null
    answer_logs?: { is_correct: boolean }[] | null
  }[]
  rows.sort((a, b) => (a.lessons?.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.lessons?.sort_order ?? Number.MAX_SAFE_INTEGER) || a.id - b.id)
  return rows.map((q) => ({
    id: q.id,
    command_tag: q.command_tag,
    title: q.title ?? '',
    body: q.body,
    cleared: Boolean(q.answer_logs?.length),
  }))
}

export async function getScenarios(): Promise<ScenarioListRow[]> {
  const sb = await client()
  const { data } = await sb
    .from('questions')
    .select('id, command_tag, title, body, summary:setup_data->>summary, commands:setup_data->>commands, answer_logs!left(is_correct)')
    .eq('question_type', 'scenario')
    .eq('answer_logs.is_correct', true)
    .order('id')
  const rows = (data ?? []) as unknown as {
    id: number
    command_tag: string
    title: string | null
    body: string
    summary: string
    commands: string
    answer_logs?: { is_correct: boolean }[] | null
  }[]
  return rows.map((q) => ({
    id: q.id,
    command_tag: q.command_tag,
    title: q.title ?? '',
    body: q.body,
    cleared: Boolean(q.answer_logs?.length),
    setup: { summary: q.summary, commands: q.commands },
  }))
}

export async function getRepair(id: number): Promise<RepairRow | null> {
  return await getById(id, 'repair') as RepairRow | null
}
export async function getScenario(id: number): Promise<ScenarioRow | null> {
  return await getById(id, 'scenario') as ScenarioRow | null
}

export async function getMe() {
  const sb = await client()
  const { data } = await sb.from('users').select('name, email').maybeSingle()
  return data
}
