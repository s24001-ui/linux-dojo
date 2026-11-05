import Header from '@/components/Header'

// ログイン画面以外の共通レイアウト（ヘッダー付き）
export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222]">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
