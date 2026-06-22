/** 获取所有可见节点（未被折叠隐藏的任务） */
export function getVisibleTasks(tasks, parentId = null) {
  const rootTask = tasks.length > 0 ? tasks[0] : null;
  if (!rootTask) return [];

  const hiddenTaskIds = new Set();
  const collapsedTasks = tasks.filter(t => t.collapsed);

  function collectAllDescendants(taskId, allTasks, hiddenSet) {
    allTasks
      .filter(t => t.parentId === taskId)
      .forEach(child => {
        if (!hiddenSet.has(child.id)) {
          hiddenSet.add(child.id);
          collectAllDescendants(child.id, allTasks, hiddenSet);
        }
      });

    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      (task.links || []).forEach(link => {
        const targetTask = allTasks.find(t => t.id === link.toId);
        if (targetTask && targetTask.parentId === task.parentId && !hiddenSet.has(targetTask.id)) {
          hiddenSet.add(targetTask.id);
          collectAllDescendants(targetTask.id, allTasks, hiddenSet);
        }
      });
    }
  }

  collapsedTasks.forEach(collapsedTask => {
    collectAllDescendants(collapsedTask.id, tasks, hiddenTaskIds);
  });

  function getVisible(currentParentId) {
    let result = [];
    tasks
      .filter(t => t.parentId === currentParentId && !hiddenTaskIds.has(t.id))
      .forEach(task => {
        result.push(task);
        if (!task.collapsed) {
          result = result.concat(getVisible(task.id));
        }
      });
    return result;
  }

  return getVisible(parentId);
}
