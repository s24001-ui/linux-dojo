import { Suspense } from 'react'
import RepairListView from '@/components/RepairListView'
import { getRepairs } from '@/lib/db'

// S-06 エラー修復一覧画面
export default function RepairListPage() {
  return (
    <Suspense fallback={null}>
      <RepairList />
    </Suspense>
  )
}

async function RepairList() {
  const missions = await getRepairs()
  return <RepairListView missions={missions} />
}
