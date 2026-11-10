import Link from 'next/link'
import type { LessonRow, QuizRow } from '@/lib/types'

// 確認テストの結果（表示だけ。サーバー側で組み立てたデータを受け取る）
export default function ResultView({ lesson, nextLesson, items }: { lesson: Pick<LessonRow, 'code' | 'title'>; nextLesson?: Pick<LessonRow, 'code'>; items: { n: number; q: QuizRow; ok: boolean }[] }) {
  const score = items.filter((x) => x.ok).length
  const wrong = items.filter((x) => !x.ok)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title}　確認テスト結果</h1>
      <p className="card py-6 text-center text-4xl font-bold">{score} / {items.length} 問正解</p>

      <div className="flex flex-wrap gap-2" aria-label="全問の結果">
        {items.map((x) => (
          <span key={x.n} className={`flex h-9 w-9 items-center justify-center rounded-full border font-bold ${x.ok ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'}`} title={`問題${x.n}`}>{x.ok ? '○' : '✕'}</span>
        ))}
      </div>
      {wrong.length > 0 && (
        <ul className="space-y-2">
          {wrong.map((x) => (
            <li key={x.n} className="card border-red-300 bg-red-50">
              <p className="font-bold">問題 {x.n}：{x.q.body}</p>
              <p className="mt-1 text-sm">正解：{x.q.choices[x.q.correct_index]}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/lessons/${lesson.code}/quiz`} className="btn btn-sub">もう一度受ける</Link>
        <Link href={`/tests/${lesson.code}`} className="btn">実技テストへ進む</Link>
        {nextLesson && <Link href={`/lessons/${nextLesson.code}`} className="btn">次のレッスンへ</Link>}
      </div>
      <Link href="/" className="inline-block text-[#3d5a80] underline">← トップページへ戻る</Link>
    </div>
  )
}
