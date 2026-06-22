/** 根据 parentId/level 推断任务 type（仅 center 为顶层特殊类型） */
export function inferTaskType(task, tasks) {
  if (task.type === 'independent') return 'independent';
  if (task.parentId === null) return 'center';

  const parent = tasks.find(t => t.id === task.parentId);
  if (parent?.type === 'center' || parent?.parentId == null) return 'sub';
  return 'detail';
}

/** 将旧版「主线任务」结构迁移为 center → sub 层级，并移除同级红色主链连线 */
export function migrateLegacyTaskStructure(tasks) {
  if (!tasks.length) return [];

  const centerId = tasks[0].id;
  let migrated = tasks.map(t => ({ ...t }));

  migrated = migrated.map(t => {
    if (t.id === centerId) {
      return { ...t, type: 'center', parentId: null };
    }
    if (t.type === 'main' || (t.parentId === null && t.id !== centerId)) {
      return { ...t, type: 'sub', parentId: centerId, level: 1 };
    }
    if (t.type === 'main') {
      return { ...t, type: t.parentId === centerId ? 'sub' : 'detail' };
    }
    return t;
  });

  migrated = migrated.map(t => ({
    ...t,
    links: (t.links || []).filter(l => {
      const target = migrated.find(x => x.id === l.toId);
      if (!target) return false;
      if (target.parentId === t.id) return true;
      if (t.parentId === centerId && target.parentId === centerId && t.id !== centerId) {
        return false;
      }
      return true;
    }),
  }));

  return migrated;
}

export function ensureTaskType(tasks) {
  const migrated = migrateLegacyTaskStructure(tasks);
  return migrated.map(t => ({
    ...t,
    type: t.type || inferTaskType(t, migrated),
  }));
}

export function isCenterTask(task, tasks) {
  return task?.id === tasks[0]?.id || task?.type === 'center';
}

/** 连线着色用：center / child / fine */
export function getTaskHierarchyRole(task, tasks) {
  if (!task?.parentId) return 'center';
  const parent = tasks.find(t => t.id === task.parentId);
  if (parent && !parent.parentId) return 'child';
  return 'fine';
}

/** 无自定义颜色时的默认连线颜色（统一灰色） */
export function getDefaultLinkColor(link) {
  return link.color || '#86868b';
}
