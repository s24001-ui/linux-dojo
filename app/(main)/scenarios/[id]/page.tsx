import { notFound } from 'next/navigation'
import ScenarioView from '@/components/ScenarioView'
import { scenarios } from '@/lib/data'

// S-15 シナリオ画面
export function generateStaticParams() {
  return scenarios.map((s) => ({ id: s.id }))
}

export default async function ScenarioPage({ params }: PageProps<'/scenarios/[id]'>) {
  const { id } = await params
  const scenario = scenarios.find((s) => s.id === id)
  if (!scenario) notFound()
  return <ScenarioView id={id} />
}
