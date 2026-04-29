import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { SetupView } from './components/SetupView'

const STORAGE_KEY = 'work-camera:clientId'
const ENV_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function Root() {
  const [clientId, setClientId] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')

  function handleSave(id) {
    localStorage.setItem(STORAGE_KEY, id)
    setClientId(id)
  }

  if (!clientId) return <SetupView defaultClientId={ENV_CLIENT_ID} onSave={handleSave} />

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
