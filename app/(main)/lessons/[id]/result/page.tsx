import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ResultView from '@/components/ResultView'
import { lessons } from '@/lib/data'

// S-05 確認テスト結果画面
export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }))
}

export default async function ResultPage({ params }: PageProps<'/lessons/[id]/result'>) {
  const { id } = await params
  const lesson = lessons.find((l) => l.id === id)
  if (!lesson) notFound()
  return (
    <Suspense fallback={<p>結果を読み込み中…</p>}>
      <ResultView id={id} />
    </Suspense>
  )
}
