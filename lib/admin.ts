import { redirect } from 'next/navigation'
import { createClient } from './supabase-server'

// 先生でなければトップへ戻す。先生なら Supabase クライアントを返す
export async function requireTeacher() {
  const sb = await createClient()
  const { data } = await sb.rpc('is_teacher')
  if (data !== true) redirect('/')
  return sb
}