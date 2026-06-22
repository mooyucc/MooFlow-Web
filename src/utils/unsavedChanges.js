import { useTaskStore } from '../store/taskStore';
import { useFileStore } from '../store/fileStore';
import { useCanvasSettingsStore } from '../store/canvasSettingsStore';
import { buildExportPayload, serializeExportPayload } from './fileImportExport';

let savedSnapshot = null;

/** 生成当前项目的可比较快照（含任务与连线） */
export function getCurrentProjectSnapshot() {
  const tasks = useTaskStore.getState().tasks;
  const file = useFileStore.getState().getActiveFile();
  const { canvasProps, timeScale } = useCanvasSettingsStore.getState();
  const payload = buildExportPayload(
    { ...file, tasks },
    canvasProps,
    timeScale,
  );
  return serializeExportPayload(payload);
}

/** 将当前状态标记为已保存基线 */
export function setSavedBaseline(snapshot = getCurrentProjectSnapshot()) {
  savedSnapshot = snapshot;
}

/** 清除基线（如空项目） */
export function clearSavedBaseline() {
  savedSnapshot = null;
}

/** 是否存在相对基线的未保存修改 */
export function hasUnsavedChanges() {
  const tasks = useTaskStore.getState().tasks;
  if (tasks.length === 0) return false;
  if (savedSnapshot == null) return true;
  return getCurrentProjectSnapshot() !== savedSnapshot;
}

export function resetUnsavedBaselineForTests() {
  savedSnapshot = null;
}
