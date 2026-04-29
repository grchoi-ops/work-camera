import { useState, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { uploadToDrive } from '../utils/driveApi'

export function useDrive() {
  const [token, setToken] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [error, setError] = useState(null)

  const runUpload = useCallback(async (tok, params) => {
    setUploading(true)
    setError(null)
    try {
      const result = await uploadToDrive(tok, params)
      setLastResult(result)
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setUploading(false)
    }
  }, [])

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: (res) => {
      setToken(res.access_token)
    },
    onError: (e) => {
      setError('Google 로그인 실패: ' + (e.error_description ?? e.error))
    },
  })

  const upload = useCallback(
    (getParams) => {
      setUploading(true)
      return getParams()
        .then((params) => runUpload(token, params))
        .catch((e) => { setUploading(false); throw e })
    },
    [token, runUpload]
  )

  return { token, uploading, lastResult, error, upload, login }
}
