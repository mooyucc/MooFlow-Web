import { describe, it, expect } from 'vitest';
import { shouldCheckLinkCycle, wouldCreateLinkCycle } from './linkCycle';

const tasks = [
  { id: 1, parentId: null, type: 'center' },
  { id: 2, parentId: 1, type: 'sub' },
  { id: 3, parentId: 2, type: 'detail' },
  { id: 4, parentId: 1, type: 'sub' },
];

describe('wouldCreateLinkCycle', () => {
  it('祖先链包含目标时返回 true', () => {
    expect(wouldCreateLinkCycle(3, 1, tasks)).toBe(true);
  });

  it('不会成环时返回 false', () => {
    expect(wouldCreateLinkCycle(2, 3, tasks)).toBe(false);
  });
});

describe('shouldCheckLinkCycle', () => {
  it('中心任务不校验', () => {
    expect(shouldCheckLinkCycle(tasks[0], 1)).toBe(false);
  });

  it('子任务需要校验', () => {
    expect(shouldCheckLinkCycle(tasks[2], 1)).toBe(true);
    expect(shouldCheckLinkCycle(tasks[3], 1)).toBe(true);
  });
});
