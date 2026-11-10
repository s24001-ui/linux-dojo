import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// サーバー側（ページ・Server Action）用。ログイン中ユーザーの権限で動くので、RLS が効く
export async function createClient() {
  const store = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Server Component からは書けない。ログイン状態の更新は proxy.ts が行うので無視してよい
        }
      },
    },
  })
}
