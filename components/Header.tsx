'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 全画面共通のヘッダー：アプリのタイトルと、主要画面へのナビゲーション
const NAV = [
  { href: '/', label: 'トップ' },
  { href: '/repair', label: 'エラー修復' },
  { href: '/scenarios', label: 'シナリオ' },
  { href: '/mypage', label: 'マイページ' },
]

export default function Header({ isTeacher = false }: { isTeacher?: boolean }) {
  const pathname = usePathname()
  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="border-b border-[#444] bg-[#e8e8e8]">
      <div className="mx-auto flex h-[3.25rem] max-w-6xl flex-nowrap items-center justify-between gap-x-6 overflow-x-auto px-4 py-2">
        <Link
          href="/"
          className="shrink-0 rounded text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80]"
        >
          Linuxコマンド道場
        </Link>
        <nav aria-label="メインナビゲーション" className="flex shrink-0 flex-nowrap items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? 'page' : undefined}
              className={`whitespace-nowrap rounded px-3 py-1.5 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80] ${active(n.href) ? 'bg-[#3d5a80] text-white' : 'hover:bg-[#d4d4d4]'}`}
            >
              {n.label}
            </Link>
          ))}
          {/* 先生のアカウントのときだけ表示する */}
          {isTeacher && (
            <Link
              href="/admin"
              className="ml-3 whitespace-nowrap rounded border-2 border-[#3d5a80] px-3 py-1 font-bold text-[#3d5a80] hover:bg-[#eef2f7]"
            >
              先生用ページ
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}