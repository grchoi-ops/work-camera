import { useState, useEffect, useCallback } from 'react'
import { PreviewTable } from './components/PreviewTable'
import { LogPanel } from './components/LogPanel'
import { buildPlan } from './utils/organizer'

const api = window.electronAPI

function ts() {
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

  // Drive 상태
  const [driveLoggedIn, setDriveLoggedIn] = useState(false)
  const [drivePolling, setDrivePolling] = useState(false)
  const [pollInterval, setPollInterval] = useState(5)
  const [syncing, setSyncing] = useState(false)

  const addLog = useCallback((message, type = 'info') => {
    setLogs((prev) => [...prev, { time: ts(), message, type }])
  }, [])

  // Drive 로그인 상태 초기 확인
  useEffect(() => {
    api?.getDriveLoginState().then(({ loggedIn }) => setDriveLoggedIn(loggedIn))
  }, [])

  // Drive 이벤트 수신
  useEffect(() => {
    if (!api) return
    const onNew = ({ count }) => addLog(`Drive: 새 파일 ${count}개 다운로드 완료`, 'success')
    const onErr = (msg) => addLog(`Drive 오류: ${msg}`, 'error')
    api.on('drive:newFiles', onNew)
    api.on('drive:error', onErr)
    return () => { api.off('drive:newFiles', onNew); api.off('drive:error', onErr) }
  }, [addLog])

  const handleSelectLocal = useCallback(async () => {
    const folder = await api.selectFolder()
    if (!folder) return
    setLocalFolder(folder)
    const files = await api.scanFolder(folder)
    const newPlan = buildPlan(files)
    setPlan(newPlan)
    setSelected(newPlan.map(() => true))
    const jpgCount = newPlan.filter((p) => /\.(jpg|jpeg)$/i.test(p.src)).length
    addLog(`스캔 완료 — 사진 ${jpgCount}개`, 'info')
  }, [addLog])

  const handleSelectOutput = useCallback(async () => {
    const folder = await api.selectOutputFolder()
    if (!folder) return
    setOutputFolder(folder)
    api.driveSetOutputFolder?.(folder)
    addLog(`출력 폴더: ${folder}`, 'info')
  }, [addLog])

  // Drive 핸들러
  const handleDriveLogin = useCallback(async () => {
    addLog('브라우저에서 Google 로그인을 진행하세요…', 'info')
    const { ok, error } = await api.driveLogin()
    if (ok) { setDriveLoggedIn(true); addLog('Google 로그인 성공', 'success') }
    else addLog(`로그인 실패: ${error}`, 'error')
  }, [addLog])

  const handleDriveLogout = useCallback(async () => {
    await api.driveLogout()
    setDriveLoggedIn(false)
    setDrivePolling(false)
    addLog('Drive 로그아웃', 'info')
  }, [addLog])

  const handleDriveSync = useCallback(async () => {
    if (!outputFolder) { addLog('출력 폴더를 먼저 선택하세요', 'error'); return }
    setSyncing(true)
    addLog('Drive 동기화 중…', 'info')
    const { ok, count, error } = await api.driveSync(outputFolder)
    setSyncing(false)
    if (ok) addLog(`동기화 완료 — 새 파일 ${count}개`, count > 0 ? 'success' : 'info')
    else addLog(`동기화 실패: ${error}`, 'error')
  }, [outputFolder, addLog])

  const handleTogglePoll = useCallback(async () => {
    if (drivePolling) {
      await api.driveStopPoll()
      setDrivePolling(false)
      addLog('자동 동기화 중지', 'info')
    } else {
      if (!outputFolder) { addLog('출력 폴더를 먼저 선택하세요', 'error'); return }
      const { ok, error } = await api.driveStartPoll(pollInterval)
      if (ok) { setDrivePolling(true); addLog(`자동 동기화 시작 (${pollInterval}분 간격)`, 'success') }
      else addLog(`오류: ${error}`, 'error')
    }
  }, [drivePolling, outputFolder, pollInterval, addLog])

  // 로컬 파일 정리
  const handleToggle = useCallback((i) => setSelected((s) => s.map((v, idx) => idx === i ? !v : v)), [])
  const handleToggleAll = useCallback(() => setSelected((s) => s.map(() => !s.every(Boolean))), [])

  const handleOrganize = useCallback(async () => {
    if (!outputFolder) { addLog('출력 폴더를 선택하세요', 'error'); return }
    if (!localFolder) { addLog('원본 폴더를 선택하세요', 'error'); return }

    const jpgPlan = plan.filter((p) => /\.(jpg|jpeg)$/i.test(p.src))
    const selectedBases = new Set(jpgPlan.filter((_, i) => selected[i]).map((p) => p.src.replace(/\.[^.]+$/, '')))
    const selectedPlan = plan.filter((p) => selectedBases.has(p.src.replace(/\.[^.]+$/, '')))
    if (!selectedPlan.length) { addLog('선택된 파일이 없습니다', 'error'); return }

    setOrganizing(true)
    addLog(`${mode === 'copy' ? '복사' : '이동'} 시작 — ${selectedPlan.length}개 파일`, 'info')
    const results = await api.executeOrganize(selectedPlan, localFolder, outputFolder, mode)
    const ok = results.filter((r) => r.ok).length
    const fail = results.filter((r) => !r.ok)
    fail.forEach((r) => addLog(`실패: ${r.src} — ${r.error}`, 'error'))
    addLog(`완료 — 성공 ${ok}개${fail.length ? `, 실패 ${fail.length}개` : ''}`, fail.length ? 'error' : 'success')
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
          {jpgCount > 0 ? `사진 ${jpgCount}개 / ${selectedCount}개 선택됨` : '폴더를 선택하거나 Drive를 동기화하세요'}
        </span>
      </header>

      {/* 소스 바 */}
      <div style={{ padding: '10px 16px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* 로컬 폴더 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={handleSelectLocal} style={btn('#334155')}>로컬 폴더</button>
          <span style={{ fontSize: 12, color: localFolder ? '#e2e8f0' : '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {localFolder || '선택 안 됨'}
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: '#334155' }} />

        {/* Drive */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DRIVE</span>
          {driveLoggedIn ? (
            <>
              <button onClick={handleDriveSync} disabled={syncing} style={btn('#1d4ed8')}>
                {syncing ? '동기화 중…' : '지금 동기화'}
              </button>
              <button onClick={handleTogglePoll} style={btn(drivePolling ? '#7c3aed' : '#334155')}>
                {drivePolling ? `자동 ON (${pollInterval}분)` : '자동 OFF'}
              </button>
              {!drivePolling && (
                <select value={pollInterval} onChange={(e) => setPollInterval(Number(e.target.value))}
                  style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
                  {[1, 5, 10, 30].map((m) => <option key={m} value={m}>{m}분</option>)}
                </select>
              )}
              <button onClick={handleDriveLogout} style={{ ...btn('#334155'), color: '#f87171' }}>로그아웃</button>
            </>
          ) : (
            <button onClick={handleDriveLogin} style={btn('#059669')}>Google 로그인</button>
          )}
        </div>
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
        <select value={mode} onChange={(e) => setMode(e.target.value)}
          style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>
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
