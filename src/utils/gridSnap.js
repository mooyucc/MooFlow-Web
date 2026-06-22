/** 将坐标对齐到网格线（以左上角为基准） */
export function snapPositionToGrid(x, y, gridSize) {
  if (!gridSize || gridSize <= 0) {
    return { x, y };
  }
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

/** 批量对齐任务位置到网格（以卡片左上角为准） */
export function snapTasksPositionsToGrid(tasks, gridSize) {
  if (!Array.isArray(tasks) || !gridSize || gridSize <= 0) {
    return tasks;
  }
  return tasks.map(task => {
    const snapped = snapPositionToGrid(task.position.x, task.position.y, gridSize);
    if (snapped.x === task.position.x && snapped.y === task.position.y) {
      return task;
    }
    return { ...task, position: snapped };
  });
}
