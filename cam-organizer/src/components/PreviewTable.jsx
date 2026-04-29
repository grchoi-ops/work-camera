export function PreviewTable({ plan, selected, onToggle, onToggleAll, depth = 1 }) {
  if (!plan.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
        폴더를 선택하거나 Drive를 동기화하면 파일 목록이 표시됩니다
      </div>
    )
  }

  const jpgRows = plan.filter((p) => p.src.match(/\.(jpg|jpeg)$/i))
  const allSelected = jpgRows.every((_, i) => {
    const planIdx = plan.indexOf(jpgRows[i])
    return selected[planIdx]
  })

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1e293b', position: 'sticky', top: 0 }}>
            <th style={th}><input type="checkbox" checked={allSelected} onChange={onToggleAll} /></th>
            <th style={{ ...th, textAlign: 'left' }}>파일명</th>
            <th style={{ ...th, textAlign: 'left' }}>현장</th>
            {depth !== 4 && <th style={{ ...th, textAlign: 'left' }}>주차</th>}
            {(depth >= 2 || depth === 4) && <th style={{ ...th, textAlign: 'left' }}>아이템</th>}
            {depth >= 3 && <th style={{ ...th, textAlign: 'left' }}>세부분류</th>}
            <th style={{ ...th, textAlign: 'left' }}>저장 경로</th>
          </tr>
        </thead>
        <tbody>
          {jpgRows.map((p, i) => {
            const planIdx = plan.indexOf(p)
            return (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b', background: selected[planIdx] ? '#1e293b55' : 'transparent', cursor: 'pointer' }}
                onClick={() => onToggle(planIdx)}>
                <td style={td}><input type="checkbox" checked={!!selected[planIdx]} onChange={() => onToggle(planIdx)} onClick={(e) => e.stopPropagation()} /></td>
                <td style={{ ...td, color: '#e2e8f0', fontFamily: 'monospace' }}>{p.src}</td>
                <td style={{ ...td, color: '#38bdf8' }}>{p.site}</td>
                {depth !== 4 && <td style={{ ...td, color: '#94a3b8' }}>{p.week}</td>}
                {(depth >= 2 || depth === 4) && <td style={{ ...td, color: '#a78bfa' }}>{p.item}</td>}
                {depth >= 3 && <td style={{ ...td, color: '#fb923c' }}>{p.sub}</td>}
                <td style={{ ...td, color: '#64748b', fontSize: 11 }}>{p.dest}</td>
              </tr>
            )
          })}
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
