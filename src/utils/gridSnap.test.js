import { describe, it, expect } from 'vitest';
import { snapPositionToGrid, snapTasksPositionsToGrid } from './gridSnap';

describe('snapPositionToGrid', () => {
  it('snaps top-left corner to nearest grid intersection', () => {
    expect(snapPositionToGrid(103, 87, 20)).toEqual({ x: 100, y: 80 });
    expect(snapPositionToGrid(109, 91, 20)).toEqual({ x: 100, y: 100 });
  });

  it('returns original position when grid size is invalid', () => {
    expect(snapPositionToGrid(103, 87, 0)).toEqual({ x: 103, y: 87 });
    expect(snapPositionToGrid(103, 87, null)).toEqual({ x: 103, y: 87 });
  });
});

describe('snapTasksPositionsToGrid', () => {
  it('snaps all task positions to grid', () => {
    const tasks = [
      { id: 1, position: { x: 103, y: 87 } },
      { id: 2, position: { x: 20, y: 40 } },
    ];
    const result = snapTasksPositionsToGrid(tasks, 20);
    expect(result[0].position).toEqual({ x: 100, y: 80 });
    expect(result[1].position).toEqual({ x: 20, y: 40 });
  });
});
