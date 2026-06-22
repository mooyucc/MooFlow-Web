import { describe, it, expect } from 'vitest';
import {
  getWeekStart,
  getWeekNumber,
  generateTimelineTicks,
  computeDateOffsetFromStart,
  TIMELINE_TICK_WIDTH,
} from './timeline';

describe('timeline utils', () => {
  const firstTask = {
    id: 1,
    position: { x: 200, y: 100 },
    date: '2026-06-01T00:00:00.000Z',
  };
  const startDate = new Date('2026-06-01T00:00:00.000Z');

  it('generateTimelineTicks 月颗粒度生成刻度', () => {
    const ticks = generateTimelineTicks({
      firstTask,
      startDate,
      timeScale: 'month',
      lang: 'zh',
    });
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[12].x).toBe(firstTask.position.x);
  });

  it('computeDateOffsetFromStart 月差计算', () => {
    const offset = computeDateOffsetFromStart('2026-08-15', startDate, 'month');
    expect(offset).toBe(2);
  });

  it('computeDateOffsetFromStart 日差计算', () => {
    const offset = computeDateOffsetFromStart('2026-06-11', startDate, 'day');
    expect(offset).toBe(10);
  });

  it('getWeekStart 中文环境以周一为起点', () => {
    const wed = new Date('2026-06-10T12:00:00');
    const weekStart = getWeekStart(wed, 'zh');
    expect(weekStart.getDay()).toBe(1);
  });

  it('TIMELINE_TICK_WIDTH 为固定值', () => {
    expect(TIMELINE_TICK_WIDTH).toBe(300);
  });
});

describe('getWeekNumber', () => {
  it('返回正整数周次', () => {
    const week = getWeekNumber(new Date('2026-06-10'), 'zh');
    expect(week).toBeGreaterThan(0);
  });
});
