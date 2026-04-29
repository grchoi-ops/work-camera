export function MemoInput({ item, onItemChange, value, onChange }) {
  return (
    <div className="w-full px-4 py-3 bg-slate-800 rounded-xl flex flex-col gap-2">
      <div>
        <label className="text-xs text-slate-400 block mb-1">아이템 (선택)</label>
        <input
          type="text"
          value={item}
          onChange={(e) => onItemChange(e.target.value)}
          placeholder="부품번호, 모델명 등"
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400 block mb-1">메모 (선택)</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="사진에 대한 메모를 입력하세요…"
          rows={2}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  )
}
