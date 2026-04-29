import { useState, useCallback } from 'react'
import { PreviewTable } from './components/PreviewTable'
import { LogPanel } from './components/LogPanel'
import { buildPlan } from './utils/organizer'

const api = window.electronAPI

function timestamp() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function App() {
  const [localFolder, setLocalFolder] = useState('')
  const [outputFolder, setOutputFolder] = useState('')
  const [plan, setPlan] = useState([])
  const [selected, setSelected] = useState([])
  const [logs, setLogs] = useState([])
  const [organizing, setOrganizing] = useState(false)
  const [mode, setMode] = useState('copy')

  const addLog = useCallback((message, type = 'info') => {
    setLogs((prev) => [...prev, { time: timestamp(), message, type }])
  }, [])

  const handleSelectLocal = useCallback(async () => {
    const folder = await api.selectFolder()
    if (!folder) return
    setLocalFolder(folder)
    const files = await api.scanFolder(folder)
    const newPlan = buildPlan(files)
    setPlan(newPlan)
    setSelected(newPlan.map(() => true))
    const jpgCount = newPlan.filter((p) => /\.(jpg|jpeg)$/i.test(p.src)).length
    addLog(`스캔 완료 — 사진 ${jpgCount}개 발견`, 'info')
  }, [addLog])

  const handleSelectOutput = useCallback(async () => {
    const folder = await api.selectOutputFolder()
    if (!folder) return
    setOutputFolder(folder)
    addLog(`출력 폴더: ${folder}`, 'info')
  }, [addLog])

  const handleToggle = useCallback((i) => {
    setSelected((s) => s.map((v, idx) => (idx === i ? !v : v)))
  }, [])

  const handleToggleAll = useCallback(() => {
    setSelected((s) => {
      const allOn = s.every(Boolean)
      return s.map(() => !allOn)
    })
  }, [])

  const handleOrganize = useCallback(async () => {
    if (!outputFolder) { addLog('출력 폴더를 선택하세요', 'error'); return }
    if (!localFolder) { addLog('원본 폴더를 선택하세요', 'error'); return }

    // 선택된 jpg와 그에 대응하는 txt를 함께 수집
    const jpgPlan = plan.filter((p) => /\.(jpg|jpeg)$/i.test(p.src))
    const selectedBases = new Set(
      jpgPlan.filter((_, i) => selected[i]).map((p) => p.src.replace(/\.[^.]+$/, ''))
    )
    const selectedPlan = plan.filter((p) => {
      const base = p.src.replace(/\.[^.]+$/, '')
      return selectedBases.has(base)
    })

    if (!selectedPlan.length) { addLog('선택된 파일이 없습니다', 'error'); return }

    setOrganizing(true)
    addLog(`${mode === 'copy' ? '복사' : '이동'} 시작 — ${selectedPlan.length}개 파일`, 'info')
    const results = await api.executeOrganize(selectedPlan, localFolder, outputFolder, mode)
    const ok = results.filter((r) => r.ok).length
    const fail = results.filter((r) => !r.ok).length
    results.filter((r) => !r.ok).forEach((r) => addLog(`실패: ${r.src} — ${r.error}`, 'error'))
    addLog(`완료 — 성공 ${ok}개${fail ? `, 실패 ${fail}개` : ''}`, fail ? 'error' : 'success')
    if (mode === 'move') { setPlan([]); setSelected([]) }
    setOrganizing(false)
  }, [plan, selected, outputFolder, localFolder, mode, addLog])

  const jpgCount = plan.filter((p) => /\.(jpg|jpeg)$/i.test(p.src)).length
  const selectedCount = selected.filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 헤더 */}
      <header style={{ padding: '10px 16px', background: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>업무사진 정리</h1>
        <span style={{ fontSize: 12, color: '#475569' }}>|</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {jpgCount > 0 ? `사진 ${jpgCount}개 / ${selectedCount}개 선택됨` : '폴더를 선택하세요'}
        </span>
      </header>

      {/* 폴더 선택 바 */}
      <div style={{ padding: '10px 16px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={handleSelectLocal} style={btn('#334155')}>원본 폴더 선택</button>
        <span style={{ fontSize: 12, color: localFolder ? '#e2e8f0' : '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {localFolder || '선택 안 됨'}
        </span>
      </div>

      {/* 미리보기 테이블 */}
      <PreviewTable plan={plan} selected={selected} onToggle={handleToggle} onToggleAll={handleToggleAll} />

      {/* 하단 실행 바 */}
      <div style={{ padding: '10px 16px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>출력:</span>
        <span style={{ flex: 1, fontSize: 12, color: outputFolder ? '#e2e8f0' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {outputFolder || '선택 안 됨'}
        </span>
        <button onClick={handleSelectOutput} style={btn('#334155')}>폴더 선택</button>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}
        >
          <option value="copy">복사</option>
          <option value="move">이동</option>
        </select>
        <button onClick={handleOrganize} disabled={organizing || !jpgCount} style={btn('#1d4ed8')}>
          {organizing ? '처리 중…' : '실행'}
        </button>
      </div>

      <LogPanel logs={logs} />
    </div>
  )
}

function btn(bg) {
  return {
    padding: '6px 14px', borderRadius: 6, border: 'none',
    background: bg, color: '#e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
  }
}
