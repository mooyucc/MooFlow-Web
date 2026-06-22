/**
 * 判断 from → to 连线是否会在父子关系中形成闭环
 * （沿 from 的 parentId 链向上查找，若出现 to 则成环）
 */
export function wouldCreateLinkCycle(fromId, toId, tasks) {
  let cur = fromId;
  const visited = new Set();

  while (true) {
    const node = tasks.find(t => t.id === cur);
    if (!node) break;
    if (node.parentId == null) break;
    if (visited.has(node.parentId)) break;
    if (node.parentId === toId) return true;
    visited.add(node.parentId);
    cur = node.parentId;
  }

  return false;
}

/** 非中心任务才需要做防环校验 */
export function shouldCheckLinkCycle(task, rootTaskId) {
  return task.id !== rootTaskId && task.type !== 'center';
}
