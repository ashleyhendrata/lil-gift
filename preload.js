const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lilGift', {
  hasKey: () => ipcRenderer.invoke('has-key'),
  saveKey: (k) => ipcRenderer.invoke('save-key', k),
  generate: (p) => ipcRenderer.invoke('generate', p),
  send: (g) => ipcRenderer.invoke('send', g),
  getRoom: () => ipcRenderer.invoke('get-room'),
  setRoom: (c) => ipcRenderer.invoke('set-room', c),
  newRoom: () => ipcRenderer.invoke('new-room'),
  onSyncStatus: (cb) => ipcRenderer.on('sync-status', (_e, t) => cb(t)),
  onGift: (cb) => ipcRenderer.on('gift', (_e, g) => cb(g)),
});
