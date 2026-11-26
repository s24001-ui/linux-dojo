'use client'

import { useState, useTransition } from 'react'
import { removeTeacher } from '@/app/admin/add-admin/actions'

export default function RemoveAdminButton({ email }: { email: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className="btn btn-sub !px-3 !py-1 text-sm"
        onClick={() => {
          if (!window.confirm(`${email} を管理者から外しますか？`)) return
          start(async () => {
            const res = await removeTeacher(email)
            setError(res.ok ? null : res.message)
          })
        }}
      >
        {pending ? '処理中…' : '外す'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}