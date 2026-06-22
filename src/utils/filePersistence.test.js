import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpdateActiveFile = vi.fn();
const mockClearTabSession = vi.fn();
const mockClearTasks = vi.fn();
const mockClearFileHandle = vi.fn(() => Promise.resolve());
let mockTasks = [{ id: 1 }];
let mockActiveId = 1;

vi.mock('../store/taskStore', () => ({
  useTaskStore: {
    getState: () => ({
      tasks: mockTasks,
      clearTasks: mockClearTasks,
    }),
  },
}));

vi.mock('../store/fileStore', () => ({
  useFileStore: {
    getState: () => ({
      activeFileId: mockActiveId,
      updateActiveFile: mockUpdateActiveFile,
      clearTabSession: mockClearTabSession,
      getActiveFile: () => (
        mockActiveId
          ? { id: mockActiveId, name: 'MF001', tasks: mockTasks }
          : null
      ),
    }),
  },
}));

vi.mock('../store/canvasSettingsStore', () => ({
  useCanvasSettingsStore: {
    getState: () => ({
      canvasProps: { mainDirection: 'horizontal' },
      timeScale: 'month',
    }),
  },
}));

vi.mock('./unsavedChanges', () => ({
  clearSavedBaseline: vi.fn(),
}));

vi.mock('./localFileHandle', () => ({
  clearFileHandle: (...args) => mockClearFileHandle(...args),
  clearAllFileHandles: vi.fn(() => Promise.resolve()),
  clearLinkedFilePath: vi.fn(),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  flushProjectToStorage,
  shouldBlockBrowserUnload,
  clearTabProjectData,
  shouldClearTabSessionOnPageHide,
  registerBeforeUnloadGuard,
} from './filePersistence';
import { clearSavedBaseline } from './unsavedChanges';
import { clearAllFileHandles, clearLinkedFilePath } from './localFileHandle';

describe('filePersistence', () => {
  beforeEach(() => {
    mockUpdateActiveFile.mockClear();
    mockClearTabSession.mockClear();
    mockClearTasks.mockClear();
    mockClearFileHandle.mockClear();
    vi.mocked(clearSavedBaseline).mockClear();
    mockTasks = [{ id: 1 }];
    mockActiveId = 1;
  });

  it('有任务时应阻止关闭', () => {
    expect(shouldBlockBrowserUnload()).toBe(true);
  });

  it('无任务时不阻止关闭', () => {
    mockTasks = [];
    mockActiveId = null;
    expect(shouldBlockBrowserUnload()).toBe(false);
  });

  it('flush 写入当前任务', () => {
    flushProjectToStorage();
    expect(mockUpdateActiveFile).toHaveBeenCalled();
  });

  it('clearTabProjectData 清除会话与内存', () => {
    clearTabProjectData();
    expect(mockClearTabSession).toHaveBeenCalled();
    expect(mockClearTasks).toHaveBeenCalled();
    expect(clearSavedBaseline).toHaveBeenCalled();
    expect(clearLinkedFilePath).toHaveBeenCalled();
    expect(mockClearFileHandle).toHaveBeenCalledWith(1);
    expect(clearAllFileHandles).toHaveBeenCalled();
  });

  it('pagehide 非刷新时应清除会话', () => {
    expect(shouldClearTabSessionOnPageHide({ persisted: false })).toBe(true);
  });

  it('pagehide 刷新时不应清除会话', () => {
    vi.stubGlobal('performance', {
      getEntriesByType: () => [{ type: 'reload' }],
      navigation: { type: 1 },
    });
    expect(shouldClearTabSessionOnPageHide({ persisted: false })).toBe(false);
    vi.unstubAllGlobals();
  });

  it('registerBeforeUnloadGuard 在 pagehide 时清除数据', () => {
    const cleanup = registerBeforeUnloadGuard();
    window.dispatchEvent(new Event('pagehide'));
    expect(mockClearTabSession).toHaveBeenCalled();
    cleanup();
  });
});
