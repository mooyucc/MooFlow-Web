import { ANCHORS, NODE_H_GAP, NODE_V_GAP } from '../constants/nodeLayout';
import { findAvailablePosition } from './taskPlacement';

const GRAY_LINK = { color: '#86868b' };

function buildChildLink(task, tasks, mainDirection) {
  const isHorizontal = mainDirection === 'horizontal';
  const children = tasks.filter(t => t.parentId === task.id);

  if (isHorizontal) {
    let newY = task.position.y + NODE_V_GAP;
    if (children.length > 0) {
      newY = Math.max(...children.map(c => c.position.y)) + NODE_V_GAP;
    }
    return {
      newPosition: { x: task.position.x, y: newY },
      fromAnchor: ANCHORS.DownAnchor,
      toAnchor: ANCHORS.UpAnchor,
    };
  }

  const maxX = children.length > 0
    ? Math.max(...children.map(c => c.position.x), task.position.x)
    : task.position.x;
  return {
    newPosition: { x: maxX + NODE_H_GAP, y: task.position.y },
    fromAnchor: ANCHORS.RightAnchor,
    toAnchor: ANCHORS.LeftAnchor,
  };
}

/**
 * 根据选中任务类型与布局方向，计算新建子任务的布局与连线信息
 * @returns {{ newTask: object, link: { fromAnchor, toAnchor, color } | null } | null}
 */
export function buildChildTaskFromSelection(task, tasks, mainDirection = 'horizontal') {
  if (!task) return null;

  let newType = '';
  let newTitle = '';
  let newParentId = task.id;
  let newLevel = (task.level || 0) + 1;
  let newPosition = { x: task.position.x + NODE_H_GAP, y: task.position.y };
  let fromAnchor = ANCHORS.RightAnchor;
  let toAnchor = ANCHORS.LeftAnchor;
  let link = null;

  if (task.type === 'center') {
    const layout = buildChildLink(task, tasks, mainDirection);
    newPosition = layout.newPosition;
    fromAnchor = layout.fromAnchor;
    toAnchor = layout.toAnchor;
    newType = 'sub';
    newTitle = '子任务';
    newLevel = 1;
    link = { fromAnchor, toAnchor, ...GRAY_LINK };
  } else if (task.type === 'sub') {
    const layout = buildChildLink(task, tasks, mainDirection);
    newPosition = layout.newPosition;
    fromAnchor = layout.fromAnchor;
    toAnchor = layout.toAnchor;
    newType = 'detail';
    newTitle = '细分任务';
    link = { fromAnchor, toAnchor, ...GRAY_LINK };
  } else if (task.type === 'independent') {
    const layout = buildChildLink(task, tasks, mainDirection);
    newPosition = layout.newPosition;
    fromAnchor = layout.fromAnchor;
    toAnchor = layout.toAnchor;
    newType = 'detail';
    newTitle = '细分任务';
    link = { fromAnchor, toAnchor, ...GRAY_LINK };
  } else if (task.type === 'detail') {
    const siblings = tasks.filter(t => t.parentId === task.id);
    const maxX = siblings.length > 0
      ? Math.max(...siblings.map(c => c.position.x), task.position.x)
      : task.position.x;
    newPosition = { x: maxX + NODE_H_GAP, y: task.position.y };
    newType = 'detail';
    newTitle = '细分任务';
    fromAnchor = ANCHORS.RightAnchor;
    toAnchor = ANCHORS.LeftAnchor;
    link = { fromAnchor, toAnchor, ...GRAY_LINK };
  } else {
    return null;
  }

  const finalPosition = findAvailablePosition(newPosition, tasks);

  return {
    newTask: {
      id: Date.now(),
      title: newTitle,
      position: finalPosition,
      links: [],
      parentId: newParentId,
      level: newLevel,
      type: newType,
    },
    link,
  };
}
