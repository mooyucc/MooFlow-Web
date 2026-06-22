import React from 'react';
import { ANCHORS } from '../../constants/nodeLayout';

const TaskNodeAnchors = ({
  hover,
  hoveredAnchorKey,
  setHoveredAnchorKey,
  task,
  onAnchorMouseDown,
  onAnchorMouseEnter,
  onAnchorMouseLeave,
}) => {
  if (!hover) return null;

  return (
    <g>
      {Object.entries(ANCHORS).map(([key, pos]) => (
        <circle
          key={key}
          className="nodrag nopan"
          cx={pos.x}
          cy={pos.y}
          r={5}
          fill={hoveredAnchorKey === key ? '#316acb' : '#fff'}
          stroke="#316acb"
          strokeWidth={2}
          style={{ cursor: 'crosshair', pointerEvents: 'all' }}
          onMouseDown={e => {
            e.stopPropagation();
            setHoveredAnchorKey(key);
            onAnchorMouseDown?.(task, key, pos, e);
          }}
          onMouseEnter={e => {
            setHoveredAnchorKey(key);
            onAnchorMouseEnter?.(task, key, pos, e);
          }}
          onMouseLeave={e => {
            setHoveredAnchorKey(null);
            onAnchorMouseLeave?.(task, key, pos, e);
          }}
        />
      ))}
    </g>
  );
};

export default TaskNodeAnchors;
