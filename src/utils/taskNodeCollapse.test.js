import { describe, it, expect } from 'vitest';
import { shouldShowCollapseButton, isFineGrainedTask, getFineGrainedTasks } from './taskNodeCollapse';

const tasks = [
  { id: 1, parentId: null, links: [{ toId: 2 }] },
  { id: 2, parentId: 1, links: [] },
  { id: 5, parentId: 2, links: [] },
  { id: 3, parentId: 1, links: [{ toId: 4 }] },
  { id: 4, parentId: 1, links: [] },
];

const byId = (id) => tasks.find(t => t.id === id);

describe('taskNodeCollapse', () => {
  it('detects fine-grained tasks linked at same parent level', () => {
    expect(getFineGrainedTasks(byId(3), tasks).map(t => t.id)).toEqual([4]);
    expect(isFineGrainedTask(byId(4), tasks)).toBe(true);
  });

  it('shows collapse button for parent with children but not for fine-grained node', () => {
    expect(shouldShowCollapseButton(byId(2), tasks)).toBe(true);
    expect(shouldShowCollapseButton(byId(4), tasks)).toBe(false);
  });
});
