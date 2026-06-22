import { useCallback, useEffect, useRef, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useFileStore } from '../store/fileStore';
import {
  buildExportFileName,
  buildExportPayload,
  serializeExportPayload,
} from '../utils/fileImportExport';
import {
  supportsLocalFileSystem,
  persistFileHandle,
  restoreFileHandle,
  clearFileHandle,
  persistLinkedFilePath,
  restoreLinkedFilePath,
  clearLinkedFilePath,
  ensureWritePermission,
  writeFileHandle,
  readFileHandle,
  pickSaveFileLocation,
  pickOpenFileLocation,
  basenameFromHandle,
} from '../utils/localFileHandle';
import { setSavedBaseline } from '../utils/unsavedChanges';

const AUTO_SAVE_MS = 1500;

export function useLocalFileSave({
  activeFileId,
  getActiveFile,
  canvasProps,
  timeScale,
  onApplyImport,
  t,
}) {
  const [linkedFileName, setLinkedFileName] = useState(null);
  const [canWrite, setCanWrite] = useState(false);
  const handleRef = useRef(null);
  const isSupported = supportsLocalFileSystem();
  const tasks = useTaskStore(state => state.tasks);
  const renameFile = useFileStore(state => state.renameFile);

  const buildCurrentPayload = useCallback(() => {
    const file = getActiveFile();
    return buildExportPayload(
      { ...file, tasks },
      canvasProps,
      timeScale,
    );
  }, [getActiveFile, tasks, canvasProps, timeScale]);

  const refreshPermission = useCallback(async (handle) => {
    if (!handle) {
      setCanWrite(false);
      return false;
    }
    const ok = await ensureWritePermission(handle, { request: false });
    setCanWrite(ok);
    return ok;
  }, []);

  const bindHandle = useCallback(async (fileId, handle) => {
    handleRef.current = handle;
    const pathName = handle?.name || null;
    setLinkedFileName(pathName);
    persistLinkedFilePath(fileId, pathName);
    await persistFileHandle(fileId, handle);
    await refreshPermission(handle);
  }, [refreshPermission]);

  const clearLinkedFile = useCallback(async () => {
    handleRef.current = null;
    setLinkedFileName(null);
    setCanWrite(false);
    clearLinkedFilePath();
    if (activeFileId != null) {
      await clearFileHandle(activeFileId).catch(() => {});
    }
  }, [activeFileId]);

  useEffect(() => {
    if (!isSupported || activeFileId == null) return undefined;

    let cancelled = false;

    const restore = async () => {
      const pathName = restoreLinkedFilePath(activeFileId);
      if (!pathName) {
        handleRef.current = null;
        setLinkedFileName(null);
        setCanWrite(false);
        return;
      }

      const handle = await restoreFileHandle(activeFileId);
      if (cancelled) return;
      if (handle) {
        handleRef.current = handle;
        setLinkedFileName(pathName);
        await refreshPermission(handle);
        return;
      }

      clearLinkedFilePath();
      handleRef.current = null;
      setLinkedFileName(null);
      setCanWrite(false);
    };

    restore();
    // 新标签页打开文件时，句柄绑定可能晚于首次 restore
    const retryTimer = setTimeout(() => {
      if (!cancelled) restore();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [activeFileId, isSupported, refreshPermission]);

  const writeToHandle = useCallback(async (handle, { requestPermission = false } = {}) => {
    const allowed = await ensureWritePermission(handle, { request: requestPermission });
    if (!allowed) {
      throw new Error(t('local_file_permission_denied'));
    }
    const content = serializeExportPayload(buildCurrentPayload());
    await writeFileHandle(handle, content);
    setCanWrite(true);
  }, [buildCurrentPayload, t]);

  const saveToLinkedFile = useCallback(async () => {
    const handle = handleRef.current;
    if (!handle) {
      throw new Error(t('local_file_not_linked'));
    }
    await writeToHandle(handle, { requestPermission: true });
    return handle.name;
  }, [writeToHandle, t]);

  const saveAsLocalFile = useCallback(async () => {
    if (!isSupported) {
      throw new Error(t('local_file_not_supported'));
    }
    const file = getActiveFile();
    const suggested = linkedFileName || buildExportFileName(file?.name, 'json');
    const handle = await pickSaveFileLocation(suggested);
    await writeToHandle(handle, { requestPermission: true });
    await bindHandle(activeFileId, handle);
    const baseName = basenameFromHandle(handle);
    if (baseName && file?.id != null) {
      renameFile(file.id, baseName);
    }
    return handle.name;
  }, [isSupported, getActiveFile, linkedFileName, writeToHandle, bindHandle, activeFileId, renameFile, t]);

  const openLocalFile = useCallback(async () => {
    if (!isSupported) {
      throw new Error(t('local_file_not_supported'));
    }
    const handle = await pickOpenFileLocation();
    const raw = await readFileHandle(handle);
    onApplyImport(raw);
    await bindHandle(activeFileId, handle);
    const baseName = basenameFromHandle(handle);
    const file = getActiveFile();
    if (baseName && file?.id != null) {
      renameFile(file.id, baseName);
    }
    return handle.name;
  }, [isSupported, onApplyImport, bindHandle, activeFileId, getActiveFile, renameFile, t]);

  useEffect(() => {
    if (!isSupported || !handleRef.current || !canWrite || tasks.length === 0) return undefined;

    const timer = setTimeout(async () => {
      try {
        await writeToHandle(handleRef.current, { requestPermission: false });
      } catch {
        setCanWrite(false);
      }
    }, AUTO_SAVE_MS);

    return () => clearTimeout(timer);
  }, [isSupported, canWrite, tasks, canvasProps, timeScale, writeToHandle]);

  useEffect(() => {
    if (!isSupported) return undefined;

    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (handleRef.current) {
          saveToLinkedFile()
            .then((name) => { if (name) setLinkedFileName(name); })
            .catch((err) => alert(err.message));
        } else {
          saveAsLocalFile()
            .then((name) => { if (name) setLinkedFileName(name); })
            .catch((err) => { if (err?.name !== 'AbortError') alert(err.message); });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSupported, saveToLinkedFile, saveAsLocalFile]);

  return {
    isSupported,
    linkedFileName,
    canWrite,
    saveToLinkedFile,
    saveAsLocalFile,
    openLocalFile,
    clearLinkedFile,
  };
}
