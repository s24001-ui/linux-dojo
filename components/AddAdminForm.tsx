'use client'

import { useActionState } from 'react'
import { addTeacher, type FormState } from '@/app/admin/add-admin/actions'

export default function AddAdminForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addTeacher, null)

  return (
    <form action={action} className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="teacher@example.com"
          aria-label="追加する管理者のメールアドレス"
          className="min-w-64 flex-1 rounded-lg border-2 border-[#d4d4d4] px-3 py-2 text-sm focus:border-[#3d5a80] focus:outline-none"
        />
        <button type="submit" disabled={pending} className="btn">
          {pending ? '追加中…' : '追加'}
        </button>
      </div>
      {state && (
        <p role="status" className={`text-sm ${state.ok ? 'text-green-700' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}