export class AuthError extends Error {}

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const ROOT_FOLDER = '업무사진'

async function findFolder(token, name, parentId = null) {
  const q = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

  const res = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) {
    if (res.status === 401) throw new AuthError('토큰 만료')
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Drive 폴더 조회 실패')
  }
  const data = await res.json()
  return data.files?.[0]?.id ?? null
}

async function createFolder(token, name, parentId = null) {
  const meta = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  }
  const res = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meta),
  })
  if (!res.ok) {
    if (res.status === 401) throw new AuthError('토큰 만료')
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Drive 폴더 생성 실패')
  }
  const data = await res.json()
  return data.id
}

async function ensureFolder(token, name, parentId = null) {
  const existing = await findFolder(token, name, parentId)
  return existing ?? (await createFolder(token, name, parentId))
}

async function uploadFile(token, blob, filename, mimeType, folderId) {
  const meta = { name: filename, parents: [folderId] }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
  form.append('file', new Blob([blob], { type: mimeType }))

  const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    if (res.status === 401) throw new AuthError('토큰 만료')
    const err = await res.json()
    throw new Error(err.error?.message ?? '업로드 실패')
  }
  return res.json()
}

export async function uploadToDrive(token, { imageBlob, memoText, baseName, siteName }) {
  const rootId = await ensureFolder(token, ROOT_FOLDER)
  const siteId = await ensureFolder(token, siteName, rootId)

  const imgResult = await uploadFile(token, imageBlob, `${baseName}.jpg`, 'image/jpeg', siteId)

  if (memoText) {
    const txtBlob = new TextEncoder().encode(memoText)
    await uploadFile(token, txtBlob, `${baseName}.txt`, 'text/plain', siteId)
  }

  return imgResult
}
