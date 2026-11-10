import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import LessonView from '@/components/LessonView'
import { getLesson } from '@/lib/db'

// S-03 レッスン画面
export default function LessonPage({ params }: PageProps<'/lessons/[id]'>) {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <Lesson params={params} />
    </Suspense>
  )
}

async function Lesson({ params }: { params: PageProps<'/lessons/[id]'>['params'] }) {
  const { id } = await params
  const data = await getLesson(id)
  if (!data || !data.steps.length) notFound()
  return <LessonView lesson={data.lesson} steps={data.steps} />
}
