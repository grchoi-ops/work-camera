const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 로컬 파일
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  selectOutputFolder: () => ipcRenderer.invoke('dialog:selectOutputFolder'),
  scanFolder: (folderPath) => ipcRenderer.invoke('fs:scanFolder', folderPath),
  executeOrganize: (plan, srcFolder, destFolder, mode) =>
    ipcRenderer.invoke('fs:organize', plan, srcFolder, destFolder, mode),

  // Drive
  driveLogin: () => ipcRenderer.invoke('drive:login'),
  driveLogout: () => ipcRenderer.invoke('drive:logout'),
  getDriveLoginState: () => ipcRenderer.invoke('drive:getLoginState'),
  driveSync: (destFolder) => ipcRenderer.invoke('drive:sync', destFolder),
  driveStartPoll: (intervalMin) => ipcRenderer.invoke('drive:startPoll', intervalMin),
  driveStopPoll: () => ipcRenderer.invoke('drive:stopPoll'),
  driveSetOutputFolder: (folder) => ipcRenderer.invoke('drive:setOutputFolder', folder),

  // 이벤트
  on: (channel, fn) => {
    const allowed = ['drive:newFiles', 'drive:error']
    if (allowed.includes(channel)) ipcRenderer.on(channel, (_e, ...args) => fn(...args))
  },
  off: (channel, fn) => ipcRenderer.removeListener(channel, fn),
})
