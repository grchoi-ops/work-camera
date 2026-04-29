export function LogPanel({ logs }) {
  return (
    <div style={{ height: 110, borderTop: '1px solid #334155', background: '#0f172a', overflowY: 'auto', padding: '6px 12px', display: 'flex', flexDirection: 'column-reverse' }}>
      {logs.length === 0 && <span style={{ color: '#475569', fontSize: 12 }}>로그 없음</span>}
      {[...logs].reverse().map((log, i) => (
        <div key={i} style={{ fontSize: 12, padding: '2px 0', color: log.type === 'error' ? '#f87171' : log.type === 'success' ? '#4ade80' : '#94a3b8', fontFamily: 'monospace' }}>
          <span style={{ color: '#475569', marginRight: 8 }}>{log.time}</span>
          {log.message}
        </div>
      ))}
    </div>
  )
}
