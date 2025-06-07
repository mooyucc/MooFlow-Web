const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'MooPlan',
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  win.loadFile(path.join(__dirname, 'dist/index.html'));
  win.webContents.openDevTools();
}

// 导入文件
ipcMain.handle('import-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '导入文件',
    properties: ['openFile'],
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'CSV', extensions: ['csv'] },
      { name: 'Excel', extensions: ['xls', 'xlsx'] },
      { name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif'] }
    ]
  });
  if (canceled || !filePaths[0]) return { canceled: true };
  const filePath = filePaths[0];
  const content = fs.readFileSync(filePath);
  return { canceled: false, filePath, content: content.toString('base64') };
});

// 导出文件
ipcMain.handle('export-file', async (event, { content, defaultPath }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '导出文件',
    defaultPath: defaultPath || 'export.txt',
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'CSV', extensions: ['csv'] },
      { name: 'Excel', extensions: ['xls', 'xlsx'] },
      { name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif'] }
    ]
  });
  if (canceled || !filePath) return { canceled: true };
  fs.writeFileSync(filePath, Buffer.from(content, 'base64'));
  return { canceled: false, filePath };
});

// 自动保存本地数据
ipcMain.handle('auto-save', (event, { filename, data }) => {
  const savePath = path.join(app.getPath('userData'), filename || 'autosave.json');
  fs.writeFileSync(savePath, JSON.stringify(data), 'utf-8');
  return { success: true, savePath };
});

// 加载本地自动保存数据
ipcMain.handle('load-auto-save', (event, { filename }) => {
  const savePath = path.join(app.getPath('userData'), filename || 'autosave.json');
  if (fs.existsSync(savePath)) {
    const content = fs.readFileSync(savePath, 'utf-8');
    return { success: true, data: JSON.parse(content) };
  }
  return { success: false };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
}); 