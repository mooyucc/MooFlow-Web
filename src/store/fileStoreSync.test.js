import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockImportTasks = vi.fn();
let mockFiles = [{ id: 1, tasks: [{ id: 10, title: 'A' }] }];
let mockActiveFileId = 1;

vi.mock('./fileStore', () => ({
  useFileStore: {
    getState: () => ({
      files: mockFiles,
      activeFileId: mockActiveFileId,
    }),
    setState: vi.fn((partial) => {
      if (typeof partial === 'function') {
        const next = partial({ files: mockFiles, activeFileId: mockActiveFileId });
        if (next.files) mockFiles = next.files;
        if (next.activeFileId != null) mockActiveFileId = next.activeFileId;
      } else {
        if (partial.files) mockFiles = partial.files;
        if (partial.activeFileId != null) mockActiveFileId = partial.activeFileId;
      }
    }),
  },
}));

vi.mock('./taskStore', () => ({
  useTaskStore: {
    getState: () => ({
      importTasks: mockImportTasks,
    }),
  },
}));

import { FILE_STORAGE_KEYS, handleStorageSyncEvent } from './fileStoreSync';

describe('initFileStoreCrossTabSync', () => {
  beforeEach(() => {
    mockImportTasks.mockClear();
    mockFiles = [{ id: 1, tasks: [{ id: 10, title: 'A' }] }];
    mockActiveFileId = 1;
  });

  it('FILES 变更时重载任务', () => {
    handleStorageSyncEvent({
      key: FILE_STORAGE_KEYS.FILES,
      newValue: JSON.stringify([{ id: 1, tasks: [{ id: 20, title: 'B' }] }]),
    });

    expect(mockImportTasks).toHaveBeenCalledWith([{ id: 20, title: 'B' }]);
  });
});
