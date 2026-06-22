const NEW_FILE_PARAM = 'new';
const OPEN_FILE_PARAM = 'open';
const PENDING_OPEN_PREFIX = 'moo_pending_open_';

function getSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location?.search ?? '');
}

export function isNewFileTabRequest() {
  return getSearchParams().get(NEW_FILE_PARAM) === '1';
}

export function getOpenFileTabImportId() {
  return getSearchParams().get(OPEN_FILE_PARAM);
}

export function isOpenFileTabRequest() {
  return Boolean(getOpenFileTabImportId());
}

export function isLaunchTabRequest() {
  return isNewFileTabRequest() || isOpenFileTabRequest();
}

/** 去掉地址栏中的 ?new=1，避免刷新重复新建 */
export function consumeNewFileTabParam() {
  if (typeof window === 'undefined' || !isNewFileTabRequest()) return;

  const url = new URL(window.location.href);
  url.searchParams.delete(NEW_FILE_PARAM);
  window.history.replaceState({}, '', url);
}

/** 去掉地址栏中的 ?open=… */
export function consumeOpenFileTabParam() {
  if (typeof window === 'undefined' || !isOpenFileTabRequest()) return;

  const url = new URL(window.location.href);
  url.searchParams.delete(OPEN_FILE_PARAM);
  window.history.replaceState({}, '', url);
}

function canOpenBrowserTab() {
  if (typeof window === 'undefined') return false;
  if (window.electronAPI) return false;
  return true;
}

/** 在新浏览器标签页打开空白项目；Electron 等环境返回 false */
export function openNewFileTab() {
  if (!canOpenBrowserTab()) return false;

  const url = new URL(window.location.href);
  url.searchParams.delete(OPEN_FILE_PARAM);
  url.searchParams.set(NEW_FILE_PARAM, '1');
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
  return true;
}

/** 暂存待在新标签页打开的文件内容（跨标签页需用 localStorage） */
export function stashPendingFileOpen({ raw, fileName, hasLinkedHandle = false }) {
  const id = String(Date.now());
  localStorage.setItem(`${PENDING_OPEN_PREFIX}${id}`, JSON.stringify({
    raw,
    fileName: fileName || '',
    hasLinkedHandle,
  }));
  return id;
}

/** 读取并清除暂存的打开文件内容 */
export function consumePendingFileOpen(importId) {
  if (!importId) return null;
  const key = `${PENDING_OPEN_PREFIX}${importId}`;
  const item = localStorage.getItem(key);
  localStorage.removeItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
}

/** 清除未在新标签页消费的暂存打开记录，避免残留数据干扰 */
export function purgeAbandonedPendingFileOpens(exceptImportId = null) {
  if (typeof localStorage === 'undefined') return;
  const except = exceptImportId != null ? String(exceptImportId) : null;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PENDING_OPEN_PREFIX)) continue;
    const id = key.slice(PENDING_OPEN_PREFIX.length);
    if (except && id === except) continue;
    keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/** 在新浏览器标签页打开已选文件；Electron 等环境返回 false */
export function openImportFileTab(importId) {
  if (!canOpenBrowserTab()) return false;

  const url = new URL(window.location.href);
  url.searchParams.delete(NEW_FILE_PARAM);
  url.searchParams.set(OPEN_FILE_PARAM, importId);
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
  return true;
}
