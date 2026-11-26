'use client'

export default function Pager({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  if (pageCount <= 1) return null
  return (
    <div className="mt-3 flex items-center justify-center gap-3 text-sm">
      <button
        type="button"
        className="btn btn-sub !px-3 !py-1.5 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        前へ
      </button>
      <span>
        {page} / {pageCount} ページ
      </span>
      <button
        type="button"
        className="btn btn-sub !px-3 !py-1.5 disabled:opacity-40"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        次へ
      </button>
    </div>
  )
}