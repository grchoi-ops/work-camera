import { useState, useCallback } from 'react'

const STORAGE_KEY = 'work-camera:sites'
const LAST_SITE_KEY = 'work-camera:last-site'
const MAX_RECENT = 10

function loadSites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function loadLastSite() {
  return localStorage.getItem(LAST_SITE_KEY) ?? ''
}

export function useSites() {
  const [sites, setSites] = useState(loadSites)
  const [lastSite, setLastSiteState] = useState(loadLastSite)

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
    setLastSiteState((prev) => {
      if (prev !== name) return prev
      localStorage.removeItem(LAST_SITE_KEY)
      return ''
    })
  }, [])

  const selectSite = useCallback((name) => {
    const trimmed = name.trim()
    localStorage.setItem(LAST_SITE_KEY, trimmed)
    setLastSiteState(trimmed)
  }, [])

  return { sites, addSite, removeSite, lastSite, selectSite }
}
