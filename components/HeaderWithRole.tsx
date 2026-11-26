import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Header from './Header'

// ログイン中の人が先生かどうかを調べて、ヘッダーに渡す
export default async function HeaderWithRole() {
  await connection()
  const sb = await createClient()
  const { data } = await sb.rpc('is_teacher')
  return <Header isTeacher={data === true} />
}