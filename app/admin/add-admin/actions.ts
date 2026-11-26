'use server'

import { revalidatePath } from 'next/cache'
import { requireTeacher } from '@/lib/admin'

export type FormState = { ok: boolean; message: string } | null

// 管理者を追加する（先生以外が呼んでも、requireTeacher と DB の関数の両方で弾かれる）
export async function addTeacher(_prev: FormState, formData: FormData): Promise<FormState> {
  const sb = await requireTeacher()
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { ok: false, message: 'メールアドレスを入力してください。' }

  const { error } = await sb.rpc('admin_add_teacher', { p_email: email })
  if (error) {
    return {
      ok: false,
      message: error.message.includes('invalid_email')
        ? 'メールアドレスの形式が正しくありません。'
        : '追加に失敗しました。もう一度お試しください。',
    }
  }
  revalidatePath('/admin/add-admin')
  return { ok: true, message: `${email} を管理者に追加しました。` }
}

// 管理者から外す
export async function removeTeacher(email: string): Promise<{ ok: boolean; message: string }> {
  const sb = await requireTeacher()
  const { error } = await sb.rpc('admin_remove_teacher', { p_email: email })
  if (error) {
    return {
      ok: false,
      message: error.message.includes('cannot_remove_self')
        ? '自分自身は外せません。'
        : '外すのに失敗しました。もう一度お試しください。',
    }
  }
  revalidatePath('/admin/add-admin')
  return { ok: true, message: '' }
}