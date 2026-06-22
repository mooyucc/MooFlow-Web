import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildChildTaskFromSelection } from './createChildTask';

describe('buildChildTaskFromSelection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const center = { id: 1, type: 'center', parentId: null, level: 0, position: { x: 0, y: 0 } };
  const sub = { id: 2, type: 'sub', parentId: 1, level: 1, position: { x: 300, y: 0 } };

  it('中心任务新建子任务并带灰色连线', () => {
    const result = buildChildTaskFromSelection(center, [center], 'horizontal');
    expect(result.newTask.type).toBe('sub');
    expect(result.newTask.parentId).toBe(center.id);
    expect(result.link?.color).toBe('#86868b');
    expect(result.newTask.id).toBe(Date.now());
  });

  it('子任务新建细分任务并带灰色连线', () => {
    const result = buildChildTaskFromSelection(sub, [center, sub], 'horizontal');
    expect(result.newTask.type).toBe('detail');
    expect(result.newTask.parentId).toBe(sub.id);
    expect(result.link?.color).toBe('#86868b');
  });

  it('细分任务横向排列', () => {
    const detail = { id: 3, type: 'detail', parentId: 2, level: 2, position: { x: 300, y: 180 } };
    const result = buildChildTaskFromSelection(detail, [center, sub, detail], 'horizontal');
    expect(result.newTask.type).toBe('detail');
    expect(result.newTask.position.x).toBeGreaterThan(detail.position.x);
  });

  it('未知类型返回 null', () => {
    expect(buildChildTaskFromSelection(null, [])).toBeNull();
  });
});
