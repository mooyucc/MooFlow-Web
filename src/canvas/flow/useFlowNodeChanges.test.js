import { describe, it, expect, vi } from 'vitest';
import { syncSelectionFromNodes } from './useFlowNodeChanges';

describe('syncSelectionFromNodes', () => {
  it('clears selection when empty', () => {
    const setSelectedElement = vi.fn();
    const setSelectedTaskIds = vi.fn();
    syncSelectionFromNodes([], setSelectedElement, setSelectedTaskIds);
    expect(setSelectedElement).toHaveBeenCalledWith(null);
    expect(setSelectedTaskIds).toHaveBeenCalledWith([]);
  });

  it('sets single task selection', () => {
    const setSelectedElement = vi.fn();
    const setSelectedTaskIds = vi.fn();
    syncSelectionFromNodes([3], setSelectedElement, setSelectedTaskIds);
    expect(setSelectedElement).toHaveBeenCalledWith({ type: 'task', id: 3 });
    expect(setSelectedTaskIds).toHaveBeenCalledWith([]);
  });

  it('sets multi task selection', () => {
    const setSelectedElement = vi.fn();
    const setSelectedTaskIds = vi.fn();
    syncSelectionFromNodes([2, 4, 5], setSelectedElement, setSelectedTaskIds);
    expect(setSelectedElement).toHaveBeenCalledWith(null);
    expect(setSelectedTaskIds).toHaveBeenCalledWith([2, 4, 5]);
  });
});
