import React, { useRef, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import './CanvasToolbar.css';
import FormatSidebar from './FormatSidebar';
import { useTranslation } from '../LanguageContext';
import { useCanvasSettingsStore } from '../store/canvasSettingsStore';
import { useFileStore } from '../store/fileStore';
import { useFileOperations, useSyncActiveFileTasks, applyImportedProjectToStore } from '../hooks/useFileOperations';
import { useLocalFileSave } from '../hooks/useLocalFileSave';
import { setSavedBaseline } from '../utils/unsavedChanges';
import { flushProjectToStorage } from '../utils/filePersistence';
import { stashPendingFileOpen, openImportFileTab } from '../utils/newFileTab';
import {
  pickOpenFileLocation,
  readFileHandle,
  persistPendingOpenHandle,
  persistFileHandle,
  persistLinkedFilePath,
} from '../utils/localFileHandle';
import FileToolbarActions from './fileToolbar/FileToolbarActions';
import FileNameBar from './fileToolbar/FileNameBar';
import LocalFileToolbarButtons from './fileToolbar/LocalFileToolbarButtons';
import {
  buildExportFileName,
  buildExportPayload,
  downloadCsvExport,
  downloadJsonExport,
} from '../utils/fileImportExport';

const CanvasFileToolbar = ({
  selectedTaskId,
  setSelectedTaskId,
  selectedTaskIds,
  selectedLink,
  onBranchStyleChange,
}) => {
  const [t] = useTranslation();
  const canvasProps = useCanvasSettingsStore(state => state.canvasProps);
  const setCanvasProps = useCanvasSettingsStore(state => state.setCanvasProps);
  const timeScale = useCanvasSettingsStore(state => state.timeScale);
  const setTimeScale = useCanvasSettingsStore(state => state.setTimeScale);

  const {
    activeFileId,
    getActiveFile,
    handleNewFile: handleNewFileOp,
    updateActiveFile,
  } = useFileOperations();

  const renameFile = useFileStore(state => state.renameFile);
  const setPaletteIdx = useFileStore(state => state.setPaletteIdx);

  useSyncActiveFileTasks();

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const openFileInputRef = useRef(null);

  const [showFormatSidebar, setShowFormatSidebar] = useState(false);

  const tasksAll = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const selectedTask = tasksAll.find(task => task.id === selectedTaskId);
  const selectedTasks = tasksAll.filter(task => selectedTaskIds.includes(task.id));

  const activeFile = getActiveFile();
  const paletteIdx = activeFile?.paletteIdx ?? null;
  const mainDirection = activeFile?.mainDirection ?? 'horizontal';

  const handleTaskStyleChange = (key, value) => {
    if (selectedTaskIds.length > 1) {
      selectedTaskIds.forEach(id => {
        updateTask(id, { [key]: value });
      });
    } else if (selectedTask) {
      updateTask(selectedTask.id, { [key]: value });
    }
  };

  const handleCanvasChange = (props) => {
    const prevSnap = canvasProps.snapToGrid;
    const prevGridSize = canvasProps.gridSize ?? 20;
    setCanvasProps(props);
    updateActiveFile({
      mainDirection: props.mainDirection ?? mainDirection,
      timeScale: timeScale ?? activeFile?.timeScale,
    });

    const gridSize = props.gridSize ?? 20;
    const snapEnabled = Boolean(props.snapToGrid);
    if (snapEnabled && !prevSnap) {
      useTaskStore.getState().snapAllTasksToGrid(gridSize);
    } else if (snapEnabled && gridSize !== prevGridSize) {
      useTaskStore.getState().snapAllTasksToGrid(gridSize);
    }
  };

  const handlePaletteChange = (idx) => {
    setPaletteIdx(idx);
  };

  const handleNewFile = () => {
    setShowFormatSidebar(false);
    handleNewFileOp();
  };

  const handleExport = async () => {
    setShowFormatSidebar(false);
    const file = getActiveFile();
    const exportData = buildExportPayload(file, canvasProps, timeScale);
    const exportFileName = buildExportFileName(file?.name, 'json');
    try {
      await downloadJsonExport(exportData, exportFileName);
    } catch (e) {
      alert(`导出失败：${e.message}`);
    }
  };

  const applyImportedProject = (raw, options = {}) => {
    try {
      applyImportedProjectToStore(raw, options);
    } catch (error) {
      alert(error.message || '文件格式不正确');
    }
  };

  const bindLinkedHandleInCurrentTab = async (handle) => {
    if (!handle || activeFileId == null) return;
    await persistFileHandle(activeFileId, handle);
    persistLinkedFilePath(activeFileId, handle.name || null);
  };

  /** 浏览器：新标签页打开；弹窗被拦截或 Electron：当前窗口回退 */
  const openFileInNewTab = async (raw, { fileName, handle } = {}) => {
    const importId = stashPendingFileOpen({
      raw,
      fileName: fileName || '',
      hasLinkedHandle: Boolean(handle),
    });
    if (handle) {
      await persistPendingOpenHandle(importId, handle);
    }
    if (openImportFileTab(importId)) {
      return;
    }
    await clearLinkedFile();
    applyImportedProject(raw, { fileName, linkedHandle: handle });
    await bindLinkedHandleInCurrentTab(handle);
  };

  const handleOpenFileInput = (e) => {
    const inputFile = e.target.files[0];
    if (!inputFile) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        await openFileInNewTab(evt.target.result, { fileName: inputFile.name });
      } catch (error) {
        alert(error.message || '文件格式不正确');
      }
    };
    reader.readAsText(inputFile);
    e.target.value = '';
  };

  const {
    isSupported: localFileSupported,
    linkedFileName,
    saveToLinkedFile,
    saveAsLocalFile,
    clearLinkedFile,
  } = useLocalFileSave({
    activeFileId,
    getActiveFile,
    canvasProps,
    timeScale,
    onApplyImport: applyImportedProject,
    t,
  });

  const handleOpenFileClick = async () => {
    setShowFormatSidebar(false);
    flushProjectToStorage();
    try {
      if (localFileSupported) {
        const handle = await pickOpenFileLocation();
        const raw = await readFileHandle(handle);
        await openFileInNewTab(raw, { fileName: handle.name, handle });
      } else if (window.electronAPI?.importFile) {
        const result = await window.electronAPI.importFile();
        if (result?.canceled || !result?.content) return;
        const raw = decodeURIComponent(escape(atob(result.content)));
        const fileName = result.filePath?.split(/[/\\]/).pop() || '';
        await clearLinkedFile();
        applyImportedProject(raw, { fileName });
      } else {
        openFileInputRef.current?.click();
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      alert(error.message || t('local_file_save_failed'));
    }
  };

  const handleSaveFileClick = async () => {
    setShowFormatSidebar(false);
    try {
      if (localFileSupported) {
        if (linkedFileName) {
          const name = await saveToLinkedFile();
          if (name) alert(t('local_file_saved', { name }));
        } else {
          const name = await saveAsLocalFile();
          if (name) alert(t('local_file_saved', { name }));
        }
        setSavedBaseline();
        return;
      }
      await handleExport();
      setSavedBaseline();
    } catch (error) {
      if (error?.name === 'AbortError') return;
      alert(error.message || t('local_file_save_failed'));
    }
  };

  const handleRenameSubmit = () => {
    if (!renameValue.trim() || !activeFileId) return;
    renameFile(activeFileId, renameValue);
    setRenaming(false);
  };

  const handleExportCSV = () => {
    setShowFormatSidebar(false);
    const file = getActiveFile();
    if (!file) return;
    downloadCsvExport(file.tasks || [], buildExportFileName(file.name, 'csv'));
  };

  return (
    <>
    <div className="canvas-toolbar minimal filebar" style={{ display: 'flex', alignItems: 'center', touchAction: 'manipulation' }}>
      <FileToolbarActions
        formatLabel={t('format')}
        showFormatSidebar={showFormatSidebar}
        onFormatToggle={() => setShowFormatSidebar(v => !v)}
      />
      <FileNameBar
        fileName={activeFile?.name || t('new_file')}
        renaming={renaming}
        renameValue={renameValue}
        newFileLabel={t('new_file')}
        onRenameStart={() => {
          setRenaming(true);
          setRenameValue(activeFile?.name || '');
        }}
        onRenameChange={setRenameValue}
        onRenameSubmit={handleRenameSubmit}
        onRenameCancel={() => setRenaming(false)}
        onNewFileClick={() => { setShowFormatSidebar(false); handleNewFile(); }}
      />
      <LocalFileToolbarButtons
        openLabel={t('open_file')}
        saveLabel={t('save_file')}
        exportCsvLabel={t('export_csv_short')}
        openTitle={localFileSupported ? t('open_local_file') : t('import_json')}
        saveTitle={localFileSupported ? t('save_local_file') : t('export_json')}
        exportCsvTitle={t('export_csv')}
        linkedFileName={linkedFileName}
        onOpen={handleOpenFileClick}
        onSave={handleSaveFileClick}
        onExportCsv={handleExportCSV}
      />
      <input
        type="file"
        accept="application/json"
        ref={openFileInputRef}
        style={{ display: 'none' }}
        onChange={handleOpenFileInput}
      />
    </div>
    <FormatSidebar
      visible={showFormatSidebar}
      onClose={() => setShowFormatSidebar(false)}
      canvasProps={{ ...canvasProps, mainDirection }}
      onCanvasChange={handleCanvasChange}
      selectedTask={selectedTask}
      selectedTasks={selectedTasks}
      selectedTaskIds={selectedTaskIds}
      selectedLink={selectedLink}
      onTaskStyleChange={handleTaskStyleChange}
      onBranchStyleChange={onBranchStyleChange}
      paletteIdx={paletteIdx}
      onPaletteChange={handlePaletteChange}
    />
    </>
  );
};

export default CanvasFileToolbar;
