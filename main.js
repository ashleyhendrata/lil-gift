const { app, BrowserWindow, ipcMain, screen, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');
const { generate } = require('./src/generate');
const { sanitize } = require('./src/sceneSpec');
const { createLocalSync } = require('./src/sync');

const keyFile = () => path.join(app.getPath('userData'), 'anthropic-key.bin');
const sync = createLocalSync();
let widget, sender;

function loadKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try { return safeStorage.decryptString(fs.readFileSync(keyFile())); } catch { return null; }
}

function createWidget() {
  const { workArea } = screen.getPrimaryDisplay();
  const size = 320;
  widget = new BrowserWindow({
    width: size, height: size + 60,
    x: workArea.x + workArea.width - size - 24, y: workArea.y + 24,
    transparent: true, frame: false, hasShadow: false, resizable: false,
    alwaysOnTop: true, skipTaskbar: true, focusable: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  widget.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  widget.setAlwaysOnTop(true, 'floating');
  widget.loadFile('src/widget.html');
  sync.subscribe((gift) => widget.webContents.send('gift', gift));
}

function createSender() {
  sender = new BrowserWindow({
    width: 460, height: 640, title: 'lil gift',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  sender.loadFile('src/sender.html');
}

ipcMain.handle('has-key', () => !!loadKey());
ipcMain.handle('save-key', (_e, key) => {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure storage unavailable');
  fs.writeFileSync(keyFile(), safeStorage.encryptString(key.trim()));
});
ipcMain.handle('generate', async (_e, prompt) => {
  const key = loadKey();
  if (!key) throw new Error('Add your Anthropic API key first');
  return generate(String(prompt).slice(0, 500), key);
});
ipcMain.handle('send', (_e, gift) => sync.publish(sanitize(gift)));

app.whenReady().then(() => { createWidget(); createSender(); });
app.on('window-all-closed', () => app.quit());
