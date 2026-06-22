import { describe, it, expect, vi } from 'vitest';
import { getIncomingLink, getBranchStyleValue } from './branchStyle';

vi.mock('../store/taskStore', () => ({
  useTaskStore: {
    getState: () => ({
      tasks: [
        {
          id: 1,
          links: [{ toId: 2, lineStyle: 'dashed', color: '#ff0000' }],
        },
        { id: 2, links: [] },
        {
          id: 3,
          links: [{ toId: 4, lineStyle: 'solid', color: '#00ff00' }],
        },
        { id: 4, links: [] },
      ],
    }),
  },
  defaultLinkStyle: {
    lineStyle: 'solid',
    arrowStyle: 'normal',
    lineWidth: 2,
    color: '#86868b',
  },
}));

const tasks = [
  { id: 1, links: [{ toId: 2, lineStyle: 'dashed', color: '#ff0000' }] },
  { id: 2, links: [] },
  { id: 3, links: [{ toId: 4, lineStyle: 'solid', color: '#00ff00' }] },
  { id: 4, links: [] },
];

describe('getIncomingLink', () => {
  it('返回指向目标任务的连线', () => {
    const link = getIncomingLink(2, tasks);
    expect(link).toEqual({ toId: 2, lineStyle: 'dashed', color: '#ff0000' });
  });

  it('无入边时返回 null', () => {
    expect(getIncomingLink(1, tasks)).toBeNull();
    expect(getIncomingLink(null, tasks)).toBeNull();
  });
});

describe('getBranchStyleValue', () => {
  it('选中连线时读取连线样式', () => {
    const value = getBranchStyleValue('lineStyle', {
      selectedLink: { fromId: 1, toId: 2 },
      selectedTasks: [],
      tasks,
    });
    expect(value).toBe('dashed');
  });

  it('多选且样式一致时返回该值', () => {
    const selectedTasks = [
      { id: 2 },
      { id: 4 },
    ];
    const sameTasks = [
      { id: 1, links: [{ toId: 2, color: '#111111' }] },
      { id: 2, links: [] },
      { id: 3, links: [{ toId: 4, color: '#111111' }] },
      { id: 4, links: [] },
    ];
    expect(getBranchStyleValue('color', { selectedLink: null, selectedTasks, tasks: sameTasks })).toBe('#111111');
  });

  it('多选且样式不一致时返回默认值', () => {
    const selectedTasks = [{ id: 2 }, { id: 4 }];
    expect(getBranchStyleValue('color', { selectedLink: null, selectedTasks, tasks })).toBe('#86868b');
  });
});
