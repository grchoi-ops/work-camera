export function PreviewTable({ plan, selected, onToggle, onToggleAll }) {
  if (!plan.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
        폴더를 선택하거나 Drive를 동기화하면 파일 목록이 표시됩니다
      </div>
    )
  }

  const allSelected = plan.every((_, i) => selected[i])

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1e293b', position: 'sticky', top: 0 }}>
            <th style={th}><input type="checkbox" checked={allSelected} onChange={onToggleAll} /></th>
            <th style={{ ...th, textAlign: 'left' }}>파일명</th>
            <th style={{ ...th, textAlign: 'left' }}>현장</th>
            <th style={{ ...th, textAlign: 'left' }}>아이템</th>
            <th style={{ ...th, textAlign: 'left' }}>날짜</th>
            <th style={{ ...th, textAlign: 'left' }}>저장 경로</th>
          </tr>
        </thead>
        <tbody>
          {plan
            .filter((p) => p.src.match(/\.(jpg|jpeg)$/i))
            .map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b', background: selected[i] ? '#1e293b55' : 'transparent' }}
                onClick={() => onToggle(i)}>
                <td style={td}><input type="checkbox" checked={!!selected[i]} onChange={() => onToggle(i)} onClick={(e) => e.stopPropagation()} /></td>
                <td style={{ ...td, color: '#e2e8f0', fontFamily: 'monospace' }}>{p.src}</td>
                <td style={{ ...td, color: '#38bdf8' }}>{p.site}</td>
                <td style={{ ...td, color: '#a78bfa' }}>{p.item}</td>
                <td style={{ ...td, color: '#94a3b8' }}>{p.date}</td>
                <td style={{ ...td, color: '#64748b', fontSize: 11 }}>{p.dest}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

const th = {
  padding: '8px 12px', color: '#94a3b8', fontWeight: 600,
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid #334155',
}
const td = { padding: '6px 12px', verticalAlign: 'middle' }
