// DBからの読み出し（サーバー専用）。テーブルは supabase/schema.sql を参照。
import { connection } from 'next/server'
import { createClient } from './supabase-server'
import type { LessonRow, PracticalRow, QuizRow, RepairRow, ScenarioRow, StepRow } from './types'

// ログイン中のユーザー個別のデータを読むので、毎回リクエストのたびに実行する。
// Supabase の認証は、ログインの有効期限の確認に Date.now() を使う。これを事前描画に含めないため、
// connection() で「ここから先はリクエスト時に実行」と宣言する（Next.js の事前描画エラー対策）。
async function client() {
  await connection()
  return createClient()
}

type Q = { id: number; command_tag: string; title: string | null; body: string; setup_data: never; lessons?: { code: string } | null }

export async function getLessons(): Promise<LessonRow[]> {
  const sb = await client()
  const { data } = await sb.from('lessons').select('id, code, title, sort_order, category').order('sort_order')
  return data ?? []
}

// 自分のクリア済みレッスン（コード）と、確認テストの最高点
export async function getProgress() {
  const sb = await client()
  const [p, r] = await Promise.all([
    sb.from('lesson_progress').select('lessons(code)'),
    sb.from('test_results').select('score, lessons(code)').eq('test_type', 'quiz'),
  ])
  const cleared = new Set<string>()
  for (const row of (p.data ?? []) as unknown as { lessons: { code: string } | null }[]) if (row.lessons) cleared.add(row.lessons.code)
  const best: Record<string, number> = {}
  for (const row of (r.data ?? []) as unknown as { score: number; lessons: { code: string } | null }[]) {
    const c = row.lessons?.code
    if (c) best[c] = Math.max(best[c] ?? 0, row.score)
  }
  return { cleared, best }
}

export async function getLesson(code: string): Promise<{ lesson: LessonRow; steps: StepRow[] } | null> {
  const sb = await client()
  const { data: lesson } = await sb.from('lessons').select('id, code, title, sort_order, category').eq('code', code).maybeSingle()
  if (!lesson) return null
  const { data: steps } = await sb.from('lesson_steps').select('step_number, body, hint, clear_condition, setup_data').eq('lesson_id', lesson.id).order('step_number')
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

async function listByType(type: 'repair' | 'scenario') {
  const sb = await client()
  const { data } = await sb.from('questions').select('id, command_tag, title, body, setup_data').eq('question_type', type).order('id')
  const rows = (data ?? []) as unknown as Q[]
  const done = await correctIds(rows.map((r) => r.id))
  return rows.map((q) => ({ id: q.id, command_tag: q.command_tag, title: q.title ?? '', body: q.body, cleared: done.has(q.id), setup: q.setup_data }))
}
export const getRepairs = () => listByType('repair') as unknown as Promise<RepairRow[]>
export const getScenarios = () => listByType('scenario') as unknown as Promise<ScenarioRow[]>

export async function getRepair(id: number) {
  return (await getRepairs()).find((r) => r.id === id) ?? null
}
export async function getScenario(id: number) {
  return (await getScenarios()).find((s) => s.id === id) ?? null
}

export async function getMe() {
  const sb = await client()
  const { data } = await sb.from('users').select('name, email').maybeSingle()
  return data
}
