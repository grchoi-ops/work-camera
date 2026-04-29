import { useState } from 'react'

export function AbbrEditor({ abbrMap, onSave, onClose }) {
  const [entries, setEntries] = useState(() =>
    Object.entries(abbrMap).map(([abbr, full]) => ({ abbr, full }))
  )
  const [newAbbr, setNewAbbr] = useState('')
  const [newFull, setNewFull] = useState('')

  const handleAdd = () => {
    const abbr = newAbbr.trim().toLowerCase()
    const full = newFull.trim()
    if (!abbr || !full) return
    if (entries.some((e) => e.abbr === abbr)) {
      setEntries((prev) => prev.map((e) => e.abbr === abbr ? { abbr, full } : e))
    } else {
      setEntries((prev) => [...prev, { abbr, full }])
    }
    setNewAbbr(''); setNewFull('')
  }

  const handleRemove = (abbr) => setEntries((prev) => prev.filter((e) => e.abbr !== abbr))

  const handleSave = () => {
    const map = Object.fromEntries(entries.map((e) => [e.abbr, e.full]))
    onSave(map)
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: '#e2e8f0' }}>약어 사전</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {/* 추가 폼 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={newAbbr}
            onChange={(e) => setNewAbbr(e.target.value)}
            placeholder="약어 (예: sbh)"
            style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            value={newFull}
            onChange={(e) => setNewFull(e.target.value)}
            placeholder="전체 이름 (예: shell bottom head)"
            style={{ ...inputStyle, flex: 2 }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} style={addBtn}>추가</button>
        </div>

        {/* 목록 */}
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          {entries.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              약어를 추가하세요
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1e293b' }}>
                  <th style={th}>약어</th>
                  <th style={{ ...th, textAlign: 'left' }}>전체 이름</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.abbr} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ ...td, color: '#38bdf8', fontFamily: 'monospace', textAlign: 'center' }}>{e.abbr}</td>
                    <td style={{ ...td, color: '#e2e8f0' }}>{e.full}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button onClick={() => handleRemove(e.abbr)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={cancelBtn}>취소</button>
          <button onClick={handleSave} style={saveBtn}>저장</button>
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
}
const modal = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 12,
  padding: 24, width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
}
const inputStyle = {
  flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
  color: '#e2e8f0', padding: '6px 10px', fontSize: 13, outline: 'none',
}
const addBtn = {
  padding: '6px 14px', borderRadius: 6, border: 'none',
  background: '#059669', color: '#e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
}
const saveBtn = {
  padding: '6px 20px', borderRadius: 6, border: 'none',
  background: '#1d4ed8', color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}
const cancelBtn = {
  padding: '6px 14px', borderRadius: 6, border: '1px solid #334155',
  background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
}
const th = { padding: '6px 12px', color: '#64748b', fontWeight: 600, fontSize: 11, borderBottom: '1px solid #334155' }
const td = { padding: '6px 12px' }
