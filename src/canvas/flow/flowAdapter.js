import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import { getDefaultLinkColor } from '../../utils/taskType';
import {
  CRITICAL_PATH_COLOR,
  CRITICAL_PATH_LINE_WIDTH,
  CRITICAL_PATH_DIM_OPACITY,
} from '../../utils/criticalPath';

export function taskIdToNodeId(taskId) {
  return String(taskId);
}

export function nodeIdToTaskId(nodeId) {
  return Number(nodeId);
}

/**
 * @param {import('../../store/taskStore').Task[]} visibleTasks
 * @param {{ selectedLink?: { fromId: number, toId: number } | null, criticalPath?: { taskIds: Set<number>, linkKeys: Set<string> } | null, showCriticalPath?: boolean }} options
 */
export function tasksToNodes(visibleTasks, options = {}) {
  const { rootTaskId, selectedTaskId = null, selectedTaskIds = [], criticalPath = null, showCriticalPath = false } = options;

  return visibleTasks.map((task) => {
    const selected = selectedTaskId === task.id || selectedTaskIds.includes(task.id);
    const isCritical = showCriticalPath && criticalPath?.taskIds.has(task.id);
    const dimmed = showCriticalPath && criticalPath && !isCritical;

    return {
      id: taskIdToNodeId(task.id),
      type: 'taskNode',
      position: { x: task.position.x, y: task.position.y },
      data: {
        taskId: task.id,
        isFirst: task.id === rootTaskId,
        isCritical,
        dimmed,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      initialWidth: NODE_WIDTH,
      initialHeight: NODE_HEIGHT,
      selected,
      draggable: true,
    };
  });
}

/**
 * @param {import('../../store/taskStore').Task[]} tasks
 * @param {Set<number>} visibleTaskIds
 * @param {string} mainDirection
 * @param {{ selectedLink?: { fromId: number, toId: number } | null }} options
 */
export function tasksToEdges(tasks, visibleTaskIds, mainDirection = 'horizontal', options = {}) {
  const { selectedLink = null, criticalPath = null, showCriticalPath = false } = options;
  const edges = [];

  tasks.forEach((task) => {
    if (!Array.isArray(task.links)) return;
    task.links.forEach((link) => {
      const target = tasks.find(t => t.id === link.toId);
      if (!target) return;
      if (!visibleTaskIds.has(task.id) || !visibleTaskIds.has(link.toId)) return;

      const edgeKey = `${task.id}-${link.toId}`;
      const isCritical = showCriticalPath && criticalPath?.linkKeys.has(edgeKey);
      const dimmed = showCriticalPath && criticalPath && !isCritical;
      const lineColor = isCritical ? CRITICAL_PATH_COLOR : getDefaultLinkColor(link);
      const lineWidth = isCritical ? CRITICAL_PATH_LINE_WIDTH : (link.lineWidth || 2);

      edges.push({
        id: `link-${edgeKey}`,
        source: taskIdToNodeId(task.id),
        target: taskIdToNodeId(link.toId),
        type: 'mooFlowEdge',
        selectable: false,
        focusable: false,
        data: {
          kind: 'link',
          fromId: task.id,
          toId: link.toId,
          fromAnchor: link.fromAnchor,
          toAnchor: link.toAnchor,
          label: typeof link.label === 'string' ? link.label : '',
          lineStyle: link.lineStyle || 'solid',
          arrowStyle: link.arrowStyle || 'normal',
          lineWidth,
          color: lineColor,
          isCritical,
          dimmed,
          dimOpacity: CRITICAL_PATH_DIM_OPACITY,
        },
        style: {
          stroke: lineColor,
          strokeWidth: lineWidth,
          strokeDasharray: link.lineStyle === 'dashed' ? '6 4' : link.lineStyle === 'dotted' ? '2 4' : undefined,
          opacity: dimmed ? CRITICAL_PATH_DIM_OPACITY : 1,
        },
        selected: selectedLink?.fromId === task.id && selectedLink?.toId === link.toId,
      });
    });
  });

  return edges;
}

/** React Flow viewport → MooFlow transform（供 TimelineRuler 等复用） */
export function viewportToTransform(viewport) {
  return {
    scale: viewport.zoom,
    offsetX: viewport.x,
    offsetY: viewport.y,
  };
}

/** 屏幕坐标 → 画布坐标 */
export function screenToFlowPoint(clientX, clientY, viewport) {
  return {
    x: (clientX - viewport.x) / viewport.zoom,
    y: (clientY - viewport.y) / viewport.zoom,
  };
}
