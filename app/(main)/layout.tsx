import { Suspense } from 'react'
import HeaderWithRole from '@/components/HeaderWithRole'

// ログイン画面以外の共通レイアウト（ヘッダー付き）
export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222]">
      {/* 現在のページを強調するため usePathname を使う。ログイン情報を読むので Suspense で包む */}
      <Suspense fallback={<div className="h-[3.25rem] border-b border-[#444] bg-[#e8e8e8]" />}>
        <HeaderWithRole />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}