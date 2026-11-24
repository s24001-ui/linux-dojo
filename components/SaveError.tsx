// 成績の保存に失敗したときの警告。学習は続けられるが、記録が残っていないことを伝える
export default function SaveError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border-2 border-red-600 bg-red-50 p-3" role="alert">
      <p className="text-sm font-bold text-red-700">{message ?? '成績の保存に失敗しました。通信状況を確認してください。'}</p>
      {onRetry && <button className="btn btn-sub mt-2 !py-1.5 text-sm" onClick={onRetry}>もう一度保存する</button>}
    </div>
  )
}