export const TIMELINE_TICK_WIDTH = 300;

const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif";

/** 时间轴基线 y 坐标（画布坐标系） */
export function getTimelineBaselineY(transform, offsetFromBottom = 60) {
  return window.innerHeight / transform.scale - offsetFromBottom - transform.offsetY / transform.scale;
}

export { FONT_STACK as TIMELINE_FONT };

export function getWeekStart(date, lang) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  let day = d.getDay();
  if (lang === 'zh') {
    day = (day + 6) % 7;
  }
  d.setDate(d.getDate() - day);
  return d;
}

export function getWeekNumber(d, lang) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  if (lang === 'zh') {
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    week1.setDate(week1.getDate() + 3 - ((week1.getDay() + 6) % 7));
    return 1 + Math.round((date - week1) / (7 * 24 * 3600 * 1000));
  }
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/** 生成时间轴刻度 */
export function generateTimelineTicks({ firstTask, startDate, timeScale, lang }) {
  if (!firstTask) return [];

  const scale = TIMELINE_TICK_WIDTH;
  const ticks = [];
  const anchorX = firstTask.position.x;

  if (timeScale === 'month') {
    for (let i = -12; i < 60; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      ticks.push({
        label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
        date: d,
        x: anchorX + i * scale,
      });
    }
  } else if (timeScale === 'week') {
    const start = getWeekStart(startDate, lang);
    for (let i = -52; i < 260; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 7);
      ticks.push({
        label: `${d.getFullYear()}年第${getWeekNumber(d, lang)}周`,
        date: d,
        x: anchorX + i * scale,
      });
    }
  } else if (timeScale === 'day') {
    for (let i = -365; i < 365 * 5; i++) {
      const d = new Date(startDate);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      ticks.push({
        label: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
        date: d,
        x: anchorX + i * scale,
      });
    }
  }

  return ticks;
}

/** 计算「今天」在时间轴上的 x 坐标，不可见时返回 null */
export function computeTodayMarkerX({ ticks, timeScale, lang, today = new Date() }) {
  if (ticks.length === 0) return null;

  today.setHours(0, 0, 0, 0);
  const firstTick = ticks[0];
  const firstX = firstTick.x;
  const scale = TIMELINE_TICK_WIDTH;
  let todayX = null;

  if (timeScale === 'month') {
    const monthDiff = (today.getFullYear() - firstTick.date.getFullYear()) * 12
      + (today.getMonth() - firstTick.date.getMonth());
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayRatio = (today.getDate() - 1) / daysInMonth;
    todayX = firstX + monthDiff * scale + dayRatio * scale;
  } else if (timeScale === 'week') {
    const firstWeekStart = getWeekStart(firstTick.date, lang);
    const todayWeekStart = getWeekStart(today, lang);
    const weekDiff = Math.floor((todayWeekStart - firstWeekStart) / (7 * 24 * 3600 * 1000));
    const todayDayOfWeek = lang === 'zh' ? (today.getDay() + 6) % 7 : today.getDay();
    todayX = firstX + weekDiff * scale + (todayDayOfWeek / 7) * scale;
  } else if (timeScale === 'day') {
    const dayDiff = Math.floor((today - firstTick.date) / (24 * 3600 * 1000));
    todayX = firstX + dayDiff * scale;
  }

  if (todayX === null || todayX < ticks[0].x - 100 || todayX > ticks[ticks.length - 1].x + 100) {
    return null;
  }
  return todayX;
}

/** 计算任务日期相对起点的刻度偏移量 */
export function computeDateOffsetFromStart(taskDate, startDate, timeScale) {
  const start = new Date(startDate);
  const date = new Date(taskDate);

  if (timeScale === 'month') {
    return (date.getFullYear() - start.getFullYear()) * 12 + (date.getMonth() - start.getMonth());
  }

  if (timeScale === 'week') {
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return Math.floor((date - start) / (7 * 24 * 3600 * 1000));
  }

  start.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.floor((date - start) / (24 * 3600 * 1000));
}

/** 将有日期的任务 x 坐标对齐到时间轴 */
export function alignTasksToTimeline(tasks, timeScale, updateTask) {
  if (!tasks.length) return;

  const firstTask = tasks[0];
  const startDate = firstTask?.date ? new Date(firstTask.date) : new Date();
  const startX = firstTask?.position.x ?? 0;

  tasks.forEach(task => {
    if (!task.date) return;
    const diff = computeDateOffsetFromStart(task.date, startDate, timeScale);
    const targetX = startX + diff * TIMELINE_TICK_WIDTH;
    updateTask(task.id, { position: { x: targetX, y: task.position.y } });
  });
}
