const { ipcMain, shell, app } = require('electron')
const { google } = require('googleapis')
const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')

// --- 간단한 JSON 영속 저장소 ---
const storePath = path.join(app.getPath('userData'), 'cam-organizer-store.json')

const store = {
  _read() {
    try { return JSON.parse(fs.readFileSync(storePath, 'utf-8')) } catch { return {} }
  },
  get(key, def = null) { return this._read()[key] ?? def },
  set(key, val) {
    const data = this._read()
    data[key] = val
    fs.writeFileSync(storePath, JSON.stringify(data))
  },
  delete(key) {
    const data = this._read()
    delete data[key]
    fs.writeFileSync(storePath, JSON.stringify(data))
  },
}

// --- OAuth 설정 ---
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET || ''
const REDIRECT_URI = 'http://localhost:42813/oauth2callback'
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
const ROOT_FOLDER = '업무사진'

let oauth2Client = null
let pollTimer = null
let mainWindow = null

function getOAuth2Client() {
  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    const saved = store.get('driveTokens')
    if (saved) oauth2Client.setCredentials(saved)
  }
  return oauth2Client
}

async function loginWithBrowser() {
  const client = getOAuth2Client()
  const authUrl = client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' })

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const parsed = url.parse(req.url, true)
      if (parsed.pathname !== '/oauth2callback') return
      res.end('<h2 style="font-family:sans-serif">로그인 성공! 이 창을 닫으세요.</h2>')
      server.close()
      try {
        const { tokens } = await client.getToken(parsed.query.code)
        client.setCredentials(tokens)
        store.set('driveTokens', tokens)
        resolve(tokens)
      } catch (e) { reject(e) }
    })
    server.listen(42813, () => shell.openExternal(authUrl))
    server.on('error', reject)
  })
}

async function getRootFolderId(drive) {
  const res = await drive.files.list({
    q: `name='${ROOT_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  })
  return res.data.files?.[0]?.id ?? null
}

async function fetchNewFiles(drive, rootId) {
  const seenIds = new Set(store.get('seenFileIds', []))

  const sitesRes = await drive.files.list({
    q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id,name)',
    pageSize: 100,
  })

  const newFiles = []
  for (const folder of sitesRes.data.files) {
    const res = await drive.files.list({
      q: `'${folder.id}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 200,
    })
    for (const f of res.data.files) {
      if (!seenIds.has(f.id)) newFiles.push({ ...f, siteName: folder.name })
    }
  }
  return newFiles
}

async function downloadFiles(drive, files, destFolder) {
  const downloaded = []
  for (const f of files) {
    if (f.mimeType === 'application/vnd.google-apps.folder') continue
    const siteDir = path.join(destFolder, f.siteName)
    fs.mkdirSync(siteDir, { recursive: true })
    const dest = path.join(siteDir, f.name)
    const res = await drive.files.get({ fileId: f.id, alt: 'media' }, { responseType: 'stream' })
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(dest)
      res.data.pipe(ws)
      ws.on('finish', resolve)
      ws.on('error', reject)
    })
    downloaded.push({ name: f.name, siteName: f.siteName, localPath: dest })
  }
  return downloaded
}

async function syncDrive(destFolder) {
  const client = getOAuth2Client()
  if (!client.credentials?.access_token) throw new Error('로그인이 필요합니다')

  const drive = google.drive({ version: 'v3', auth: client })
  const rootId = await getRootFolderId(drive)
  if (!rootId) return { count: 0, files: [] }

  const newFiles = await fetchNewFiles(drive, rootId)
  if (newFiles.length === 0) return { count: 0, files: [] }

  const downloaded = await downloadFiles(drive, newFiles, destFolder)
  const seenIds = store.get('seenFileIds', [])
  store.set('seenFileIds', [...seenIds, ...newFiles.map((f) => f.id)])

  return { count: downloaded.length, files: downloaded }
}

function setupDriveHandlers(win) {
  mainWindow = win

  ipcMain.handle('drive:login', async () => {
    try { await loginWithBrowser(); return { ok: true } }
    catch (e) { return { ok: false, error: e.message } }
  })

  ipcMain.handle('drive:logout', () => {
    store.delete('driveTokens')
    store.delete('seenFileIds')
    oauth2Client = null
    return { ok: true }
  })

  ipcMain.handle('drive:getLoginState', () => {
    const tokens = store.get('driveTokens')
    return { loggedIn: !!(tokens?.access_token) }
  })

  ipcMain.handle('drive:sync', async (_e, destFolder) => {
    try { return { ok: true, ...(await syncDrive(destFolder)) } }
    catch (e) { return { ok: false, error: e.message } }
  })

  ipcMain.handle('drive:startPoll', (_e, intervalMin = 5) => {
    if (pollTimer) clearInterval(pollTimer)
    const destFolder = store.get('outputFolder', '')
    if (!destFolder) return { ok: false, error: '출력 폴더를 먼저 설정하세요' }

    pollTimer = setInterval(async () => {
      try {
        const result = await syncDrive(destFolder)
        if (result.count > 0) mainWindow?.webContents.send('drive:newFiles', result)
      } catch (e) {
        mainWindow?.webContents.send('drive:error', e.message)
      }
    }, intervalMin * 60 * 1000)

    return { ok: true }
  })

  ipcMain.handle('drive:stopPoll', () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
    return { ok: true }
  })

  ipcMain.handle('drive:setOutputFolder', (_e, folder) => {
    store.set('outputFolder', folder)
    return { ok: true }
  })
}

module.exports = { setupDriveHandlers }
