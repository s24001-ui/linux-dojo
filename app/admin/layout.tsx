import { Suspense } from 'react'
import { connection } from 'next/server'
import { requireTeacher } from '@/lib/admin'
import AdminHeader from '@/components/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222]">
      {/* 現在のページを強調するため usePathname を使う。Suspense で包む */}
      <Suspense fallback={<div className="h-[3.25rem] border-b border-[#444] bg-[#e8e8e8]" />}>
        <AdminHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<p>読み込み中…</p>}>
          <Guard>{children}</Guard>
        </Suspense>
      </main>
    </div>
  )
}

// 先生でなければトップへ戻す
async function Guard({ children }: { children: React.ReactNode }) {
  await connection()
  await requireTeacher()
  return <>{children}</>
}