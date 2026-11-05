'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { lessons, progress } from '@/lib/data'
import { supabase } from '@/lib/supabase'

export default function MyPageView() {
  const router = useRouter()
  const [info, setInfo] = useState<{ name: string; email: string } | null>(null)

  // ② ログイン中のGoogleアカウントの表示名とメールアドレス
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setInfo({ name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? '', email: user.email ?? '' })
    })
  }, [])

  // ⑥ ログアウトして、ログイン・新規登録画面（S-01）へ
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const clearedCount = lessons.filter((l) => progress[l.id]?.cleared).length
  const scores = lessons.map((l) => progress[l.id]?.best).filter((b): b is number => b != null)
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      <section className="card">
        <p className="text-sm text-gray-600">表示名</p>
        <p className="font-bold">{info?.name ?? '…'}</p>
        <p className="mt-3 text-sm text-gray-600">メールアドレス</p>
        <p className="font-bold">{info?.email ?? '…'}</p>
      </section>
      <section className="card">
        <h2 className="mb-2 font-bold">学習の記録</h2>
        <p>クリア済みレッスン：{clearedCount} / {lessons.length}</p>
        <p>確認テストの平均点：{avg === null ? '－' : `${avg}/10`}</p>
      </section>
      <button className="btn btn-sub" onClick={logout}>ログアウト</button>
    </div>
  )
}
