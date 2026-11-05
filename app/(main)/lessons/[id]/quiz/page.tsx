import { notFound } from 'next/navigation'
import QuizView from '@/components/QuizView'
import { lessons } from '@/lib/data'

// S-04 確認テスト画面
export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }))
}

export default async function QuizPage({ params }: PageProps<'/lessons/[id]/quiz'>) {
  const { id } = await params
  const lesson = lessons.find((l) => l.id === id)
  if (!lesson) notFound()
  return <QuizView id={id} />
}
