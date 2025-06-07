const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (...args) => ipcRenderer.invoke(...args)
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  importFile: async () => {
    // 返回 { canceled, filePath, content }
    return await ipcRenderer.invoke('import-file');
  },
  exportFile: async (content, defaultPath) => {
    // content 需为 base64 字符串
    return await ipcRenderer.invoke('export-file', { content, defaultPath });
  },
  autoSave: async (data, filename) => {
    return await ipcRenderer.invoke('auto-save', { data, filename });
  },
  loadAutoSave: async (filename) => {
    return await ipcRenderer.invoke('load-auto-save', { filename });
  }
}); 