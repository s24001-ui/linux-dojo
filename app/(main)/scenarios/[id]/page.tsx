import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ScenarioView from '@/components/ScenarioView'
import { getScenario } from '@/lib/db'

// S-15 シナリオ画面
export default function ScenarioPage({ params }: PageProps<'/scenarios/[id]'>) {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <Scenario params={params} />
    </Suspense>
  )
}

async function Scenario({ params }: { params: PageProps<'/scenarios/[id]'>['params'] }) {
  const { id } = await params
  const scenario = /^\d+$/.test(id) ? await getScenario(Number(id)) : null
  if (!scenario) notFound()
  return <ScenarioView scenario={scenario} />
}
