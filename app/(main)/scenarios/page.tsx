import { Suspense } from 'react'
import ScenarioListView from '@/components/ScenarioListView'
import { getScenarios } from '@/lib/db'

// S-14 シナリオ一覧画面
export default function ScenarioListPage() {
  return (
    <Suspense fallback={null}>
      <ScenarioList />
    </Suspense>
  )
}

async function ScenarioList() {
  const scenarios = await getScenarios()
  return <ScenarioListView scenarios={scenarios} />
}
