import { describe, it, expect } from 'vitest';
import { addDays } from 'date-fns';
import { computeCriticalPath } from './criticalPath';

describe('computeCriticalPath', () => {
  const centerDate = new Date('2026-06-14');

  it('单链：累计最长路径为关键路径', () => {
    const tasks = [
      {
        id: 1,
        date: centerDate,
        links: [{ toId: 2, label: '9' }],
      },
      {
        id: 2,
        date: addDays(centerDate, 9),
        links: [{ toId: 3, label: '9' }],
      },
      {
        id: 3,
        date: addDays(centerDate, 18),
        links: [{ toId: 4, label: '21' }],
      },
      { id: 4, date: addDays(centerDate, 39), links: [] },
    ];

    const { taskIds, linkKeys } = computeCriticalPath(tasks, 1);
    expect(taskIds).toEqual(new Set([1, 2, 3, 4]));
    expect(linkKeys).toEqual(new Set(['1-2', '2-3', '3-4']));
  });

  it('分支汇合时选择决定最晚日期的入线', () => {
    const tasks = [
      {
        id: 1,
        date: centerDate,
        links: [
          { toId: 2, label: '9' },
          { toId: 3, label: '5' },
        ],
      },
      {
        id: 2,
        date: addDays(centerDate, 9),
        links: [{ toId: 4, label: '9' }],
      },
      { id: 3, date: addDays(centerDate, 5), links: [{ toId: 4, label: '30' }] },
      { id: 4, date: addDays(centerDate, 35), links: [] },
    ];

    const { taskIds, linkKeys } = computeCriticalPath(tasks, 1);
    expect(taskIds.has(3)).toBe(true);
    expect(taskIds.has(4)).toBe(true);
    expect(linkKeys.has('3-4')).toBe(true);
    expect(linkKeys.has('1-3')).toBe(true);
  });

  it('中心无日期时返回空', () => {
    const tasks = [{ id: 1, date: null, links: [{ toId: 2, label: '3' }] }];
    const result = computeCriticalPath(tasks, 1);
    expect(result.taskIds.size).toBe(0);
    expect(result.linkKeys.size).toBe(0);
  });
});
