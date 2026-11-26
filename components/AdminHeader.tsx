'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 先生用ページ専用のヘッダー。ボタンを増やすときは NAV に1行足す
const NAV: { href: string; label: string; isActive: (path: string) => boolean }[] = [
  {
    href: '/admin',
    label: '生徒の進捗',
    isActive: (p) => p === '/admin' || p.startsWith('/admin/students'),
  },
  {
    href: '/admin/add-admin',
    label: '管理者の追加',
    isActive: (p) => p.startsWith('/admin/add-admin'),
  },
]

export default function AdminHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b border-[#444] bg-[#e8e8e8]">
      <div className="mx-auto flex h-[3.25rem] max-w-6xl flex-nowrap items-center justify-between gap-x-6 overflow-x-auto px-4 py-2">
        <Link
          href="/admin"
          className="shrink-0 rounded text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80]"
        >
          Linuxコマンド道場<span className="ml-2 text-sm font-normal text-gray-600">先生用</span>
        </Link>
        <nav aria-label="先生用ナビゲーション" className="flex shrink-0 flex-nowrap items-center gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.isActive(pathname)
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap rounded px-3 py-1.5 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a80] ${
                  active ? 'bg-[#3d5a80] text-white' : 'hover:bg-[#d4d4d4]'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
          {/* 生徒用の画面を確認しに行くためのリンク */}
          <Link
            href="/"
            className="ml-3 whitespace-nowrap rounded border-2 border-[#3d5a80] px-3 py-1 font-bold text-[#3d5a80] hover:bg-[#eef2f7]"
          >
            生徒画面へ
          </Link>
        </nav>
      </div>
    </header>
  )
}