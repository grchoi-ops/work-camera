import { useState } from 'react'

export function SiteSelector({ value, onChange, sites, onAddSite, onRemoveSite }) {
  const [inputMode, setInputMode] = useState(!sites.length)
  const [draft, setDraft] = useState('')

  function confirm() {
    const name = draft.trim()
    if (!name) return
    onAddSite(name)
    onChange(name)
    setDraft('')
    setInputMode(false)
  }

  function selectExisting(name) {
    onChange(name)
    setInputMode(false)
  }

  return (
    <div className="w-full px-4 py-3 bg-slate-800 rounded-xl">
      <p className="text-xs text-slate-400 mb-2">현장명</p>

      {/* 저장된 현장 목록 */}
      {sites.length > 0 && !inputMode && (
        <div className="flex flex-wrap gap-2 mb-2">
          {sites.map((s) => (
            <div key={s} className="flex items-center gap-1">
              <button
                onClick={() => selectExisting(s)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  value === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {s}
              </button>
              <button
                onClick={() => {
                  onRemoveSite(s)
                  if (value === s) onChange('')
                }}
                className="text-slate-500 hover:text-red-400 text-xs"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 직접 입력 */}
      {inputMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirm()}
            placeholder="현장명 입력"
            className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button onClick={confirm} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
            확인
          </button>
          {sites.length > 0 && (
            <button onClick={() => setInputMode(false)} className="text-slate-400 text-sm px-2">
              취소
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setInputMode(true)}
          className="text-blue-400 text-sm hover:text-blue-300 mt-1"
        >
          + 새 현장 추가
        </button>
      )}

      {value && !inputMode && (
        <p className="text-green-400 text-xs mt-2">선택됨: {value}</p>
      )}
    </div>
  )
}
