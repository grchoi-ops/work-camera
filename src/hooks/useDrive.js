import { useState, useCallback, useRef } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { uploadToDrive } from '../utils/driveApi'

export function useDrive() {
  const [token, setToken] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [error, setError] = useState(null)
  const pendingRef = useRef(null)

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
    onSuccess: async (res) => {
      setToken(res.access_token)
      if (pendingRef.current) {
        const { params, resolve, reject } = pendingRef.current
        pendingRef.current = null
        try {
          resolve(await runUpload(res.access_token, params))
        } catch (e) {
          reject(e)
        }
      }
    },
    onError: (e) => {
      const msg = 'Google 로그인 실패: ' + (e.error_description ?? e.error)
      setError(msg)
      setUploading(false)
      if (pendingRef.current) {
        pendingRef.current.reject(new Error(msg))
        pendingRef.current = null
      }
    },
  })

  const upload = useCallback(
    async (params) => {
      if (!token) {
        setUploading(true)
        return new Promise((resolve, reject) => {
          pendingRef.current = { params, resolve, reject }
          login()
        })
      }
      return runUpload(token, params)
    },
    [token, login, runUpload]
  )

  return { token, uploading, lastResult, error, upload, login }
}
