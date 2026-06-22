import { describe, it, expect } from 'vitest';
import { inferTaskType, ensureTaskType, migrateLegacyTaskStructure } from './taskType';

describe('inferTaskType', () => {
  const tasks = [
    { id: 1, parentId: null, level: 0 },
    { id: 2, parentId: 1, level: 1 },
    { id: 3, parentId: 2, level: 2 },
    { id: 4, parentId: 3, level: 3 },
  ];

  it('识别中心任务', () => {
    expect(inferTaskType(tasks[0], tasks)).toBe('center');
  });

  it('识别子任务', () => {
    expect(inferTaskType(tasks[1], tasks)).toBe('sub');
  });

  it('识别细分任务', () => {
    expect(inferTaskType(tasks[2], tasks)).toBe('detail');
    expect(inferTaskType(tasks[3], tasks)).toBe('detail');
  });

  it('保留 independent 类型', () => {
    expect(inferTaskType({ id: 9, type: 'independent', parentId: 1, level: 1 }, tasks)).toBe('independent');
  });
});

describe('ensureTaskType', () => {
  it('为缺少 type 的任务补全类型', () => {
    const input = [{ id: 1, parentId: null, level: 0 }];
    const result = ensureTaskType(input);
    expect(result[0].type).toBe('center');
  });
});

describe('migrateLegacyTaskStructure', () => {
  it('将旧版主线任务改为中心的直接子任务', () => {
    const tasks = [
      { id: 1, parentId: null, type: 'center', links: [{ toId: 2, label: '' }] },
      { id: 2, parentId: null, type: 'main', links: [{ toId: 3, label: '' }] },
      { id: 3, parentId: 2, type: 'sub', links: [] },
    ];
    const migrated = migrateLegacyTaskStructure(tasks);
    expect(migrated.find(t => t.id === 2)).toMatchObject({ parentId: 1, type: 'sub' });
    expect(migrated.find(t => t.id === 1).links).toHaveLength(1);
    expect(migrated.find(t => t.id === 2).links).toHaveLength(1);
  });
});
