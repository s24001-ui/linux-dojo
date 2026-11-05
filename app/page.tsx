'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// S-01 ⑤：認証に失敗・キャンセルしたときに表示するメッセージ
const LOGIN_ERROR_MESSAGE = 'ログインに失敗しました。もう一度お試しください'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Googleの画面でキャンセルしたり、認証に失敗したりして、この画面に戻ってきたとき
  // （戻り先のURLに error が付く）もエラーメッセージを表示する
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (query.has('error') || hash.has('error')) {
      setErrorMessage(LOGIN_ERROR_MESSAGE)
    }
  }, [])

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
      console.error(error) // 詳しい原因は、開発者向けにコンソールへ
      setErrorMessage(LOGIN_ERROR_MESSAGE)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222]">
      {/* ① ヘッダー：アプリケーションのタイトル */}
      <header className="flex h-14 items-center justify-center border-b border-[#444] bg-[#e8e8e8]">
        <h1 className="text-xl font-bold">Linuxコマンド道場</h1>
      </header>

      {/* ヘッダー以外は、残りの高さの中央に置く（pb で、見た目の中心を少し上にする） */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        {/* ② アプリの説明文 */}
        <p className="text-center text-xl sm:text-2xl">
          ブラウザでLinuxコマンドを安全に練習できます
        </p>

        {/* ⑤ エラーメッセージ表示欄（失敗・キャンセル時のみ表示）
            表示する・しないで、ほかの要素の位置が動かないように、場所は常に確保しておく */}
        <div className="mt-6 h-[52px] w-full max-w-[400px]">
          {errorMessage && (
            <p
              role="alert"
              className="flex h-full items-center justify-center rounded border-2 border-dashed border-red-600 bg-[#fdecec] px-4 text-center text-sm text-[#a00000]"
            >
              {errorMessage}
            </p>
          )}
        </div>

        {/* ③ Googleでログインボタン */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-4 h-[70px] w-full max-w-[320px] rounded-lg bg-[#3d5a80] text-xl font-bold text-white hover:bg-[#32496a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'ログイン中...' : 'Googleでログイン'}
        </button>

        {/* ④ 補足文 */}
        <p className="mt-6 text-sm text-gray-600">
          初めての方も、このボタンから登録できます
        </p>
      </main>
    </div>
  )
}