'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 text-3xl font-bold text-gray-800">
          Linux Dojo
        </h1>

        <p className="mb-8 text-gray-500">
          Googleアカウントでログインしてください
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'ログイン中...' : 'Googleでログイン'}
        </button>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  )
}