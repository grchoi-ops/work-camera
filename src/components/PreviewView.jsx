import { MemoInput } from './MemoInput'

export function PreviewView({ imageUrl, item, onItemChange, memo, onMemoChange, onRetake, onUpload, uploading }) {
  return (
    <div className="flex flex-col gap-3 w-full flex-1">
      {/* 미리보기 이미지 */}
      <div className="flex-1 rounded-xl overflow-hidden bg-black flex items-center justify-center">
        <img src={imageUrl} alt="촬영된 사진" className="max-h-full max-w-full object-contain" />
      </div>

      {/* 아이템 + 메모 입력 */}
      <MemoInput item={item} onItemChange={onItemChange} value={memo} onChange={onMemoChange} />

      {/* 버튼 행 */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          disabled={uploading}
          className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium active:brightness-90 disabled:opacity-50"
        >
          재촬영
        </button>
        <button
          onClick={onUpload}
          disabled={uploading}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium active:brightness-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              업로드 중…
            </>
          ) : (
            'Drive 업로드'
          )}
        </button>
      </div>
    </div>
  )
}
