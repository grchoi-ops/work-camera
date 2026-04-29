import { parseMemo, baseName, getWeekLabel } from './parser.js'

/**
 * depth: 1 = 현장/주차
 *        2 = 현장/주차/아이템
 *        3 = 현장/주차/아이템/세부분류
 *        4 = 현장/아이템/세부분류 (주차 없음)
 * abbrMap: { sbh: 'shell bottom head', ... }
 */
export function buildPlan(files, { depth = 1, abbrMap = {} } = {}) {
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
    const dateStr = meta['날짜'] || base.slice(0, 10).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
    const week = getWeekLabel(dateStr)
    const item = meta['아이템'] || '기타'
    const subAbbr = meta['_subAbbr'] || ''
    const subFull = abbrMap[subAbbr] || subAbbr || '기타'

    const destDir = buildDestDir(site, week, item, subFull, depth)

    plan.push({ src: f.name, dest: `${destDir}/${f.name}`, site, week, item, sub: subFull, date: dateStr })

    const txtName = base + '.txt'
    if (memoMap[base]) {
      plan.push({ src: txtName, dest: `${destDir}/${txtName}`, site, week, item, sub: subFull, date: dateStr })
    }
  }

  return plan
}

function buildDestDir(site, week, item, sub, depth) {
  if (depth === 1) return `${site}/${week}`
  if (depth === 2) return `${site}/${week}/${item}`
  if (depth === 3) return `${site}/${week}/${item}/${sub}`
  return `${site}/${item}/${sub}` // depth === 4: 주차 없음
}
