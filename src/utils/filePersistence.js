import { useFileStore } from '../store/fileStore';
import { useTaskStore } from '../store/taskStore';
import { useCanvasSettingsStore } from '../store/canvasSettingsStore';
import { clearSavedBaseline } from './unsavedChanges';
import {
  clearFileHandle,
  clearAllFileHandles,
  clearLinkedFilePath,
} from './localFileHandle';

/** 立即将当前画布任务（含连线）写入 sessionStorage */
export function flushProjectToStorage() {
  const { tasks } = useTaskStore.getState();
  const { canvasProps, timeScale } = useCanvasSettingsStore.getState();
  const store = useFileStore.getState();
  const activeId = store.activeFileId;
  if (!activeId || tasks.length === 0) return;

  store.updateActiveFile({
    tasks,
    mainDirection: canvasProps.mainDirection || 'horizontal',
    timeScale: timeScale || 'month',
  });
}

/** 关闭浏览器时是否应弹出离开确认（有项目数据即提示） */
export function shouldBlockBrowserUnload() {
  const tasks = useTaskStore.getState().tasks;
  if (tasks.length > 0) return true;
  const file = useFileStore.getState().getActiveFile();
  return (file?.tasks?.length ?? 0) > 0;
}

let reloadIntent = false;

function markReloadIntentFromKeyboard(event) {
  const key = event.key?.toLowerCase?.() ?? event.key;
  if (key === 'f5') {
    reloadIntent = true;
    return;
  }
  if ((event.ctrlKey || event.metaKey) && key === 'r') {
    reloadIntent = true;
  }
}

function resetReloadIntentSoon() {
  setTimeout(() => {
    reloadIntent = false;
  }, 500);
}

/** 是否为刷新离开（刷新时保留 sessionStorage） */
export function isReloadNavigation({ consume = true } = {}) {
  if (reloadIntent) {
    if (consume) reloadIntent = false;
    return true;
  }
  if (typeof performance !== 'undefined') {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav?.type === 'reload') return true;
    if (performance.navigation?.type === 1) return true;
  }
  return false;
}

/** 关闭标签页时是否应清除本会话数据 */
export function shouldClearTabSessionOnPageHide(event) {
  if (event?.persisted) return false;
  return !isReloadNavigation({ consume: false });
}

function clearTabClipboard(activeFileId) {
  if (typeof localStorage === 'undefined' || activeFileId == null) return;
  localStorage.removeItem(`moo_clipboard_${activeFileId}`);
}

/** 清除当前标签页的项目数据（sessionStorage + 内存 + 本地文件路径） */
export function clearTabProjectData() {
  const { activeFileId, clearTabSession } = useFileStore.getState();

  clearTabClipboard(activeFileId);
  clearLinkedFilePath();
  clearTabSession();
  useTaskStore.getState().clearTasks();
  clearSavedBaseline();

  if (activeFileId != null) {
    clearFileHandle(activeFileId).catch(() => {});
  }
  clearAllFileHandles().catch(() => {});
}

/** 全新进入页面时，清理可能残留的本地文件句柄与路径 */
export function purgeStaleTabArtifacts() {
  clearLinkedFilePath();
  clearAllFileHandles().catch(() => {});
}

/** 非 React 环境也可注册（main.jsx 尽早挂载） */
export function registerBeforeUnloadGuard() {
  if (typeof window === 'undefined') return () => {};

  const onKeyDown = (event) => markReloadIntentFromKeyboard(event);

  const onBeforeUnload = (event) => {
    if (reloadIntent) {
      flushProjectToStorage();
    }
    if (!shouldBlockBrowserUnload()) {
      reloadIntent = false;
      return;
    }

    event.preventDefault();
    event.returnValue = '';
    resetReloadIntentSoon();
    return '';
  };

  const onPageHide = (event) => {
    if (event.persisted) return;
    if (isReloadNavigation()) {
      flushProjectToStorage();
      return;
    }
    clearTabProjectData();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('beforeunload', onBeforeUnload);
  window.addEventListener('pagehide', onPageHide);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('pagehide', onPageHide);
  };
}
