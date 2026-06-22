export function getFineGrainedTasks(task, allTasks) {
  return (task.links || [])
    .map(link => {
      const target = allTasks.find(t => t.id === link.toId);
      if (target && target.parentId === task.parentId) return target;
      return null;
    })
    .filter(Boolean);
}

export function isFineGrainedTask(task, allTasks) {
  return allTasks.some(t =>
    t.id !== task.id &&
    t.parentId === task.parentId &&
    (t.links || []).some(link => link.toId === task.id)
  );
}

export function shouldShowCollapseButton(task, allTasks) {
  const rootTask = allTasks.length > 0 ? allTasks[0] : null;
  const isSubTask = rootTask && task.id !== rootTask.id && task.parentId !== rootTask.id;
  const hasChildren = allTasks.some(t => t.parentId === task.id);
  const hasFineGrainedTasks = getFineGrainedTasks(task, allTasks).length > 0;
  return (hasChildren || (isSubTask && hasFineGrainedTasks)) && !isFineGrainedTask(task, allTasks);
}
