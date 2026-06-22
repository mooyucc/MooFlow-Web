import { useRef, useCallback } from 'react';
import { taskIdToNodeId } from './flowAdapter';

/** 将可见锚点的 mousedown 转发到 React Flow 隐形 Handle，触发原生 ConnectionLine */
export function triggerHandleConnect(taskId, anchorKey, event) {
  const nodeId = taskIdToNodeId(taskId);
  const handle = document.querySelector(
    `.react-flow__handle[data-nodeid="${nodeId}"][data-handleid="${anchorKey}"]`,
  );
  if (!handle) return;

  handle.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: event.clientX,
    clientY: event.clientY,
    button: event.button,
    buttons: event.buttons,
  }));
}

/**
 * React Flow 画布锚点拖线：预览与落点由 ConnectionLine + onConnect 处理
 */
export function useFlowAnchorLinking() {
  const hoveredAnchorRef = useRef(null);

  const handleAnchorMouseEnter = useCallback((task, anchorKey) => {
    hoveredAnchorRef.current = { taskId: task.id, anchorKey };
  }, []);

  const handleAnchorMouseLeave = useCallback(() => {
    hoveredAnchorRef.current = null;
  }, []);

  const handleAnchorMouseDown = useCallback((task, anchorKey, _pos, event) => {
    triggerHandleConnect(task.id, anchorKey, event);
  }, []);

  return {
    handleAnchorMouseDown,
    handleAnchorMouseEnter,
    handleAnchorMouseLeave,
  };
}
