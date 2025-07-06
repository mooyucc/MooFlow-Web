const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'MooFlow',
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // 允许本地资源加载
    }
  });
  if (app.isPackaged) {
    // 生产环境，加载打包后的页面
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  } else {
    // 开发环境，加载 Vite 本地服务
    win.loadURL('http://localhost:5173');
  }
  // win.webContents.openDevTools(); // 正式版可以注释掉
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

// 聊天历史记录处理
ipcMain.handle('append-chat-history', async (event, chatData) => {
  const historyPath = path.join(__dirname, 'ChatHistory.md');
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  try {
    let content = '';
    if (fs.existsSync(historyPath)) {
      content = fs.readFileSync(historyPath, 'utf-8');
    }

    // 检查今天的日期是否已存在
    const dateHeader = `## ${dateStr}`;
    if (!content.includes(dateHeader)) {
      // 如果是新的一天，在文件开头添加新的日期部分（在文件头和第一个日期标题之间）
      const lines = content.split('\n');
      const firstDateIndex = lines.findIndex(line => line.startsWith('## '));
      
      if (firstDateIndex === -1) {
        // 如果没有任何日期标题，直接添加到文件末尾
        content += `\n${dateHeader}\n`;
      } else {
        // 在第一个日期标题之前插入新的日期部分
        lines.splice(firstDateIndex, 0, `${dateHeader}\n`);
        content = lines.join('\n');
      }
    }

    // 在对应的日期下添加新的聊天记录
    const lines = content.split('\n');
    const dateIndex = lines.findIndex(line => line === dateHeader);
    if (dateIndex !== -1) {
      // 在日期标题后插入新的聊天记录
      lines.splice(dateIndex + 1, 0, `- ${chatData.title}`);
      content = lines.join('\n');
    }

    fs.writeFileSync(historyPath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error appending chat history:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-chat-history', async () => {
  const historyPath = path.join(__dirname, 'ChatHistory.md');
  try {
    if (fs.existsSync(historyPath)) {
      const content = fs.readFileSync(historyPath, 'utf-8');
      return { success: true, content };
    }
    return { success: false, error: 'History file not found' };
  } catch (error) {
    console.error('Error loading chat history:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
}); 