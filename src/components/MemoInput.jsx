export function MemoInput({ value, onChange }) {
  return (
    <div className="w-full px-4 py-3 bg-slate-800 rounded-xl">
      <label className="text-xs text-slate-400 block mb-2">메모 (선택)</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="사진에 대한 메모를 입력하세요…"
        rows={2}
        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  )
}
