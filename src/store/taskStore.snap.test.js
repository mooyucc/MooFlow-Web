import { beforeEach, describe, expect, it } from 'vitest';
import { useTaskStore } from '../store/taskStore';

describe('snapAllTasksToGrid', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [
        { id: 1, position: { x: 103, y: 87 }, links: [] },
        { id: 2, position: { x: 100, y: 100 }, links: [] },
      ],
      undoStack: [],
      redoStack: [],
      layoutVersion: 0,
    });
  });

  it('aligns all task top-left corners to the grid', () => {
    useTaskStore.getState().snapAllTasksToGrid(20);

    const { tasks, layoutVersion } = useTaskStore.getState();
    expect(tasks[0].position).toEqual({ x: 100, y: 80 });
    expect(tasks[1].position).toEqual({ x: 100, y: 100 });
    expect(layoutVersion).toBe(1);
  });

  it('does nothing when every task is already aligned', () => {
    useTaskStore.getState().snapAllTasksToGrid(20);

    useTaskStore.getState().snapAllTasksToGrid(20);

    expect(useTaskStore.getState().layoutVersion).toBe(1);
  });
});
