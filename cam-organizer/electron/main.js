const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { setupDriveHandlers } = require('./driveSync')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 560,
    title: '업무사진 정리',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:4877')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  const win = createWindow()
  setupDriveHandlers(win)

  // 폴더 선택 다이얼로그
  ipcMain.handle('dialog:selectFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: '정리할 폴더 선택',
    })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('dialog:selectOutputFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory'],
      title: '저장할 폴더 선택',
    })
    return canceled ? null : filePaths[0]
  })

  // 폴더 스캔: jpg 목록 + 대응하는 txt 내용 반환
  ipcMain.handle('fs:scanFolder', async (_e, folderPath) => {
    const entries = fs.readdirSync(folderPath)
    const files = []
    for (const name of entries) {
      const lower = name.toLowerCase()
      if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.txt')) continue
      const entry = { name }
      if (lower.endsWith('.txt')) {
        entry.content = fs.readFileSync(path.join(folderPath, name), 'utf-8')
      }
      files.push(entry)
    }
    return files
  })

  // 파일 복사 또는 이동
  ipcMain.handle('fs:organize', async (_e, plan, srcFolder, destFolder, mode) => {
    const results = []
    for (const item of plan) {
      try {
        const src = path.join(srcFolder, item.src)
        const dest = path.join(destFolder, item.dest)
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        if (mode === 'move') {
          fs.renameSync(src, dest)
        } else {
          fs.copyFileSync(src, dest)
        }
        results.push({ src: item.src, dest: item.dest, ok: true })
      } catch (err) {
        results.push({ src: item.src, dest: item.dest, ok: false, error: err.message })
      }
    }
    return results
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
