const DB_NAME = 'mooflow-fs-handles';
const STORE = 'handles';
const DB_VERSION = 1;
export const LINKED_FILE_PATH_KEY = 'moo_linked_file_path';

function openHandleDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Web 版是否支持 File System Access API（Electron 走独立通道） */
export function supportsLocalFileSystem() {
  if (typeof window === 'undefined') return false;
  if (window.electronAPI?.exportFile) return false;
  return typeof window.showSaveFilePicker === 'function'
    && typeof window.showOpenFilePicker === 'function';
}

export function storageKeyForFile(fileId) {
  return String(fileId ?? 'default');
}

export async function persistFileHandle(fileId, handle) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(
      { handle, name: handle?.name || '' },
      storageKeyForFile(fileId),
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function restoreFileHandle(fileId) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(storageKeyForFile(fileId));
    req.onsuccess = () => resolve(req.result?.handle ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearFileHandle(fileId) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(storageKeyForFile(fileId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 清除所有本地文件句柄（标签页关闭或全新会话时） */
export async function clearAllFileHandles() {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 将会话内的本地文件路径写入 sessionStorage（随标签页生命周期清除） */
export function persistLinkedFilePath(fileId, pathName) {
  if (typeof sessionStorage === 'undefined') return;
  if (!pathName) {
    clearLinkedFilePath();
    return;
  }
  sessionStorage.setItem(LINKED_FILE_PATH_KEY, JSON.stringify({
    fileId,
    pathName,
  }));
}

export function restoreLinkedFilePath(fileId) {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LINKED_FILE_PATH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (String(parsed.fileId) !== String(fileId)) return null;
    return parsed.pathName || null;
  } catch {
    return null;
  }
}

export function clearLinkedFilePath() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(LINKED_FILE_PATH_KEY);
}

export async function queryWritePermission(handle) {
  if (!handle?.queryPermission) return 'denied';
  try {
    return await handle.queryPermission({ mode: 'readwrite' });
  } catch {
    return 'denied';
  }
}

export async function requestWritePermission(handle) {
  if (!handle?.requestPermission) return 'denied';
  try {
    return await handle.requestPermission({ mode: 'readwrite' });
  } catch {
    return 'denied';
  }
}

export async function ensureWritePermission(handle, { request = false } = {}) {
  let state = await queryWritePermission(handle);
  if (state === 'granted') return true;
  if (request && state === 'prompt') {
    state = await requestWritePermission(handle);
  }
  return state === 'granted';
}

export async function writeFileHandle(handle, content) {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function readFileHandle(handle) {
  const file = await handle.getFile();
  return file.text();
}

export async function pickSaveFileLocation(suggestedName) {
  return window.showSaveFilePicker({
    suggestedName: suggestedName || 'project.json',
    types: [{
      description: 'MooFlow JSON',
      accept: { 'application/json': ['.json'] },
    }],
  });
}

export async function pickOpenFileLocation() {
  const [handle] = await window.showOpenFilePicker({
    types: [{
      description: 'MooFlow JSON',
      accept: { 'application/json': ['.json'] },
    }],
    multiple: false,
  });
  return handle;
}

export function basenameFromHandle(handle) {
  const name = handle?.name || '';
  return name.replace(/\.json$/i, '') || name;
}

const PENDING_OPEN_HANDLE_PREFIX = 'pending_open_';

export async function persistPendingOpenHandle(importId, handle) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(
      { handle, name: handle?.name || '' },
      `${PENDING_OPEN_HANDLE_PREFIX}${importId}`,
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function consumePendingOpenHandle(importId) {
  const db = await openHandleDb();
  const key = `${PENDING_OPEN_HANDLE_PREFIX}${importId}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => {
      const handle = req.result?.handle ?? null;
      store.delete(key);
      resolve(handle);
    };
    req.onerror = () => reject(req.error);
  });
}
