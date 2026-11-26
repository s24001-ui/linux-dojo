'use client'

import { useId, useRef, useState, useTransition } from 'react'
import { removeTeacher } from '@/app/admin/add-admin/actions'

export default function RemoveAdminButton({ email }: { email: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const open = () => {
    setError(null)
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  const confirm = () => {
    start(async () => {
      const res = await removeTeacher(email)
      if (res.ok) close()
      else setError(res.message)
    })
  }

  return (
    <>
      <button type="button" className="btn btn-sub !px-3 !py-1 text-sm" onClick={open}>
        外す
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // 処理中は Esc で閉じない
        onCancel={(e) => {
          if (pending) e.preventDefault()
        }}
        // 暗い背景をクリックしたら閉じる（ダイアログの中身をクリックしたときは閉じない）
        onClick={(e) => {
          if (e.target === dialogRef.current && !pending) close()
        }}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border border-[#444] bg-white p-0 text-[#222] shadow-xl backdrop:bg-black/40"
      >
        <div className="p-6">
          <h3 id={titleId} className="text-lg font-bold">
            管理者から外しますか？
          </h3>
          <p className="mt-3 break-all rounded bg-[#f3f6fa] px-3 py-2 text-sm font-bold">{email}</p>
          <p className="mt-3 text-sm text-gray-600">
            外すと、この人は先生用ページに入れなくなります。あとから、もう一度追加することもできます。
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className="btn btn-sub" onClick={close} disabled={pending}>
              キャンセル
            </button>
            <button type="button" className="btn" onClick={confirm} disabled={pending}>
              {pending ? '処理中…' : '外す'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}