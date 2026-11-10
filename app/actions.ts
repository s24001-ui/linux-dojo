'use server'

// 学習の記録をDBに保存する（Server Action）。ログイン中ユーザーの権限で実行され、RLS で本人の行にだけ書ける。
import { createClient } from '@/lib/supabase-server'

async function me() {
  const sb = await createClient()
  const { data: u } = await sb.from('users').select('id').maybeSingle() // RLS により、自分の行だけが返る
  if (!u) throw new Error('ユーザーが登録されていません。ログインし直してください')
  return { sb, userId: u.id as number }
}

// 確認テスト：1問答えるたびに回答履歴へ（正誤はDBの正解番号で判定する）
export async function recordQuizAnswer(questionId: number, selectedIndex: number) {
  const { sb, userId } = await me()
  const { data: q } = await sb.from('questions').select('correct_index').eq('id', questionId).single()
  await sb.from('answer_logs').insert({ user_id: userId, question_id: questionId, selected_index: selectedIndex, is_correct: q?.correct_index === selectedIndex })
}

// 確認テスト：最後の問題のあとに、1回ぶんの結果を保存
export async function saveQuizResult(lessonCode: string, score: number, total: number) {
  const { sb, userId } = await me()
  const { data: l } = await sb.from('lessons').select('id').eq('code', lessonCode).single()
  await sb.from('test_results').insert({ user_id: userId, lesson_id: l?.id ?? null, test_type: 'quiz', score, total })
}

// レッスン：全ステップをクリアしたときだけ登録（途中経過・ヒントは保存しない）
export async function completeLesson(lessonCode: string) {
  const { sb, userId } = await me()
  const { data: l } = await sb.from('lessons').select('id').eq('code', lessonCode).single()
  if (!l) return
  await sb.from('lesson_progress').upsert({ user_id: userId, lesson_id: l.id, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' })
}

// 実技テスト・エラー修復・シナリオ：結果と回答履歴を保存
export async function saveAttempt(questionId: number, type: 'practical' | 'repair' | 'scenario', passed: boolean) {
  const { sb, userId } = await me()
  const { data: q } = await sb.from('questions').select('lesson_id').eq('id', questionId).single()
  await sb.from('test_results').insert({ user_id: userId, lesson_id: q?.lesson_id ?? null, test_type: type, score: passed ? 1 : 0, total: 1 })
  await sb.from('answer_logs').insert({ user_id: userId, question_id: questionId, is_correct: passed })
}
