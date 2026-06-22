import { describe, it, expect, vi } from 'vitest';
import { buildExportFileName, buildExportPayload, parseImportedProject } from './fileImportExport';

describe('buildExportFileName', () => {
  it('清理非法字符并附加扩展名', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:30:00'));
    expect(buildExportFileName('MF001', 'json')).toBe('MF001-202506011230.json');
    vi.useRealTimers();
  });
});

describe('buildExportPayload', () => {
  it('包含任务与布局元数据', () => {
    const payload = buildExportPayload(
      { tasks: [{ id: 1 }], mainDirection: 'vertical' },
      { showGrid: true },
      'week',
    );
    expect(payload.tasks).toHaveLength(1);
    expect(payload.mainDirection).toBe('vertical');
    expect(payload.timeScale).toBe('week');
  });
});

describe('parseImportedProject', () => {
  it('兼容旧版任务数组', () => {
    const result = parseImportedProject(JSON.stringify([{ id: 1, title: 'A' }]));
    expect(result.tasks).toHaveLength(1);
    expect(result.mainDirection).toBe('horizontal');
  });

  it('解析新版项目对象', () => {
    const result = parseImportedProject(JSON.stringify({
      tasks: [{ id: 2 }],
      mainDirection: 'vertical',
      timeScale: 'day',
    }));
    expect(result.mainDirection).toBe('vertical');
    expect(result.timeScale).toBe('day');
  });

  it('非法 JSON 抛出错误', () => {
    expect(() => parseImportedProject('{bad')).toThrow('文件格式不正确');
  });
});
