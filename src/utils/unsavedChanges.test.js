import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockTasks = [{ id: 1, title: 'A', links: [] }];
let mockFile = { id: 1, name: 'MF001', tasks: mockTasks };
let mockCanvasProps = { mainDirection: 'horizontal' };
let mockTimeScale = 'month';

vi.mock('../store/taskStore', () => ({
  useTaskStore: {
    getState: () => ({ tasks: mockTasks }),
  },
}));

vi.mock('../store/fileStore', () => ({
  useFileStore: {
    getState: () => ({
      getActiveFile: () => mockFile,
    }),
  },
}));

vi.mock('../store/canvasSettingsStore', () => ({
  useCanvasSettingsStore: {
    getState: () => ({
      canvasProps: mockCanvasProps,
      timeScale: mockTimeScale,
    }),
  },
}));

import {
  getCurrentProjectSnapshot,
  setSavedBaseline,
  hasUnsavedChanges,
  resetUnsavedBaselineForTests,
} from './unsavedChanges';

describe('unsavedChanges', () => {
  beforeEach(() => {
    resetUnsavedBaselineForTests();
    mockTasks[0] = { id: 1, title: 'A', links: [] };
  });

  it('无基线且有任务时视为未保存', () => {
    expect(hasUnsavedChanges()).toBe(true);
  });

  it('与基线一致时视为已保存', () => {
    setSavedBaseline(getCurrentProjectSnapshot());
    expect(hasUnsavedChanges()).toBe(false);
  });

  it('任务变更后检测到未保存', () => {
    setSavedBaseline(getCurrentProjectSnapshot());
    mockTasks[0] = { id: 1, title: 'B', links: [] };
    expect(hasUnsavedChanges()).toBe(true);
  });
});
