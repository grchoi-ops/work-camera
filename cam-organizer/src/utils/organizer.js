import { parseMemo, baseName } from './parser.js'

/**
 * 파일 목록(jpg+txt 쌍)을 스캔해 분류 계획을 반환한다.
 * @param {Array<{name: string, content?: string}>} files - txt 파일은 content 포함
 * @returns {Array<{src: string, dest: string, site: string, item: string, date: string}>}
 */
export function buildPlan(files) {
  // txt 파일 맵 구성 (baseName → parsed)
  const memoMap = {}
  for (const f of files) {
    if (f.name.toLowerCase().endsWith('.txt') && f.content) {
      memoMap[baseName(f.name)] = parseMemo(f.content)
    }
  }

  const plan = []
  for (const f of files) {
    if (!f.name.toLowerCase().endsWith('.jpg') && !f.name.toLowerCase().endsWith('.jpeg')) continue

    const base = baseName(f.name)
    const meta = memoMap[base] ?? {}
    const site = meta['현장'] || '미분류'
    const item = meta['아이템'] || '기타'
    const date = meta['날짜'] || base.slice(0, 10).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')

    plan.push({ src: f.name, dest: `${site}/${item}/${f.name}`, site, item, date })

    // 짝이 되는 txt도 같은 위치로
    const txtName = base + '.txt'
    if (memoMap[base]) {
      plan.push({ src: txtName, dest: `${site}/${item}/${txtName}`, site, item, date })
    }
  }

  return plan
}
