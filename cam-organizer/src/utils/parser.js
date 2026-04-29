/**
 * txt 메모 파일 파싱
 * 형식:
 *   날짜: 2026-04-29
 *   현장: 삼성전기
 *   아이템: Fa6603d
 *   메모: 기타 내용
 */
export function parseMemo(text) {
  const lines = text.split('\n')
  const result = { 날짜: '', 현장: '', 아이템: '', 메모: '' }

  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (key in result) result[key] = val
  }

  // 아이템 필드 없으면 메모 첫 단어로 폴백
  if (!result['아이템'] && result['메모']) {
    result['아이템'] = result['메모'].split(/\s+/)[0]
  }

  return result
}

/**
 * 파일명에서 baseName 추출 (확장자 제거)
 * 예: "20260429_143052_삼성전기.jpg" → "20260429_143052_삼성전기"
 */
export function baseName(filename) {
  return filename.replace(/\.[^.]+$/, '')
}
