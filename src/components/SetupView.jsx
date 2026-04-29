import { useState } from 'react'

export function SetupView({ defaultClientId = '', onSave }) {
  const [clientId, setClientId] = useState(defaultClientId)
  const [error, setError] = useState('')

  function handleSave() {
    const trimmed = clientId.trim()
    if (!trimmed) { setError('Client ID를 입력하세요'); return }
    if (!trimmed.includes('.apps.googleusercontent.com')) {
      setError('올바른 Google Client ID 형식이 아닙니다')
      return
    }
    onSave(trimmed)
  }

  return (
    <div className="min-h-dvh bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-white text-xl font-bold mb-1">업무 카메라 초기 설정</h1>
          <p className="text-slate-400 text-sm">Google Drive 연동을 위해 OAuth Client ID를 입력하세요</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3 text-sm text-slate-300">
          <p className="font-medium text-slate-200">설정 방법</p>
          <ol className="list-decimal list-inside flex flex-col gap-1 text-slate-400">
            <li>Google Cloud Console 접속 → 프로젝트 선택</li>
            <li>API 및 서비스 → 사용자 인증 정보</li>
            <li>OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)</li>
            <li>이 앱의 주소를 승인된 출처에 추가</li>
            <li>생성된 클라이언트 ID 복사 후 아래 입력</li>
          </ol>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">Google OAuth Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => { setClientId(e.target.value); setError('') }}
            placeholder="xxxxxxxxxx.apps.googleusercontent.com"
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium active:brightness-90"
        >
          저장하고 시작
        </button>
      </div>
    </div>
  )
}
