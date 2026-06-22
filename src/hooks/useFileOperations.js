import { useEffect, useRef } from 'react';
import { useFileStore } from '../store/fileStore';
import { useTaskStore } from '../store/taskStore';
import { useCanvasSettingsStore } from '../store/canvasSettingsStore';
import { createDefaultFile } from '../store/fileStore';
import { setSavedBaseline } from '../utils/unsavedChanges';
import { flushProjectToStorage } from '../utils/filePersistence';
import {
  openNewFileTab,
  getOpenFileTabImportId,
  consumePendingFileOpen,
  consumeOpenFileTabParam,
  purgeAbandonedPendingFileOpens,
} from '../utils/newFileTab';
import { parseImportedProject } from '../utils/fileImportExport';
import { basenameFromHandle, persistFileHandle, persistLinkedFilePath, consumePendingOpenHandle } from '../utils/localFileHandle';

function applyFileSwitchFlags(mainDirection) {
  const { setCanvasProps } = useCanvasSettingsStore.getState();
  setCanvasProps(prev => ({
    ...prev,
    mainDirection: mainDirection ?? 'horizontal',
    _isSwitchingFile: true,
  }));
  setTimeout(() => {
    setCanvasProps(prev => {
      const { _isSwitchingFile, ...rest } = prev;
      return rest;
    });
  }, 200);
}

function loadTasksFromFile(file) {
  const { importTasks } = useTaskStore.getState();
  importTasks(file?.tasks || []);
}

function applyFileSettings(file) {
  applyFileSwitchFlags(file.mainDirection);
  if (file.timeScale) {
    useCanvasSettingsStore.getState().setTimeScale(file.timeScale);
  }
}

/** @deprecated 使用 flushProjectToStorage */
export function saveActiveFileBeforeSwitch() {
  flushProjectToStorage();
}

function replaceCurrentFile(file) {
  const { setFiles, setActiveFileId } = useFileStore.getState();
  const normalized = { ...file, tasks: file?.tasks || [] };
  setFiles([normalized]);
  setActiveFileId(normalized.id);
  loadTasksFromFile(normalized);
  applyFileSettings(normalized);
  setSavedBaseline();
  return normalized;
}

export function applyImportedProjectToStore(raw, { fileName, linkedHandle } = {}) {
  const {
    tasks: importedTasks,
    mainDirection: importedDirection,
    canvasProps: importedCanvasProps,
    timeScale: importedTimeScale,
  } = parseImportedProject(raw);

  const { importTasks, clearTasks } = useTaskStore.getState();
  const { updateActiveFile, renameFile, getActiveFile } = useFileStore.getState();
  const { setCanvasProps, setTimeScale } = useCanvasSettingsStore.getState();

  clearTasks();
  importTasks(importedTasks);
  updateActiveFile({
    tasks: importedTasks,
    mainDirection: importedDirection,
    timeScale: importedTimeScale,
  });
  setCanvasProps(prev => ({
    ...prev,
    ...importedCanvasProps,
    mainDirection: importedDirection,
    _isImporting: true,
  }));
  setTimeout(() => {
    setCanvasProps(prev => {
      const { _isImporting, ...rest } = prev;
      return rest;
    });
  }, 200);
  if (importedTimeScale) {
    setTimeScale(importedTimeScale);
  }

  const baseName = fileName?.replace(/\.json$/i, '')
    || (linkedHandle ? basenameFromHandle(linkedHandle) : null);
  const file = getActiveFile();
  if (baseName && file?.id != null) {
    renameFile(file.id, baseName);
  }

  setSavedBaseline();
}

export function useFileOperations() {
  const files = useFileStore(state => state.files);
  const activeFileId = useFileStore(state => state.activeFileId);
  const getActiveFile = useFileStore(state => state.getActiveFile);

  const handleNewFile = () => {
    flushProjectToStorage();
    if (!openNewFileTab()) {
      return replaceCurrentFile(createDefaultFile());
    }
  };

  return {
    files,
    activeFileId,
    getActiveFile,
    handleNewFile,
    saveActiveFileBeforeSwitch: flushProjectToStorage,
    updateActiveFile: useFileStore.getState().updateActiveFile,
  };
}

/** 任务变更时防抖同步到当前文件 */
export function useSyncActiveFileTasks() {
  const tasks = useTaskStore(state => state.tasks);
  const activeFileId = useFileStore(state => state.activeFileId);
  const canvasProps = useCanvasSettingsStore(state => state.canvasProps);
  const timeScale = useCanvasSettingsStore(state => state.timeScale);
  const updateActiveFile = useFileStore(state => state.updateActiveFile);

  useEffect(() => {
    if (!activeFileId || tasks.length === 0) return;

    const timeoutId = setTimeout(() => {
      updateActiveFile({
        tasks,
        mainDirection: canvasProps.mainDirection || 'horizontal',
        timeScale: timeScale || 'month',
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tasks, canvasProps.mainDirection, timeScale, activeFileId, updateActiveFile]);
}

/** 应用启动时从持久化文件恢复任务，或消费新标签页暂存的打开文件 */
export function useInitialFileLoad() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      const importId = getOpenFileTabImportId();
      if (importId) {
        consumeOpenFileTabParam();
        const pending = consumePendingFileOpen(importId);
        purgeAbandonedPendingFileOpens();
        if (pending) {
          let linkedHandle = null;
          if (pending.hasLinkedHandle) {
            linkedHandle = await consumePendingOpenHandle(importId);
          }
          applyImportedProjectToStore(pending.raw, {
            fileName: pending.fileName,
            linkedHandle,
          });
          const activeFileId = useFileStore.getState().activeFileId;
          if (linkedHandle && activeFileId != null) {
            await persistFileHandle(activeFileId, linkedHandle);
            persistLinkedFilePath(activeFileId, linkedHandle.name || null);
          }
          return;
        }
      }

      const file = useFileStore.getState().getActiveFile();
      if (file) {
        purgeAbandonedPendingFileOpens();
        loadTasksFromFile(file);
        applyFileSettings(file);
        setTimeout(() => setSavedBaseline(), 0);
      }
    })();
  }, []);
}
