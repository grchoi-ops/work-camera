export function buildFilename(siteName) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate())
  const time =
    pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds())
  const safe = siteName.trim().replace(/[\\/:*?"<>|]/g, '_') || '현장'
  return `${date}_${time}_${safe}`
}

export function buildMemoText(siteName, memo) {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `날짜: ${dateStr}\n현장: ${siteName}\n메모: ${memo || ''}`
}
