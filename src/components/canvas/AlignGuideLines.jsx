import React from 'react';

const AlignGuideLines = ({ alignLines }) => alignLines.map((line, idx) => {
  if (line.type === 'horizontal' && typeof line.y === 'number' && !Number.isNaN(line.y)) {
    return (
      <line
        key={`h-${idx}`}
        x1={-10000}
        x2={10000}
        y1={line.y}
        y2={line.y}
        stroke="#90a4c6"
        strokeWidth={1}
        strokeDasharray="6 6"
        pointerEvents="none"
      />
    );
  }

  if (line.type === 'vertical' && typeof line.x === 'number' && !Number.isNaN(line.x)) {
    return (
      <line
        key={`v-${idx}`}
        y1={-10000}
        y2={10000}
        x1={line.x}
        x2={line.x}
        stroke="#90a4c6"
        strokeWidth={1}
        strokeDasharray="6 6"
        pointerEvents="none"
      />
    );
  }

  return null;
});

export default AlignGuideLines;
