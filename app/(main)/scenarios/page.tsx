import { Suspense } from 'react'
import ScenarioListView from '@/components/ScenarioListView'
import { getScenarios } from '@/lib/db'

// S-14 シナリオ一覧画面
export default function ScenarioListPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <ScenarioList />
    </Suspense>
  )
}

async function ScenarioList() {
  const scenarios = await getScenarios()
  return <ScenarioListView scenarios={scenarios} />
}
