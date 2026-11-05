import { notFound } from 'next/navigation'
import PracticalView from '@/components/PracticalView'
import { practicals } from '@/lib/data'

// S-08 実技テスト画面
export function generateStaticParams() {
  return practicals.map((t) => ({ id: t.id }))
}

export default async function TestPage({ params }: PageProps<'/tests/[id]'>) {
  const { id } = await params
  const test = practicals.find((t) => t.id === id)
  if (!test) notFound()
  return <PracticalView id={id} />
}
