/** 获取折叠任务下所有被隐藏的后代（含子任务与同级细分任务链） */
export function getHiddenDescendants(parentId, tasks) {
  const hidden = [];
  const queue = [parentId];
  const visited = new Set([parentId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentTask = tasks.find(t => t.id === currentId);
    if (!currentTask) continue;

    tasks.filter(t => t.parentId === currentId).forEach(child => {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        hidden.push(child);
        queue.push(child.id);
      }
    });

    (currentTask.links || []).forEach(link => {
      const targetTask = tasks.find(t => t.id === link.toId);
      if (targetTask && targetTask.parentId === currentTask.parentId && !visited.has(targetTask.id)) {
        visited.add(targetTask.id);
        hidden.push(targetTask);
        queue.push(targetTask.id);
      }
    });
  }

  return hidden;
}
