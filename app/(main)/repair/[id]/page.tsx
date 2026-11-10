import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import RepairView from '@/components/RepairView'
import { getRepair } from '@/lib/db'

// S-07 エラー修復ミッション画面
export default function RepairPage({ params }: PageProps<'/repair/[id]'>) {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <Repair params={params} />
    </Suspense>
  )
}

async function Repair({ params }: { params: PageProps<'/repair/[id]'>['params'] }) {
  const { id } = await params
  const mission = /^\d+$/.test(id) ? await getRepair(Number(id)) : null
  if (!mission) notFound()
  return <RepairView mission={mission} />
}
