import { describe, it, expect, vi } from 'vitest';
import { applyPaletteToTasks, resolveNewTaskFillColor } from './taskPalette';
import { defaultTaskStyle } from '../store/taskStore';

describe('resolveNewTaskFillColor', () => {
  const center = { id: 1, parentId: null, type: 'center' };
  const branch1 = { id: 2, parentId: 1, type: 'sub', fillColor: '#F15A4A' };

  it('无配色方案时使用默认颜色', () => {
    const newTask = { parentId: 1, type: 'sub' };
    expect(resolveNewTaskFillColor(newTask, [center], null)).toBe(defaultTaskStyle.fillColor);
  });

  it('新建分支任务应用配色方案中的下一个颜色', () => {
    const newTask = { parentId: 1, type: 'sub' };
    expect(resolveNewTaskFillColor(newTask, [center, branch1], 0)).toBe('#F6C244');
  });

  it('新建细分任务继承分支颜色的淡化色', () => {
    const newTask = { parentId: 2, type: 'detail' };
    const color = resolveNewTaskFillColor(newTask, [center, branch1], 0);
    expect(color).not.toBe(defaultTaskStyle.fillColor);
    expect(color).not.toBe('#F15A4A');
  });

  it('已有 fillColor 时不覆盖', () => {
    const newTask = { parentId: 1, type: 'sub', fillColor: '#123456' };
    expect(resolveNewTaskFillColor(newTask, [center], 0)).toBe('#123456');
  });
});

describe('applyPaletteToTasks', () => {
  it('无配色方案时重置分支及子任务颜色', () => {
    const updateTask = vi.fn();
    const tasks = [
      { id: 1, parentId: null },
      { id: 2, parentId: 1, fillColor: '#F15A4A' },
      { id: 3, parentId: 2, fillColor: '#F15A4A' },
    ];

    applyPaletteToTasks(tasks, null, updateTask);
    expect(updateTask).toHaveBeenCalled();
  });

  it('应用配色方案到各分支任务', () => {
    const updateTask = vi.fn();
    const tasks = [
      { id: 1, parentId: null },
      { id: 2, parentId: 1 },
      { id: 3, parentId: 1 },
    ];

    applyPaletteToTasks(tasks, 0, updateTask);
    const coloredUpdates = updateTask.mock.calls.filter(([, patch]) => patch.fillColor === '#F15A4A');
    expect(coloredUpdates.length).toBeGreaterThan(0);
  });
});
