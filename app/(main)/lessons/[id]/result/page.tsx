import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ResultView from '@/components/ResultView'
import { getLesson, getLessons, getQuestionsByIds } from '@/lib/db'

// S-05 確認テスト結果画面（?r=問題ID:正誤,問題ID:正誤,…）
export default function ResultPage(props: PageProps<'/lessons/[id]/result'>) {
  return (
    <Suspense fallback={<p>結果を読み込み中…</p>}>
      <Result {...props} />
    </Suspense>
  )
}

async function Result({ params, searchParams }: PageProps<'/lessons/[id]/result'>) {
  const { id } = await params
  const { r } = await searchParams
  const data = await getLesson(id)
  if (!data) notFound()

  const answers = String(Array.isArray(r) ? r[0] : r ?? '').split(',').map((s) => s.split(':')).filter((p) => /^\d+$/.test(p[0]))
  const [questions, lessons] = await Promise.all([getQuestionsByIds(answers.map((p) => Number(p[0]))), getLessons()])
  const items = answers.flatMap((p, i) => {
    const q = questions.find((x) => x.id === Number(p[0]))
    return q ? [{ n: i + 1, q, ok: p[1] === '1' }] : []
  })
  const nextLesson = lessons[lessons.findIndex((l) => l.code === id) + 1]
  return <ResultView lesson={data.lesson} nextLesson={nextLesson} items={items} />
}
