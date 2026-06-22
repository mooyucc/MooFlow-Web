import { describe, it, expect } from 'vitest';
import { tasksToNodes, tasksToEdges, viewportToTransform, screenToFlowPoint } from './flowAdapter';

describe('flowAdapter', () => {
  const tasks = [
    { id: 1, parentId: null, type: 'center', position: { x: 0, y: 0 }, links: [{ toId: 2, label: '3' }] },
    { id: 2, parentId: 1, type: 'sub', position: { x: 300, y: 0 }, links: [] },
    { id: 3, parentId: 2, type: 'detail', position: { x: 0, y: 200 }, links: [] },
  ];

  it('tasksToNodes maps visible tasks with selection', () => {
    const nodes = tasksToNodes(tasks, { rootTaskId: 1, selectedTaskId: 2 });
    expect(nodes).toHaveLength(3);
    expect(nodes[0].id).toBe('1');
    expect(nodes[0].data.isFirst).toBe(true);
    expect(nodes[1].selected).toBe(true);
    expect(nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it('tasksToEdges only includes stored parent-child links', () => {
    const visible = new Set([1, 2, 3]);
    const edges = tasksToEdges(tasks, visible, 'horizontal');
    expect(edges.find(e => e.id.startsWith('chain-'))).toBeUndefined();
    expect(edges.find(e => e.id === 'link-1-2')).toBeDefined();
  });

  it('viewportToTransform maps react flow viewport', () => {
    expect(viewportToTransform({ x: 100, y: 200, zoom: 1.5 })).toEqual({
      scale: 1.5,
      offsetX: 100,
      offsetY: 200,
    });
  });

  it('screenToFlowPoint converts screen coords', () => {
    expect(screenToFlowPoint(200, 300, { x: 100, y: 50, zoom: 2 })).toEqual({
      x: 50,
      y: 125,
    });
  });
});
