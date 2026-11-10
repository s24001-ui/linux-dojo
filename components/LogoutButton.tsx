'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ログアウトしてログイン画面へ
export default function LogoutButton() {
  const router = useRouter()
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }
  return <button className="btn btn-sub" onClick={logout}>ログアウト</button>
}
