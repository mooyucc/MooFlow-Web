import { describe, it, expect } from 'vitest';
import {
  findAvailablePosition,
  getTasksBoundingBox,
  isRectColliding,
} from './taskPlacement';

describe('isRectColliding', () => {
  it('重叠矩形返回 true', () => {
    expect(isRectColliding(
      { x: 0, y: 0, width: 100, height: 50 },
      { x: 50, y: 25, width: 100, height: 50 },
    )).toBe(true);
  });

  it('不相交矩形返回 false', () => {
    expect(isRectColliding(
      { x: 0, y: 0, width: 100, height: 50 },
      { x: 200, y: 0, width: 100, height: 50 },
    )).toBe(false);
  });
});

describe('findAvailablePosition', () => {
  const tasks = [
    { id: 1, position: { x: 0, y: 0 } },
    { id: 2, position: { x: 300, y: 0 } },
  ];

  it('无碰撞时返回原位置', () => {
    expect(findAvailablePosition({ x: 100, y: 100 }, tasks)).toEqual({ x: 100, y: 100 });
  });

  it('碰撞时向下避让', () => {
    const result = findAvailablePosition({ x: 0, y: 0 }, tasks);
    expect(result.x).toBe(0);
    expect(result.y).toBeGreaterThan(0);
  });

  it('忽略指定任务 id', () => {
    expect(findAvailablePosition({ x: 0, y: 0 }, tasks, 1)).toEqual({ x: 0, y: 0 });
  });
});

describe('getTasksBoundingBox', () => {
  it('空列表返回零包围盒', () => {
    expect(getTasksBoundingBox([])).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  });

  it('计算多任务包围盒', () => {
    const box = getTasksBoundingBox([
      { position: { x: 10, y: 20 } },
      { position: { x: 100, y: 50 } },
    ], 180, 72);
    expect(box).toEqual({ minX: 10, minY: 20, maxX: 280, maxY: 122 });
  });
});
