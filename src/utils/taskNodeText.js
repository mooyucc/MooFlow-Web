import { NODE_WIDTH } from '../constants/nodeLayout';

export const CARD_PADDING_X = 18;
export const CARD_TEXT_WIDTH = NODE_WIDTH - CARD_PADDING_X * 2;

export const DEFAULT_TITLE_MAP = {
  '中心任务': 'center_task',
  '主线任务': 'main_task',
  '子任务': 'child_task',
  '细分任务': 'fine_task',
  '新任务': 'new_task',
};

const DEFAULT_FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif';

export function getDisplayTitle(task, t) {
  if (DEFAULT_TITLE_MAP[task.title]) {
    return t(DEFAULT_TITLE_MAP[task.title]);
  }
  return task.title;
}

export function wrapTaskTitleLines(title, fontWeight, fontSize, fontFamily, maxWidth = CARD_TEXT_WIDTH) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `${fontWeight || 600} ${fontSize || 14}px ${fontFamily || DEFAULT_FONT_FAMILY}`;
  const words = (title || '').split('');
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function getTitleAnchorY(lineCount) {
  return lineCount > 1 ? 20 : 32;
}

export function resolveTitleForSave(title, taskTitle, t) {
  if (DEFAULT_TITLE_MAP[taskTitle] && title === t(DEFAULT_TITLE_MAP[taskTitle])) {
    return taskTitle;
  }
  return title;
}

export function translateTitleLine(line, t) {
  return DEFAULT_TITLE_MAP[line] ? t(DEFAULT_TITLE_MAP[line]) : line;
}
