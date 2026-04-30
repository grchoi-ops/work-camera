import { useRef, useState, useCallback, useEffect } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1600 }, height: { ideal: 1200 }, aspectRatio: { ideal: 4 / 3 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setReady(true)
      }
    } catch (e) {
      setError(e.message ?? '카메라를 사용할 수 없습니다')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video) return null
    const TARGET_W = 1600
    const TARGET_H = 1200
    const vw = video.videoWidth
    const vh = video.videoHeight
    // center-crop to 4:3 then scale to 1600x1200
    const srcAspect = vw / vh
    const tgtAspect = TARGET_W / TARGET_H
    let sx, sy, sw, sh
    if (srcAspect > tgtAspect) {
      sh = vh
      sw = vh * tgtAspect
      sx = (vw - sw) / 2
      sy = 0
    } else {
      sw = vw
      sh = vw / tgtAspect
      sx = 0
      sy = (vh - sh) / 2
    }
    const canvas = document.createElement('canvas')
    canvas.width = TARGET_W
    canvas.height = TARGET_H
    canvas.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H)
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95)
    )
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  return { videoRef, ready, error, startCamera, stopCamera, capture }
}
