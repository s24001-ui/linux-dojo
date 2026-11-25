import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import PracticalView from '@/components/PracticalView'
import { getPractical } from '@/lib/db'

// S-08 実技テスト画面（URLはレッスンコード）
export default function TestPage({ params }: PageProps<'/tests/[id]'>) {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <Test params={params} />
    </Suspense>
  )
}

async function Test({ params }: { params: PageProps<'/tests/[id]'>['params'] }) {
  const { id } = await params
  const test = await getPractical(id)
  if (!test) notFound()
  return <PracticalView test={test} />
}
