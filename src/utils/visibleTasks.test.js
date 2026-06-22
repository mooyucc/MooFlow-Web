import { describe, it, expect } from 'vitest';
import { getVisibleTasks } from './visibleTasks';

describe('getVisibleTasks', () => {
  it('折叠节点本身仍可见，但隐藏其后代', () => {
    const tasks = [
      { id: 1, parentId: null, collapsed: false, links: [] },
      { id: 2, parentId: 1, collapsed: false, links: [] },
      { id: 3, parentId: 1, collapsed: true, links: [] },
      { id: 4, parentId: 3, collapsed: false, links: [] },
    ];
    const visible = getVisibleTasks(tasks);
    expect(visible.map(t => t.id)).toEqual([1, 2, 3]);
    expect(visible.some(t => t.id === 4)).toBe(false);
  });

  it('全部展开时显示深层子任务', () => {
    const tasks = [
      { id: 1, parentId: null, collapsed: false, links: [] },
      { id: 2, parentId: 1, collapsed: false, links: [] },
      { id: 3, parentId: 1, collapsed: false, links: [] },
      { id: 4, parentId: 3, collapsed: false, links: [] },
    ];
    expect(getVisibleTasks(tasks).map(t => t.id)).toEqual([1, 2, 3, 4]);
  });
});
