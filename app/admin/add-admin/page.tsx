import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import AddAdminForm from '@/components/AddAdminForm'
import RemoveAdminButton from '@/components/RemoveAdminButton'

type Teacher = { email: string; name: string | null; registered: boolean; is_self: boolean }

export default function AddAdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理者の追加</h1>

      <section className="card">
        <h2 className="mb-1 font-bold">メールアドレスで追加</h2>
        <p className="mb-3 text-xs text-gray-600">
          Googleログインに使うメールアドレスを入力してください。すでにログイン済みの人はすぐに、まだの人は初めてログインしたときに、管理者になります。
        </p>
        <AddAdminForm />
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">管理者の一覧</h2>
        <Suspense fallback={<p>読み込み中…</p>}>
          <TeacherList />
        </Suspense>
      </section>
    </div>
  )
}

async function TeacherList() {
  await connection()
  const sb = await createClient()
  const { data, error } = await sb.rpc('admin_list_teachers')
  if (error) return <p className="text-red-600">取得に失敗しました: {error.message}</p>

  const teachers = (data ?? []) as Teacher[]
  if (!teachers.length) return <p className="text-sm text-gray-600">管理者がいません。</p>

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-[#444]">
          <th className="py-2 pr-4">名前・メールアドレス</th>
          <th className="py-2 pr-4">状態</th>
          <th className="py-2">操作</th>
        </tr>
      </thead>
      <tbody>
        {teachers.map((t) => (
          <tr key={t.email} className="border-b border-[#d4d4d4]">
            <td className="py-3 pr-4">
              {t.name && <p className="font-bold">{t.name}</p>}
              <p className={t.name ? 'text-xs text-gray-600' : 'font-bold'}>{t.email}</p>
            </td>
            <td className="py-3 pr-4">
              {t.registered ? (
                <span className="font-bold text-green-700">管理者</span>
              ) : (
                <span className="text-gray-600">ログイン待ち</span>
              )}
            </td>
            <td className="py-3">
              {t.is_self ? <span className="text-gray-500">あなた</span> : <RemoveAdminButton email={t.email} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}