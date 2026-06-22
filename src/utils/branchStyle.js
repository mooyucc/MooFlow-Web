import { useTaskStore, defaultLinkStyle } from '../store/taskStore';

/** 找到指向目标任务的连线 */
export function getIncomingLink(taskId, allTasks) {
  if (!taskId) return null;
  const sourceTask = allTasks.find(source =>
    (source.links || []).some(link => link.toId === taskId)
  );
  if (!sourceTask) return null;
  return (sourceTask.links || []).find(l => l.toId === taskId) || null;
}

/** 获取分支样式，支持单选、多选与选中连线 */
export function getBranchStyleValue(key, { selectedLink, selectedTasks = [], tasks }) {
  if (selectedLink) {
    const allTasks = useTaskStore.getState().tasks;
    const sourceTask = allTasks.find(t => t.id === selectedLink.fromId);
    if (sourceTask) {
      const link = (sourceTask.links || []).find(l => l.toId === selectedLink.toId);
      return link?.[key] ?? defaultLinkStyle[key];
    }
    return defaultLinkStyle[key];
  }
  if (selectedTasks && selectedTasks.length > 0) {
    const firstLink = getIncomingLink(selectedTasks[0].id, tasks);
    const firstValue = firstLink?.[key] ?? defaultLinkStyle[key];

    if (selectedTasks.length === 1) {
      return firstValue;
    }

    const allSame = selectedTasks.slice(1).every(task => {
      const link = getIncomingLink(task.id, tasks);
      return (link?.[key] ?? defaultLinkStyle[key]) === firstValue;
    });

    return allSame ? firstValue : defaultLinkStyle[key];
  }
  return defaultLinkStyle[key];
}
