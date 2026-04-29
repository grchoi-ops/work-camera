import { useState, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { uploadToDrive, AuthError } from '../utils/driveApi'

export function useDrive() {
  const [token, setToken] = useState(null)
  const [tokenExpiry, setTokenExpiry] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [error, setError] = useState(null)

  const expireToken = useCallback(() => {
    setToken(null)
    setTokenExpiry(0)
  }, [])

  const runUpload = useCallback(async (tok, params) => {
    setUploading(true)
    setError(null)
    try {
      const result = await uploadToDrive(tok, params)
      setLastResult(result)
      return result
    } catch (e) {
      if (e instanceof AuthError) expireToken()
      setError(e.message)
      throw e
    } finally {
      setUploading(false)
    }
  }, [expireToken])

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: (res) => {
      setToken(res.access_token)
      setTokenExpiry(Date.now() + (res.expires_in ?? 3600) * 1000)
    },
    onError: (e) => {
      setError('Google 로그인 실패: ' + (e.error_description ?? e.error))
    },
  })

  const upload = useCallback(
    (getParams) => {
      // 만료 1분 전부터 재로그인 유도
      if (!token || Date.now() > tokenExpiry - 60_000) {
        expireToken()
        return Promise.reject(new Error('로그인이 만료됐습니다. 다시 로그인해 주세요.'))
      }
      setUploading(true)
      return getParams()
        .then((params) => runUpload(token, params))
        .catch((e) => { setUploading(false); throw e })
    },
    [token, tokenExpiry, expireToken, runUpload]
  )

  return { token, uploading, lastResult, error, upload, login }
}
