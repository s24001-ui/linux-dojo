import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: authError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (authError) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  const { data: { user }, error: userError } =
    await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/?error=user`)
  }

  const googleIdentity = user.identities?.find(
    (identity) => identity.provider === 'google'
  )

  const googleId =
    googleIdentity?.identity_data?.sub ??
    user.user_metadata?.sub

  if (!googleId || !user.email) {
    return NextResponse.redirect(`${origin}/?error=profile`)
  }

  const { error: dbError } = await supabase
    .from('users')
    .upsert(
      {
        auth_user_id: user.id,
        google_id: String(googleId),
        email: user.email,
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email,
      },
      {
        onConflict: 'auth_user_id',
      }
    )

  if (dbError) {
    console.error('ユーザー登録エラー:', dbError)
    return NextResponse.redirect(`${origin}/?error=registration`)
  }

  return NextResponse.redirect(`${origin}/`)
}