const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lilGift', {
  hasKey: () => ipcRenderer.invoke('has-key'),
  saveKey: (k) => ipcRenderer.invoke('save-key', k),
  generate: (p) => ipcRenderer.invoke('generate', p),
  send: (g) => ipcRenderer.invoke('send', g),
  onGift: (cb) => ipcRenderer.on('gift', (_e, g) => cb(g)),
});
