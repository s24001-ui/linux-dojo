'use server'

// 学習の記録をDBに保存する（Server Action）。ログイン中ユーザーの権限で実行され、RLS で本人の行にだけ書ける。
import { createClient } from '@/lib/supabase-server'

// Supabase は失敗しても例外を投げず { error } を返すので、ここで確認して例外にする
function check(error: { message: string } | null, what: string) {
  if (error) throw new Error(`${what}に失敗しました: ${error.message}`)
}

async function me() {
  const sb = await createClient()
  const { data: u, error } = await sb.from('users').select('id').maybeSingle() // RLS により、自分の行だけが返る
  check(error, 'ユーザー情報の取得')
  if (!u) throw new Error('ユーザーが登録されていません。ログインし直してください')
  return { sb, userId: u.id as number }
}

// 確認テスト：1問答えるたびに回答履歴へ（正誤はDBの正解番号で判定する）
export async function recordQuizAnswer(questionId: number, selectedIndex: number) {
  const { sb, userId } = await me()
  const { data: q, error: qe } = await sb.from('questions').select('correct_index').eq('id', questionId).single()
  check(qe, '問題の取得')
  const { error } = await sb.from('answer_logs').insert({ user_id: userId, question_id: questionId, selected_index: selectedIndex, is_correct: q?.correct_index === selectedIndex })
  check(error, '回答の保存')
}

// 確認テスト：最後の問題のあとに、1回ぶんの結果を保存
export async function saveQuizResult(lessonCode: string, score: number, total: number) {
  const { sb, userId } = await me()
  const { data: l, error: le } = await sb.from('lessons').select('id').eq('code', lessonCode).single()
  check(le, 'レッスンの取得')
  const { error } = await sb.from('test_results').insert({ user_id: userId, lesson_id: l?.id ?? null, test_type: 'quiz', score, total })
  check(error, 'テスト結果の保存')
}

// レッスン：全ステップをクリアしたときだけ登録（途中経過・ヒントは保存しない）
export async function completeLesson(lessonCode: string) {
  const { sb, userId } = await me()
  const { data: l, error: le } = await sb.from('lessons').select('id').eq('code', lessonCode).single()
  check(le, 'レッスンの取得')
  if (!l) return
  const { error } = await sb.from('lesson_progress').upsert({ user_id: userId, lesson_id: l.id, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' })
  check(error, 'レッスンの記録')
}

// 実技テスト・エラー修復・シナリオ：結果と回答履歴を保存
export async function saveAttempt(questionId: number, type: 'practical' | 'repair' | 'scenario', passed: boolean) {
  const { sb, userId } = await me()
  const { data: q, error: qe } = await sb.from('questions').select('lesson_id').eq('id', questionId).single()
  check(qe, '問題の取得')
  const { error: e1 } = await sb.from('test_results').insert({ user_id: userId, lesson_id: q?.lesson_id ?? null, test_type: type, score: passed ? 1 : 0, total: 1 })
  check(e1, '結果の保存')
  const { error: e2 } = await sb.from('answer_logs').insert({ user_id: userId, question_id: questionId, is_correct: passed })
  check(e2, '回答履歴の保存')
}