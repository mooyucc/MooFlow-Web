import React from 'react';
import { getStraightPath } from '@xyflow/react';

/** 锚点 / Handle 拖线预览 */
export default function MooFlowConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}) {
  const [path] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <defs>
        <marker
          id="mooflow-connection-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 6 3 L 0 6 z" fill="#316acb" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="#316acb"
        strokeWidth={2}
        strokeDasharray="4 4"
        markerEnd="url(#mooflow-connection-arrow)"
        style={connectionLineStyle}
      />
    </g>
  );
}
