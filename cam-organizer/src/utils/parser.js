/**
 * txt 메모 파일 파싱
 * 신형식: 날짜/현장/아이템/메모 필드
 * 구형식: 날짜/현장/메모 (메모 첫 단어=아이템, 두 번째 단어=세부분류약어)
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

  // 구형식 폴백: 메모 "6102a sbh" → 아이템=6102a, 세부분류약어=sbh
  if (!result['아이템'] && result['메모']) {
    const parts = result['메모'].split(/\s+/)
    result['아이템'] = parts[0] || ''
    result['_subAbbr'] = parts[1] || ''   // 내부용 세부분류 약어
  } else if (result['메모']) {
    // 신형식에서도 메모 첫 단어를 세부분류 약어로 사용
    result['_subAbbr'] = result['메모'].split(/\s+/)[0] || ''
  }

  return result
}

/**
 * 날짜 문자열(YYYY-MM-DD)로 "X월 Y주차" 반환
 */
export function getWeekLabel(dateStr) {
  if (!dateStr) return '날짜없음'
  const d = new Date(dateStr)
  if (isNaN(d)) return '날짜없음'
  const month = d.getMonth() + 1
  const week = Math.ceil(d.getDate() / 7)
  return `${month}월 ${week}주차`
}

/**
 * 파일명에서 baseName 추출 (확장자 제거)
 */
export function baseName(filename) {
  return filename.replace(/\.[^.]+$/, '')
}
