import { addDays } from 'date-fns';
import { useTaskStore } from '../store/taskStore';

function getIncomingNumericLinks(tasks, toId) {
  return tasks.flatMap(t => (t.links || []).map(l => ({
    fromId: t.id,
    toId: l.toId,
    label: l.label,
  }))).filter(l => l.toId === toId && /^\d+$/.test(l.label));
}

function getMaxNumericLink(incomingLinks) {
  return incomingLinks.reduce(
    (max, cur) => (parseInt(cur.label, 10) > parseInt(max.label, 10) ? cur : max),
    incomingLinks[0],
  );
}

function applyDateFromIncomingLinks(toId, tasks, updateTask) {
  const incomingLinks = getIncomingNumericLinks(tasks, toId);
  if (incomingLinks.length === 0) return false;

  const maxLink = getMaxNumericLink(incomingLinks);
  const taskA = tasks.find(t => t.id === maxLink.fromId);
  if (!taskA?.date) return false;

  const days = parseInt(maxLink.label, 10);
  if (Number.isNaN(days) || days <= 0) return false;

  updateTask(toId, { date: addDays(new Date(taskA.date), days), autoDate: true });
  return true;
}

/** 递归级联推算下游所有自动日期卡片 */
export function cascadeUpdateDates(startId) {
  const store = useTaskStore.getState();
  const { tasks, updateTask } = store;
  const outLinks = tasks.find(t => t.id === startId)?.links || [];

  for (const link of outLinks) {
    if (!/^\d+$/.test(link.label)) continue;

    const toTask = tasks.find(t => t.id === link.toId);
    if (!toTask || toTask.autoDate === false) continue;

    const applied = applyDateFromIncomingLinks(toTask.id, tasks, updateTask);
    if (applied) {
      cascadeUpdateDates(toTask.id);
    } else if (toTask.autoDate !== false) {
      // 上游日期暂不可用：清空日期但保留自动推算资格，避免阻断后续级联
      updateTask(toTask.id, { date: null });
      cascadeUpdateDates(toTask.id);
    }
  }
}

/** 更新连线 label 并按规则推算/清空目标日期 */
export function updateLinkLabelWithCascade(fromId, toId, label) {
  const { updateLinkLabel, updateTask } = useTaskStore.getState();
  updateLinkLabel(fromId, toId, label);

  if (label === '') {
    updateTask(toId, { date: null, autoDate: false });
    cascadeUpdateDates(toId);
    return;
  }

  if (!/^\d+$/.test(label)) return;

  // updateLinkLabel 已写入 store，必须重新读取，否则仍用旧 label 导致推算失败
  const tasks = useTaskStore.getState().tasks;
  if (applyDateFromIncomingLinks(toId, tasks, updateTask)) {
    cascadeUpdateDates(toId);
  }
}
