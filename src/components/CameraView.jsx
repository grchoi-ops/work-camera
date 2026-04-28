import { useEffect } from 'react'

export function CameraView({ videoRef, ready, error, onStart, onCapture, siteName }) {
  useEffect(() => {
    onStart()
  }, [onStart])

  return (
    <div className="relative w-full flex-1 bg-black flex items-center justify-center overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-sm animate-pulse">카메라 시작 중…</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
          <button
            onClick={onStart}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 촬영 버튼 */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={onCapture}
          disabled={!ready}
          className="w-16 h-16 rounded-full bg-white border-4 border-blue-500 shadow-lg active:scale-95 transition-transform disabled:opacity-40"
          aria-label="촬영"
        />
      </div>

      {/* 현장명 표시 */}
      {siteName && (
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {siteName}
        </div>
      )}
    </div>
  )
}
