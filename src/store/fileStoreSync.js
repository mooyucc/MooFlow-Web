import { useFileStore } from './fileStore';
import { useTaskStore } from './taskStore';

export const FILE_STORAGE_KEYS = {
  FILES: 'moo_files',
  ACTIVE: 'moo_active_file_id',
};

function parseActiveFileId(raw, files) {
  if (!raw || !files?.length) return files?.[0]?.id;
  const id = typeof files[0].id === 'number' ? Number(raw) : raw;
  return files.some(f => String(f.id) === String(id)) ? id : files[0]?.id;
}

function reloadTasksFromActiveFile() {
  const { files, activeFileId } = useFileStore.getState();
  const file = files.find(f => f.id === activeFileId);
  if (!file) return;

  const { importTasks } = useTaskStore.getState();
  importTasks(file.tasks || []);
}

/** 处理 storage 事件（可单独测试） */
export function handleStorageSyncEvent(event) {
  if (!event.newValue) return;

  try {
    if (event.key === FILE_STORAGE_KEYS.FILES) {
      const files = JSON.parse(event.newValue);
      const normalized = Array.isArray(files) && files.length > 0 ? [files[0]] : files;
      useFileStore.setState({ files: normalized });
      reloadTasksFromActiveFile();
      return;
    }

    if (event.key === FILE_STORAGE_KEYS.ACTIVE) {
      const { files } = useFileStore.getState();
      const activeFileId = parseActiveFileId(event.newValue, files);
      useFileStore.setState({ activeFileId });
      reloadTasksFromActiveFile();
    }
  } catch {
    // ignore malformed storage payloads
  }
}

/** 监听 localStorage 变更，在浏览器多窗口间同步当前项目 */
export function initFileStoreCrossTabSync() {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', handleStorageSyncEvent);
  return () => window.removeEventListener('storage', handleStorageSyncEvent);
}
