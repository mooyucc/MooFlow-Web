import { useRef, useCallback } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import {
  getTouchCenter,
  getTouchDistance,
  isTouchInteractiveTarget,
} from '../../utils/touch';
import { viewportToTransform } from './flowAdapter';

/**
 * 触屏手势（React Flow 视口版）：平移、双指缩放、节点拖拽与 Tap 选择
 */
export function useFlowTouch({
  contextMenu,
  getViewport,
  setViewportFromTransform,
  tasks,
  setSelectedElement,
  setSelectedTaskIds,
  setAlignLines,
  getSnappedPosition,
  forceResetAnchors,
  findAvailablePosition,
  onTaskDragMove,
}) {
  const touchState = useRef({
    lastTouches: [],
    lastDistance: 0,
    mode: null,
    dragNodeId: null,
    dragNodeOffset: { x: 0, y: 0 },
    tapStartTime: 0,
    tapStartPos: { x: 0, y: 0 },
    tappedTaskId: null,
  });

  const getTransform = useCallback(
    () => viewportToTransform(getViewport()),
    [getViewport],
  );

  const setTransform = useCallback((updater) => {
    const prev = viewportToTransform(getViewport());
    const next = typeof updater === 'function' ? updater(prev) : updater;
    setViewportFromTransform(next);
  }, [getViewport, setViewportFromTransform]);

  const resetTouchState = useCallback(() => {
    touchState.current.mode = null;
    touchState.current.dragNodeId = null;
    touchState.current.tappedTaskId = null;
  }, []);

  const maybePreventDefault = useCallback((e) => {
    if (!isTouchInteractiveTarget(e.target)) {
      e.preventDefault();
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (contextMenu) return;
    maybePreventDefault(e);

    const transform = getTransform();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const pt = el?.closest?.('[data-task-id]');
      if (pt) {
        const id = Number(pt.dataset.taskId);
        const task = tasks.find(item => item.id === id);
        if (task) {
          touchState.current.mode = 'node-pending';
          touchState.current.dragNodeId = id;
          touchState.current.dragNodeOffset = {
            x: task.position.x - (touch.clientX - transform.offsetX) / transform.scale,
            y: task.position.y - (touch.clientY - transform.offsetY) / transform.scale,
          };
          touchState.current.tapStartTime = Date.now();
          touchState.current.tapStartPos = { x: touch.clientX, y: touch.clientY };
          touchState.current.tappedTaskId = id;
        }
      } else {
        touchState.current.mode = 'pan';
        touchState.current.tappedTaskId = null;
      }
      touchState.current.lastTouches = [{ clientX: touch.clientX, clientY: touch.clientY }];
    } else if (e.touches.length === 2) {
      touchState.current.mode = 'zoom';
      touchState.current.lastDistance = getTouchDistance(e.touches);
      touchState.current.lastTouches = [
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
        { clientX: e.touches[1].clientX, clientY: e.touches[1].clientY },
      ];
    }
  }, [contextMenu, maybePreventDefault, tasks, getTransform]);

  const handleTouchMove = useCallback((e) => {
    if (contextMenu) return;
    maybePreventDefault(e);

    const transform = getTransform();

    if (touchState.current.mode === 'pan' && e.touches.length === 1) {
      const touch = e.touches[0];
      const last = touchState.current.lastTouches[0];
      setTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX + touch.clientX - last.clientX,
        offsetY: prev.offsetY + touch.clientY - last.clientY,
      }));
      touchState.current.lastTouches = [{ clientX: touch.clientX, clientY: touch.clientY }];
      return;
    }

    if (touchState.current.mode === 'zoom' && e.touches.length === 2) {
      const newDistance = getTouchDistance(e.touches);
      const scaleDelta = newDistance / (touchState.current.lastDistance || 1);
      setTransform(prev => {
        const newScale = Math.max(0.1, Math.min(5, prev.scale * scaleDelta));
        const center = getTouchCenter(e.touches);
        const canvasX = (center.x - prev.offsetX) / prev.scale;
        const canvasY = (center.y - prev.offsetY) / prev.scale;
        return {
          scale: newScale,
          offsetX: center.x - canvasX * newScale,
          offsetY: center.y - canvasY * newScale,
        };
      });
      touchState.current.lastDistance = newDistance;
      touchState.current.lastTouches = [
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
        { clientX: e.touches[1].clientX, clientY: e.touches[1].clientY },
      ];
      return;
    }

    if ((touchState.current.mode === 'node-drag' || touchState.current.mode === 'node-pending') && e.touches.length === 1) {
      const touch = e.touches[0];
      const dxTap = Math.abs(touch.clientX - (touchState.current.tapStartPos?.x || 0));
      const dyTap = Math.abs(touch.clientY - (touchState.current.tapStartPos?.y || 0));
      if (dxTap > 6 || dyTap > 6) {
        touchState.current.tappedTaskId = null;
      }

      const id = touchState.current.dragNodeId;
      if (!id) return;

      if (touchState.current.mode === 'node-pending') {
        if (Math.hypot(dxTap, dyTap) <= 6) {
          touchState.current.lastTouches = [{ clientX: touch.clientX, clientY: touch.clientY }];
          return;
        }
        touchState.current.mode = 'node-drag';
        useTaskStore.getState()._saveSnapshot();
      }

      const rawX = (touch.clientX - transform.offsetX) / transform.scale + touchState.current.dragNodeOffset.x;
      const rawY = (touch.clientY - transform.offsetY) / transform.scale + touchState.current.dragNodeOffset.y;
      const { x: snappedX, y: snappedY, lines } = getSnappedPosition(id, rawX, rawY, NODE_WIDTH, NODE_HEIGHT);
      const finalPosition = findAvailablePosition({ x: snappedX, y: snappedY }, tasks, id);

      useTaskStore.getState().moveTaskSilently(id, finalPosition);
      forceResetAnchors(id);
      onTaskDragMove(id, finalPosition.x, finalPosition.y, NODE_WIDTH, NODE_HEIGHT);
      setAlignLines(lines || []);

      touchState.current.lastTouches = [{ clientX: touch.clientX, clientY: touch.clientY }];
    }
  }, [
    contextMenu,
    maybePreventDefault,
    getTransform,
    setTransform,
    tasks,
    getSnappedPosition,
    forceResetAnchors,
    findAvailablePosition,
    onTaskDragMove,
    setAlignLines,
  ]);

  const handleTouchEnd = useCallback((e) => {
    maybePreventDefault(e);

    if (touchState.current.mode === 'node-drag' || touchState.current.mode === 'node-pending') {
      setAlignLines([]);
    }
    if (touchState.current.tappedTaskId) {
      const duration = Date.now() - (touchState.current.tapStartTime || 0);
      if (duration < 350) {
        setSelectedElement({ type: 'task', id: touchState.current.tappedTaskId });
        setSelectedTaskIds([]);
      }
    }
    resetTouchState();
  }, [maybePreventDefault, setAlignLines, setSelectedElement, setSelectedTaskIds, resetTouchState]);

  const handleTouchCapture = useCallback((e) => {
    maybePreventDefault(e);
  }, [maybePreventDefault]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCapture,
    resetTouchState,
  };
}
