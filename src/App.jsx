import { useState, useCallback } from 'react'
import { SiteSelector } from './components/SiteSelector'
import { CameraView } from './components/CameraView'
import { PreviewView } from './components/PreviewView'
import { UploadStatus } from './components/UploadStatus'
import { useCamera } from './hooks/useCamera'
import { useSites } from './hooks/useSites'
import { useDrive } from './hooks/useDrive'
import { compressImage } from './utils/compress'
import { buildFilename, buildMemoText } from './utils/filename'

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | preview | done
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [memo, setMemo] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const { videoRef, ready, error: camError, startCamera, stopCamera, capture } = useCamera()
  const { sites, addSite, removeSite, lastSite: siteName, selectSite: setSiteName } = useSites()
  const { uploading, upload } = useDrive()

  const handleCapture = useCallback(async () => {
    const blob = await capture()
    if (!blob) return
    stopCamera()
    const url = URL.createObjectURL(blob)
    setCapturedBlob(blob)
    setPreviewUrl(url)
    setMemo('')
    setPhase('preview')
  }, [capture, stopCamera])

  const handleRetake = useCallback(() => {
    URL.revokeObjectURL(previewUrl)
    setCapturedBlob(null)
    setPreviewUrl(null)
    setPhase('idle')
  }, [previewUrl])

  const handleUpload = useCallback(() => {
    const site = siteName.trim() || '현장'
    const baseName = buildFilename(site)
    const memoText = memo.trim() ? buildMemoText(site, memo) : null

    // getParams는 login() 이후 호출 — await 없이 upload()에 전달해 팝업 차단 방지
    const getParams = async () => {
      const compressed = await compressImage(capturedBlob)
      return { imageBlob: compressed, memoText, baseName, siteName: site }
    }

    upload(getParams)
      .then((result) => {
        if (siteName.trim()) addSite(siteName.trim())
        setUploadResult(result ?? { name: baseName + '.jpg' })
        setPhase('done')
      })
      .catch((e) => {
        setUploadError(e?.message ?? '업로드 실패')
        setPhase('done')
      })
  }, [siteName, memo, capturedBlob, upload, addSite])

  const handleStatusClose = useCallback(() => {
    URL.revokeObjectURL(previewUrl)
    setCapturedBlob(null)
    setPreviewUrl(null)
    setUploadResult(null)
    setUploadError(null)
    setPhase('idle')
  }, [previewUrl])

  return (
    <div className="min-h-dvh bg-slate-900 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col min-h-dvh p-4 gap-3">
        {/* 헤더 */}
        <header className="flex items-center justify-between py-1">
          <h1 className="text-white font-bold text-lg">업무 카메라</h1>
          <span className="text-slate-500 text-xs">개인사진 미저장</span>
        </header>

        {/* 현장명 선택 */}
        <SiteSelector
          value={siteName}
          onChange={setSiteName}
          sites={sites}
          onAddSite={addSite}
          onRemoveSite={removeSite}
        />

        {/* 카메라 or 미리보기 */}
        {phase === 'idle' && (
          <CameraView
            videoRef={videoRef}
            ready={ready}
            error={camError}
            onStart={startCamera}
            onCapture={handleCapture}
            siteName={siteName}
          />
        )}

        {(phase === 'preview' || phase === 'done') && previewUrl && (
          <PreviewView
            imageUrl={previewUrl}
            memo={memo}
            onMemoChange={setMemo}
            onRetake={handleRetake}
            onUpload={handleUpload}
            uploading={uploading}
          />
        )}
      </div>

      {/* 업로드 결과 팝업 */}
      {phase === 'done' && (
        <UploadStatus
          result={uploadResult}
          error={uploadError}
          onClose={handleStatusClose}
        />
      )}
    </div>
  )
}
