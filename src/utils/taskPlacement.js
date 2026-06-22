import { NODE_WIDTH, NODE_HEIGHT, NODE_PADDING_Y } from '../constants/nodeLayout';

/** 检查两个矩形是否重叠 */
export function isRectColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width
    && rect1.x + rect1.width > rect2.x
    && rect1.y < rect2.y + rect2.height
    && rect1.y + rect1.height > rect2.y
  );
}

/**
 * 寻找一个不会与其他任务卡片碰撞的可用位置
 * @param {object} proposedPosition - { x, y }
 * @param {Array} allTasks
 * @param {number|null} ignoreTaskId
 * @param {{ width?: number, height?: number, paddingY?: number }} [options]
 */
export function findAvailablePosition(
  proposedPosition,
  allTasks,
  ignoreTaskId = null,
  options = {},
) {
  const width = options.width ?? NODE_WIDTH;
  const height = options.height ?? NODE_HEIGHT;
  const paddingY = options.paddingY ?? NODE_PADDING_Y;

  let finalPosition = { ...proposedPosition };
  let collisionDetected = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  do {
    collisionDetected = false;
    const finalRect = { ...finalPosition, width, height };

    for (const task of allTasks) {
      if (task.id === ignoreTaskId) continue;

      const taskRect = { ...task.position, width, height };

      if (isRectColliding(finalRect, taskRect)) {
        collisionDetected = true;
        finalPosition.y = task.position.y + height + paddingY;
        break;
      }
    }
    attempts++;
  } while (collisionDetected && attempts < MAX_ATTEMPTS);

  return finalPosition;
}

/** 计算任务列表的包围盒 */
export function getTasksBoundingBox(
  tasksToBound,
  width = NODE_WIDTH,
  height = NODE_HEIGHT,
) {
  if (!tasksToBound || tasksToBound.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  tasksToBound.forEach((task) => {
    const { x, y } = task.position;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return { minX, minY, maxX, maxY };
}
