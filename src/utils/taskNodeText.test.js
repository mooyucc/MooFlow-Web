import { describe, it, expect, vi } from 'vitest';
import {
  getDisplayTitle,
  getTitleAnchorY,
  resolveTitleForSave,
  translateTitleLine,
  wrapTaskTitleLines,
} from './taskNodeText';

describe('taskNodeText', () => {
  const t = (key) => `tr:${key}`;

  it('translates default title keys for display', () => {
    expect(getDisplayTitle({ title: '中心任务' }, t)).toBe('tr:center_task');
    expect(getDisplayTitle({ title: '自定义' }, t)).toBe('自定义');
  });

  it('keeps original key when edited title matches translation', () => {
    expect(resolveTitleForSave('tr:center_task', '中心任务', t)).toBe('中心任务');
    expect(resolveTitleForSave('我的任务', '中心任务', t)).toBe('我的任务');
  });

  it('wraps long titles into multiple lines', () => {
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => ({
          font: '',
          measureText: (text) => ({ width: text.length * 8 }),
        }),
      }),
    });
    const lines = wrapTaskTitleLines('这是一段很长的任务标题需要换行', 600, 14, 'sans-serif', 40);
    expect(lines.length).toBeGreaterThan(1);
    vi.unstubAllGlobals();
  });

  it('adjusts anchor y for multi-line titles', () => {
    expect(getTitleAnchorY(1)).toBe(32);
    expect(getTitleAnchorY(2)).toBe(20);
  });

  it('translates line content when matching default map', () => {
    expect(translateTitleLine('新任务', t)).toBe('tr:new_task');
    expect(translateTitleLine('自定义', t)).toBe('自定义');
  });
});
