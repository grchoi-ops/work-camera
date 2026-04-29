import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { SetupView } from './components/SetupView'

const STORAGE_KEY = 'work-camera:clientId'
const ENV_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function Root() {
  const [clientId, setClientId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
    // .env.local에 Client ID가 있으면 자동으로 사용 (기존 개발 환경 호환)
    if (ENV_CLIENT_ID) { localStorage.setItem(STORAGE_KEY, ENV_CLIENT_ID); return ENV_CLIENT_ID }
    return ''
  })

  function handleSave(id) {
    localStorage.setItem(STORAGE_KEY, id)
    setClientId(id)
  }

  if (!clientId) return <SetupView onSave={handleSave} />

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <App onResetClientId={() => { localStorage.removeItem(STORAGE_KEY); setClientId('') }} />
    </GoogleOAuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
