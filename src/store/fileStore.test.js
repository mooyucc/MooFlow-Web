import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDefaultFile } from '../store/fileStore';

describe('createDefaultFile', () => {
  it('创建带默认任务的新文件', () => {
    const file = createDefaultFile('vertical');
    expect(file.mainDirection).toBe('vertical');
    expect(file.timeScale).toBe('month');
    expect(file.tasks).toHaveLength(1);
    expect(file.tasks[0].title).toBe('中心任务');
    expect(file.tasks[0].lock).toBe(true);
  });

  it('默认水平布局', () => {
    const file = createDefaultFile();
    expect(file.mainDirection).toBe('horizontal');
  });
});

describe('fileStore persistence keys', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('createDefaultFile 生成唯一 id', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const a = createDefaultFile();
    vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
    const b = createDefaultFile();
    vi.useRealTimers();
    expect(a.id).not.toBe(b.id);
  });
});
