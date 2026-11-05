import { notFound } from 'next/navigation'
import RepairView from '@/components/RepairView'
import { missions } from '@/lib/data'

// S-07 エラー修復ミッション画面
export function generateStaticParams() {
  return missions.map((m) => ({ id: m.id }))
}

export default async function RepairPage({ params }: PageProps<'/repair/[id]'>) {
  const { id } = await params
  const mission = missions.find((m) => m.id === id)
  if (!mission) notFound()
  return <RepairView id={id} />
}
