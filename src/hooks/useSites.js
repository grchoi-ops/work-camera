import { useState, useCallback } from 'react'

const STORAGE_KEY = 'work-camera:sites'
const MAX_RECENT = 10

function loadSites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useSites() {
  const [sites, setSites] = useState(loadSites)

  const addSite = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSites((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeSite = useCallback((name) => {
    setSites((prev) => {
      const next = prev.filter((s) => s !== name)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { sites, addSite, removeSite }
}
