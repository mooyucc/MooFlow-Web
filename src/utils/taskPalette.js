import tinycolor from 'tinycolor2';
import { COLOR_PALETTES } from '../constants/colorPalettes';
import { defaultTaskStyle } from '../store/taskStore';

function getPaletteBranchColor(branchIndex, paletteIdx) {
  if (paletteIdx == null) return null;
  const palette = COLOR_PALETTES[paletteIdx];
  if (!palette) return null;
  return palette.colors[branchIndex % palette.colors.length];
}

function getLightenedFillColor(baseColor, depthFromBranch) {
  if (depthFromBranch <= 0) return baseColor;
  const colorDepth1 = tinycolor(baseColor).lighten(15).toHexString();
  if (depthFromBranch === 1) return colorDepth1;
  return tinycolor(colorDepth1).lighten(15).toHexString();
}

/** 新建任务时，根据当前配色方案解析 fillColor */
export function resolveNewTaskFillColor(task, tasksAll, paletteIdx) {
  if (task.fillColor) return task.fillColor;
  if (paletteIdx == null) return defaultTaskStyle.fillColor;

  const centerTask = tasksAll[0];
  if (!centerTask) return defaultTaskStyle.fillColor;

  if (task.parentId === centerTask.id) {
    const existingBranches = tasksAll.filter(t => t.parentId === centerTask.id);
    return getPaletteBranchColor(existingBranches.length, paletteIdx) ?? defaultTaskStyle.fillColor;
  }

  if (!task.parentId) return defaultTaskStyle.fillColor;

  let branchTask = tasksAll.find(t => t.id === task.parentId);
  while (branchTask && branchTask.parentId !== centerTask.id) {
    branchTask = tasksAll.find(t => t.id === branchTask.parentId);
  }

  if (!branchTask || branchTask.parentId !== centerTask.id) {
    return defaultTaskStyle.fillColor;
  }

  const branches = tasksAll.filter(t => t.parentId === centerTask.id);
  const branchIndex = branches.findIndex(t => t.id === branchTask.id);
  const branchColor = getPaletteBranchColor(branchIndex, paletteIdx);
  if (!branchColor) return defaultTaskStyle.fillColor;

  let depth = 0;
  let current = task;
  while (current && current.id !== branchTask.id) {
    depth += 1;
    current = tasksAll.find(t => t.id === current.parentId);
  }

  return getLightenedFillColor(branchColor, depth);
}

function collectDescendantIds(parentId, tasksAll, collected = new Set()) {
  tasksAll.forEach((task) => {
    if (task.parentId === parentId && !collected.has(task.id)) {
      collected.add(task.id);
      collectDescendantIds(task.id, tasksAll, collected);
    }
  });

  const parentTask = tasksAll.find(t => t.id === parentId);
  if (parentTask?.links) {
    parentTask.links.forEach((link) => {
      if (!collected.has(link.toId)) {
        collected.add(link.toId);
        collectDescendantIds(link.toId, tasksAll, collected);
      }
    });
  }

  return collected;
}

/** 将配色方案应用到中心任务的各分支及其下属任务 */
export function applyPaletteToTasks(tasksAll, paletteIdx, updateTask) {
  const centerTask = tasksAll[0];
  const branchTasks = tasksAll.filter(t => t.parentId === centerTask?.id);
  const defaultColor = defaultTaskStyle.fillColor;

  branchTasks.forEach((branchTask) => {
    updateTask(branchTask.id, { fillColor: defaultColor });
    collectDescendantIds(branchTask.id, tasksAll).forEach((id) => {
      updateTask(id, { fillColor: defaultColor });
    });
  });

  if (paletteIdx === null) return;

  const palette = COLOR_PALETTES[paletteIdx];
  if (!palette) return;

  branchTasks.forEach((branchTask, i) => {
    const color = palette.colors[i % palette.colors.length];
    updateTask(branchTask.id, { fillColor: color });
  });
}
