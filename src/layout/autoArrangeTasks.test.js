import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from '../store/taskStore';
import { autoArrangeTasks } from '../layout/autoArrangeTasks';

describe('autoArrangeTasks', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [
        { id: 1, parentId: null, level: 0, position: { x: 0, y: 0 }, links: [] },
        { id: 2, parentId: 1, level: 1, position: { x: 50, y: 50 }, links: [] },
      ],
      undoStack: [],
      redoStack: [],
    });
  });

  it('水平布局时更新任务位置', () => {
    const setTransform = vi.fn();
    autoArrangeTasks('horizontal', setTransform);

    const tasks = useTaskStore.getState().tasks;
    const center = tasks.find(t => t.id === 1);
    const sub = tasks.find(t => t.id === 2);

    expect(center.position.x).toBe(100);
    expect(center.position.y).toBe(200);
    expect(sub.position.x).toBe(400);
    expect(sub.position.y).toBe(200);
    expect(setTransform).toHaveBeenCalled();
  });
});
