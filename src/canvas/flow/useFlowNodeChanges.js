import { useRef, useCallback } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import { nodeIdToTaskId } from './flowAdapter';

export function syncSelectionFromNodes(selectedIds, setSelectedElement, setSelectedTaskIds) {
  if (selectedIds.length === 0) {
    setSelectedElement(null);
    setSelectedTaskIds([]);
    return;
  }
  if (selectedIds.length === 1) {
    setSelectedElement({ type: 'task', id: selectedIds[0] });
    setSelectedTaskIds([]);
    return;
  }
  setSelectedElement(null);
  setSelectedTaskIds(selectedIds);
}

/**
 * 节点变更：位置同步 taskStore；选择同步 MooFlow 选中态（受控 nodes 必须处理 select）
 */
export function useFlowNodeChanges({
  nodes,
  getSnappedPosition,
  moveTaskSilently,
  forceResetAnchors,
  moveCollapsedDescendants,
  setAlignLines,
  setSelectedElement,
  setSelectedTaskIds,
}) {
  const dragSnapshotSaved = useRef(false);

  const onNodesChange = useCallback((changes) => {
    const selectChanges = changes.filter(change => change.type === 'select');
    if (selectChanges.length > 0) {
      const selectedById = new Map(nodes.map(node => [node.id, !!node.selected]));
      selectChanges.forEach((change) => {
        selectedById.set(change.id, change.selected);
      });
      const selectedIds = [...selectedById.entries()]
        .filter(([, isSelected]) => isSelected)
        .map(([nodeId]) => nodeIdToTaskId(nodeId));
      syncSelectionFromNodes(selectedIds, setSelectedElement, setSelectedTaskIds);
    }

    const positionChanges = changes.filter(
      change => change.type === 'position' && change.position,
    );
    if (positionChanges.length === 0) return;

    const isDragging = positionChanges.some(change => change.dragging);
    const isDragEnd = positionChanges.some(change => change.dragging === false);

    if (isDragging && !dragSnapshotSaved.current) {
      useTaskStore.getState()._saveSnapshot();
      dragSnapshotSaved.current = true;
    }

    const primary = positionChanges[0];
    const primaryId = nodeIdToTaskId(primary.id);
    let { x, y } = primary.position;
    const snapped = getSnappedPosition(
      primaryId,
      x,
      y,
      NODE_WIDTH,
      NODE_HEIGHT,
    );
    x = snapped.x;
    y = snapped.y;

    if (primary.dragging !== false) {
      setAlignLines(snapped.lines || []);
    }

    const allTasks = useTaskStore.getState().tasks;
    const prevPrimary = allTasks.find(task => task.id === primaryId)?.position;
    if (!prevPrimary) return;

    const dx = x - prevPrimary.x;
    const dy = y - prevPrimary.y;

    positionChanges.forEach((change) => {
      const taskId = nodeIdToTaskId(change.id);
      const base = allTasks.find(task => task.id === taskId)?.position;
      if (!base) return;

      const nx = taskId === primaryId ? x : base.x + dx;
      const ny = taskId === primaryId ? y : base.y + dy;

      moveTaskSilently(taskId, { x: nx, y: ny });
      forceResetAnchors(taskId);

      if (taskId === primaryId) {
        moveCollapsedDescendants(taskId, dx, dy, allTasks);
      }
    });

    if (isDragEnd) {
      dragSnapshotSaved.current = false;
      setAlignLines([]);
    }
  }, [
    nodes,
    getSnappedPosition,
    moveTaskSilently,
    forceResetAnchors,
    moveCollapsedDescendants,
    setAlignLines,
    setSelectedElement,
    setSelectedTaskIds,
  ]);

  return { onNodesChange };
}
