import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addDays } from 'date-fns';

const mockUpdateLinkLabel = vi.fn((fromId, toId, label) => {
  mockTasks = mockTasks.map(t => {
    if (t.id !== fromId) return t;
    return {
      ...t,
      links: (t.links || []).map(l =>
        l.toId === toId ? { ...l, label: typeof label === 'string' ? label : '' } : l,
      ),
    };
  });
});

let mockTasks = [];

function applyUpdateTask(id, updates) {
  mockTasks = mockTasks.map(t => (t.id === id ? { ...t, ...updates } : t));
}

const mockUpdateTask = vi.fn((id, updates) => applyUpdateTask(id, updates));

vi.mock('../store/taskStore', () => ({
  useTaskStore: {
    getState: () => ({
      tasks: mockTasks,
      updateTask: mockUpdateTask,
      updateLinkLabel: mockUpdateLinkLabel,
    }),
  },
}));

import { cascadeUpdateDates, updateLinkLabelWithCascade } from './cascadeDates';

describe('updateLinkLabelWithCascade', () => {
  beforeEach(() => {
    mockUpdateTask.mockClear();
    mockUpdateLinkLabel.mockClear();
    mockTasks = [
      {
        id: 1,
        date: new Date('2025-01-01'),
        links: [{ toId: 2, label: '3' }],
      },
      { id: 2, date: null, autoDate: false, links: [] },
    ];
  });

  it('清空 label 时清除目标日期', () => {
    updateLinkLabelWithCascade(1, 2, '');
    expect(mockUpdateLinkLabel).toHaveBeenCalledWith(1, 2, '');
    expect(mockUpdateTask).toHaveBeenCalledWith(2, { date: null, autoDate: false });
  });

  it('数字 label 时推算目标日期', () => {
    updateLinkLabelWithCascade(1, 2, '5');
    expect(mockUpdateTask).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ autoDate: true }),
    );
    expect(mockTasks.find(t => t.id === 2).date).toEqual(addDays(new Date('2025-01-01'), 5));
  });

  it('首次填入数字 label 后立即推算目标日期', () => {
    mockTasks = [
      {
        id: 1,
        date: new Date('2026-06-14'),
        links: [{ toId: 2, label: '' }],
      },
      { id: 2, date: null, links: [] },
    ];
    updateLinkLabelWithCascade(1, 2, '7');
    expect(mockTasks.find(t => t.id === 2).date).toEqual(addDays(new Date('2026-06-14'), 7));
    expect(mockTasks.find(t => t.id === 2).autoDate).toBe(true);
  });
});

describe('cascadeUpdateDates', () => {
  beforeEach(() => {
    mockUpdateTask.mockClear();
    mockTasks = [
      {
        id: 1,
        date: new Date('2025-01-01'),
        links: [{ toId: 2, label: '2' }],
      },
      {
        id: 2,
        date: null,
        autoDate: true,
        links: [{ toId: 3, label: '1' }],
      },
      { id: 3, date: null, autoDate: true, links: [] },
    ];
  });

  it('沿数字 label 链向下推算', () => {
    cascadeUpdateDates(1);
    expect(mockUpdateTask).toHaveBeenCalled();
  });

  it('三级链路：6月14日 +23 → 7月7日 +4 → 7月11日', () => {
    const mainDate = new Date('2026-06-14');
    mockTasks = [
      {
        id: 1,
        date: mainDate,
        links: [{ toId: 2, label: '23' }],
      },
      {
        id: 2,
        date: null,
        links: [{ toId: 3, label: '4' }],
      },
      { id: 3, date: null, links: [] },
    ];

    cascadeUpdateDates(1);

    const sub = mockTasks.find(t => t.id === 2);
    const detail = mockTasks.find(t => t.id === 3);
    expect(sub.date).toEqual(addDays(mainDate, 23));
    expect(sub.autoDate).toBe(true);
    expect(detail.date).toEqual(addDays(mainDate, 23 + 4));
    expect(detail.autoDate).toBe(true);
  });

  it('上游无日期时不应将 autoDate 置为 false，后续补日期可继续级联', () => {
    mockTasks = [
      {
        id: 1,
        date: null,
        links: [{ toId: 2, label: '23' }],
      },
      {
        id: 2,
        date: null,
        links: [{ toId: 3, label: '4' }],
      },
      { id: 3, date: null, links: [] },
    ];

    cascadeUpdateDates(1);

    expect(mockTasks[1].autoDate).not.toBe(false);
    expect(mockTasks[2].autoDate).not.toBe(false);

    mockTasks[0].date = new Date('2026-06-14');
    cascadeUpdateDates(1);

    expect(mockTasks[1].date).toEqual(addDays(new Date('2026-06-14'), 23));
    expect(mockTasks[2].date).toEqual(addDays(new Date('2026-06-14'), 27));
  });
});
