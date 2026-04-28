export function UploadStatus({ result, error, onClose }) {
  if (!result && !error) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 pb-8 px-4">
      <div className={`w-full max-w-sm rounded-2xl p-5 shadow-xl ${result ? 'bg-green-800' : 'bg-red-900'}`}>
        {result ? (
          <>
            <p className="text-white font-semibold text-lg mb-1">업로드 완료!</p>
            <p className="text-green-200 text-sm break-all">{result.name}</p>
            {result.webViewLink && (
              <a
                href={result.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 underline text-xs mt-1 block"
              >
                Drive에서 보기
              </a>
            )}
          </>
        ) : (
          <>
            <p className="text-white font-semibold text-lg mb-1">업로드 실패</p>
            <p className="text-red-200 text-sm">{error}</p>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-white/20 text-white text-sm font-medium"
        >
          확인
        </button>
      </div>
    </div>
  )
}
