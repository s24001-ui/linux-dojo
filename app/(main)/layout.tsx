import { Suspense } from 'react'
import Header from '@/components/Header'

// ログイン画面以外の共通レイアウト（ヘッダー付き）
export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222]">
      {/* 現在のページを強調するため usePathname を使う。動的なページでも表示できるよう Suspense で包む */}
      <Suspense fallback={<div className="h-[3.25rem] border-b border-[#444] bg-[#e8e8e8]" />}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
