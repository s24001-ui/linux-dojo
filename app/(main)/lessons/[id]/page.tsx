import { notFound } from 'next/navigation'
import LessonView from '@/components/LessonView'
import { lessons } from '@/lib/data'

// S-03 レッスン画面
export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }))
}

export default async function LessonPage({ params }: PageProps<'/lessons/[id]'>) {
  const { id } = await params
  const lesson = lessons.find((l) => l.id === id)
  if (!lesson) notFound()
  return <LessonView id={id} />
}
