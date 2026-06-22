import { create } from 'zustand';
import { useCanvasSettingsStore } from './canvasSettingsStore';
import { isNewFileTabRequest, isOpenFileTabRequest } from '../utils/newFileTab';
import { LINKED_FILE_PATH_KEY } from '../utils/localFileHandle';

const FILES_KEY = 'moo_files';
const ACTIVE_FILE_KEY = 'moo_active_file_id';

export function hasPersistedTabSession() {
  const storage = typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  return Boolean(storage?.getItem(FILES_KEY));
}

function getProjectStorage() {
  return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
}

export function createDefaultFile(direction = 'horizontal') {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return {
    id: Date.now(),
    name: `MF${timeStr}`,
    tasks: [
      {
        id: 1,
        title: '中心任务',
        position: { x: 100, y: 100 },
        links: [],
        lock: true,
        parentId: null,
        level: 0,
        date: new Date().toISOString(),
        collapsed: false,
      },
    ],
    paletteIdx: null,
    mainDirection: direction,
    timeScale: 'month',
  };
}

function loadFiles() {
  if (isNewFileTabRequest() || isOpenFileTabRequest()) {
    return [createDefaultFile()];
  }

  const storage = getProjectStorage();
  try {
    if (storage) {
      const saved = storage.getItem(FILES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeId = loadActiveFileId(parsed);
          const active = parsed.find(f => String(f.id) === String(activeId)) || parsed[0];
          return [active];
        }
      }
    }
  } catch {
    // ignore
  }
  return [createDefaultFile()];
}

function loadActiveFileId(files) {
  try {
    const storage = getProjectStorage();
    const savedId = storage?.getItem(ACTIVE_FILE_KEY);
    if (savedId && files.some(f => String(f.id) === String(savedId))) {
      return typeof files[0].id === 'number' ? Number(savedId) : savedId;
    }
  } catch {
    // ignore
  }
  return files[0]?.id;
}

function tryPersist(key, data) {
  const storage = getProjectStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`写入 ${key} 失败:`, error);
    return false;
  }
}

function tryPersistActiveId(activeFileId) {
  const storage = getProjectStorage();
  if (!storage) return;
  try {
    storage.setItem(ACTIVE_FILE_KEY, String(activeFileId));
  } catch {
    // ignore
  }
}

const initialFiles = loadFiles();

export const useFileStore = create((set, get) => ({
  files: initialFiles,
  activeFileId: loadActiveFileId(initialFiles),

  setFiles: (updater) => set((state) => {
    const raw = typeof updater === 'function' ? updater(state.files) : updater;
    const list = Array.isArray(raw) ? raw : [raw];
    const next = list.length > 0 ? [list[list.length - 1]] : [createDefaultFile()];
    tryPersist(FILES_KEY, next);
    return { files: next };
  }),

  setActiveFileId: (activeFileId) => {
    tryPersistActiveId(activeFileId);
    set({ activeFileId });
  },

  getActiveFile: () => {
    const { files, activeFileId } = get();
    return files.find(f => f.id === activeFileId);
  },

  saveActiveFileMeta: () => {
    const { canvasProps, timeScale } = useCanvasSettingsStore.getState();
    get().setFiles(prev => prev.map(f =>
      f.id === get().activeFileId
        ? {
          ...f,
          mainDirection: canvasProps.mainDirection || 'horizontal',
          timeScale: timeScale || 'month',
        }
        : f
    ));
  },

  updateActiveFile: (partial) => {
    get().setFiles(prev => prev.map(f =>
      f.id === get().activeFileId ? { ...f, ...partial } : f
    ));
  },

  renameFile: (fileId, name) => {
    get().setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, name: name.trim() } : f
    ));
  },

  setPaletteIdx: (idx) => {
    get().setFiles(prev => prev.map(f =>
      f.id === get().activeFileId ? { ...f, paletteIdx: idx } : f
    ));
  },

  cleanupLocalStorage: () => {
    try {
      const { activeFileId, files } = get();
      const currentFiles = files.filter(f => f.id === activeFileId);
      if (currentFiles.length > 0) {
        tryPersist(FILES_KEY, currentFiles);
      }
    } catch (error) {
      console.error('清理 sessionStorage 失败:', error);
    }
  },

  clearTabSession: () => {
    const storage = getProjectStorage();
    storage?.removeItem(FILES_KEY);
    storage?.removeItem(ACTIVE_FILE_KEY);
    storage?.removeItem(LINKED_FILE_PATH_KEY);
    set({ files: [], activeFileId: null });
  },

  clearAllPersisted: () => {
    const storage = getProjectStorage();
    storage?.removeItem(FILES_KEY);
    storage?.removeItem(ACTIVE_FILE_KEY);
    localStorage.removeItem(FILES_KEY);
    localStorage.removeItem(ACTIVE_FILE_KEY);
    localStorage.removeItem('moo_files_history');
  },
}));
