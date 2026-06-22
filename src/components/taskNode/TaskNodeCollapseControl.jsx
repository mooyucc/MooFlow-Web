import React from 'react';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';

const COLLAPSE_BTN_ANCHOR = { x: NODE_WIDTH - 6, y: -6 };

const TaskNodeCollapseControl = ({ hover, collapsed, onToggle }) => (
  <>
      <rect
        x={NODE_WIDTH / 2 - 24}
        y={NODE_HEIGHT}
        width={48}
        height={8}
        fill="transparent"
        pointerEvents="all"
      />
      {(hover || collapsed) && (
        <g
          transform={`translate(${COLLAPSE_BTN_ANCHOR.x}, ${COLLAPSE_BTN_ANCHOR.y})`}
          style={{ cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); onToggle(); }}
        >
          <circle cx="8" cy="8" r="8" fill="#fff" stroke="#e0e0e5" strokeWidth="1" />
          <line x1="4" y1="8" x2="12" y2="8" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
          {collapsed && (
            <line x1="8" y1="4" x2="8" y2="12" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
          )}
        </g>
      )}
    </>
);

export default TaskNodeCollapseControl;
