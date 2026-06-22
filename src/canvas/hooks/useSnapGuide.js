import { useCallback } from 'react';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import { snapPositionToGrid } from '../../utils/gridSnap';

/**
 * 磁吸对齐：拖动节点时计算吸附位置与辅助线
 */
export function useSnapGuide(tasks, { snapToGrid = false, gridSize = 20 } = {}) {
  const getSnappedPosition = useCallback((
    dragId,
    x,
    y,
    width = NODE_WIDTH,
    height = NODE_HEIGHT,
    threshold = 6
  ) => {
    let snapX = x;
    let snapY = y;

    if (snapToGrid) {
      const gridSnapped = snapPositionToGrid(x, y, gridSize);
      snapX = gridSnapped.x;
      snapY = gridSnapped.y;
    }
    let minDeltaX = threshold;
    let minDeltaY = threshold;
    let verticalLineX;
    let horizontalLineY;

    const dragCenterX = x + width / 2;
    const dragCenterY = y + height / 2;

    tasks.forEach(t => {
      if (t.id === dragId) return;
      const tCenterX = t.position.x + NODE_WIDTH / 2;
      const tCenterY = t.position.y + NODE_HEIGHT / 2;

      const deltaX = Math.abs(dragCenterX - tCenterX);
      if (deltaX < minDeltaX) {
        minDeltaX = deltaX;
        snapX = tCenterX - width / 2;
        verticalLineX = tCenterX;
      }

      const deltaY = Math.abs(dragCenterY - tCenterY);
      if (deltaY < minDeltaY) {
        minDeltaY = deltaY;
        snapY = tCenterY - height / 2;
        horizontalLineY = tCenterY;
      }
    });

    const lines = [];
    if (minDeltaX < threshold) {
      lines.push({ type: 'vertical', x: verticalLineX });
    }
    if (minDeltaY < threshold) {
      lines.push({ type: 'horizontal', y: horizontalLineY });
    }

    return { x: snapX, y: snapY, lines };
  }, [tasks, snapToGrid, gridSize]);

  return { getSnappedPosition };
}
