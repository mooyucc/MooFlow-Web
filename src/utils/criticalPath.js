import { addDays, isSameDay } from 'date-fns';

export const CRITICAL_PATH_COLOR = '#F60E74';
export const CRITICAL_PATH_LINE_WIDTH = 3;
export const CRITICAL_PATH_DIM_OPACITY = 0.38;

/** 关键路径同色光晕阴影（用于 CSS filter） */
export function getCriticalPathGlowFilter(color = CRITICAL_PATH_COLOR) {
  return `drop-shadow(0 0 2px ${color}66) drop-shadow(0 0 4px ${color}33)`;
}

function getIncomingNumericLinks(tasks, toId) {
  return tasks.flatMap(t => (t.links || []).map(l => ({
    fromId: t.id,
    toId: l.toId,
    label: l.label,
  }))).filter(l => l.toId === toId && /^\d+$/.test(l.label));
}

function getTaskAnchorDate(taskId, tasks, computedDates) {
  const task = tasks.find(t => t.id === taskId);
  if (task?.date) return new Date(task.date);
  return computedDates.get(taskId) || null;
}

function linkKey(fromId, toId) {
  return `${fromId}-${toId}`;
}

/**
 * 计算关键路径：从中心任务到项目最晚日期的最长工期链路
 * @returns {{ taskIds: Set<number>, linkKeys: Set<string> }}
 */
export function computeCriticalPath(tasks, rootId = tasks[0]?.id) {
  const empty = { taskIds: new Set(), linkKeys: new Set() };
  const root = tasks.find(t => t.id === rootId);
  if (!root?.date) return empty;

  const computedDates = new Map([[rootId, new Date(root.date)]]);
  const drivingLink = new Map([[rootId, null]]);

  let changed = true;
  while (changed) {
    changed = false;
    for (const task of tasks) {
      const incoming = getIncomingNumericLinks(tasks, task.id);
      if (incoming.length === 0) continue;

      let best = null;
      for (const incomingLink of incoming) {
        const fromDate = getTaskAnchorDate(incomingLink.fromId, tasks, computedDates);
        if (!fromDate) continue;

        const days = parseInt(incomingLink.label, 10);
        if (Number.isNaN(days) || days <= 0) continue;

        const candidateDate = addDays(fromDate, days);
        if (!best || candidateDate > best.date) {
          best = {
            date: candidateDate,
            fromId: incomingLink.fromId,
            toId: incomingLink.toId,
          };
        }
      }

      if (!best) continue;

      const prev = computedDates.get(task.id);
      if (!prev || best.date.getTime() !== prev.getTime()) {
        computedDates.set(task.id, best.date);
        drivingLink.set(task.id, { fromId: best.fromId, toId: best.toId });
        changed = true;
      } else {
        const prevDriver = drivingLink.get(task.id);
        if (!prevDriver || prevDriver.fromId !== best.fromId) {
          drivingLink.set(task.id, { fromId: best.fromId, toId: best.toId });
        }
      }
    }
  }

  let endTaskId = rootId;
  let latestDate = getTaskAnchorDate(rootId, tasks, computedDates);

  for (const task of tasks) {
    const date = getTaskAnchorDate(task.id, tasks, computedDates);
    if (date && (!latestDate || date > latestDate)) {
      latestDate = date;
      endTaskId = task.id;
    }
  }

  if (!latestDate) return empty;

  const taskIds = new Set();
  const linkKeys = new Set();

  let currentId = endTaskId;
  const visited = new Set();

  while (currentId != null && !visited.has(currentId)) {
    visited.add(currentId);
    taskIds.add(currentId);

    let driver = drivingLink.get(currentId);
    if (!driver) {
      driver = resolveDrivingLink(currentId, tasks, computedDates);
    }

    if (!driver) break;

    linkKeys.add(linkKey(driver.fromId, driver.toId));
    currentId = driver.fromId;
  }

  return { taskIds, linkKeys };
}

function resolveDrivingLink(taskId, tasks, computedDates) {
  const taskDate = getTaskAnchorDate(taskId, tasks, computedDates);
  if (!taskDate) return null;

  const incoming = getIncomingNumericLinks(tasks, taskId);
  let match = null;

  for (const incomingLink of incoming) {
    const fromDate = getTaskAnchorDate(incomingLink.fromId, tasks, computedDates);
    if (!fromDate) continue;

    const days = parseInt(incomingLink.label, 10);
    if (Number.isNaN(days) || days <= 0) continue;

    const candidateDate = addDays(fromDate, days);
    if (!isSameDay(candidateDate, taskDate)) continue;

    if (!match || days > match.days) {
      match = { fromId: incomingLink.fromId, toId: incomingLink.toId, days };
    }
  }

  return match ? { fromId: match.fromId, toId: match.toId } : null;
}
