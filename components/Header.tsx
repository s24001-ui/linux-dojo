'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 全画面共通のヘッダー：アプリのタイトルと、主要画面へのナビゲーション
const NAV = [
  { href: '/', label: 'トップ' },
  { href: '/repair', label: 'エラー修復' },
  { href: '/review', label: '復習' },
  { href: '/weakness', label: '弱点分析' },
  { href: '/mypage', label: 'マイページ' },
]

export default function Header() {
  const pathname = usePathname()
  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="border-b border-[#444] bg-[#e8e8e8]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2">
        <Link href="/" className="text-xl font-bold">
          Linuxコマンド道場
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded px-3 py-1.5 ${active(n.href) ? 'bg-[#3d5a80] font-bold text-white' : 'hover:bg-[#d4d4d4]'}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
