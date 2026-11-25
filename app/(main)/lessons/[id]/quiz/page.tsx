import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import QuizView from '@/components/QuizView'
import { getLesson, getQuizQuestions } from '@/lib/db'

// S-04 確認テスト画面
export default function QuizPage({ params }: PageProps<'/lessons/[id]/quiz'>) {
  return (
    <Suspense fallback={null}>
      <Quiz params={params} />
    </Suspense>
  )
}

async function Quiz({ params }: { params: PageProps<'/lessons/[id]/quiz'>['params'] }) {
  const { id } = await params
  const [data, questions] = await Promise.all([getLesson(id), getQuizQuestions(id)])
  if (!data) notFound()
  return <QuizView lesson={data.lesson} questions={questions} />
}
