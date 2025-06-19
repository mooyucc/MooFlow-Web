import React, { useState } from 'react';

const getEdgePoint = (rect, target) => {
  // rect: {x, y, width, height}，target: {x, y}
  // 只吸附到四条边中点
  const points = [
    { x: rect.x + rect.width / 2, y: rect.y }, // 上中
    { x: rect.x + rect.width / 2, y: rect.y + rect.height }, // 下中
    { x: rect.x, y: rect.y + rect.height / 2 }, // 左中
    { x: rect.x + rect.width, y: rect.y + rect.height / 2 }, // 右中
  ];
  let minDist = Infinity;
  let closest = points[0];
  for (const pt of points) {
    const dist = Math.hypot(target.x - pt.x, target.y - pt.y);
    if (dist < minDist) {
      minDist = dist;
      closest = pt;
    }
  }
  return closest;
};

const LinkLine = ({
  source,
  target,
  fromId,
  toId,
  fromAnchor,
  toAnchor,
  onDelete,
  onUpdateLink,
  tasks,
  svgRef,
  color = '#333',
  label = '',
  onUpdateLabel,
  isMainChain = false,
  // 新增属性
  lineStyle = 'solid',      // 线形：solid, dashed, dotted
  arrowStyle = 'normal',    // 箭头：normal, triangle, diamond, none
  lineWidth = 2,            // 线宽：默认2
}) => {
  // source/target: {position, ...}
  // 任务卡片尺寸
  const nodeRect = { width: 180, height: 72 };
  // 计算source/target中心
  const sourceRect = { x: source.position.x, y: source.position.y, ...nodeRect };
  const targetRect = { x: target.position.x, y: target.position.y, ...nodeRect };

  // 端点吸附到边缘，或用锚点
  const getPushedOutPoint = (edgePoint, center, pushLen = 8) => {
    // 计算从center到edgePoint的单位向量
    const dx = edgePoint.x - center.x;
    const dy = edgePoint.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: edgePoint.x + (dx / dist) * pushLen,
      y: edgePoint.y + (dy / dist) * pushLen,
    };
  };

  const sourceCenter = { x: source.position.x + nodeRect.width / 2, y: source.position.y + nodeRect.height / 2 };
  const targetCenter = { x: target.position.x + nodeRect.width / 2, y: target.position.y + nodeRect.height / 2 };

  const rawStart = fromAnchor
    ? { x: source.position.x + fromAnchor.x, y: source.position.y + fromAnchor.y }
    : getEdgePoint(sourceRect, target.position);
  const rawEnd = toAnchor
    ? { x: target.position.x + toAnchor.x, y: target.position.y + toAnchor.y }
    : getEdgePoint(targetRect, source.position);

  const start = getPushedOutPoint(rawStart, sourceCenter, 8);
  const end = getPushedOutPoint(rawEnd, targetCenter, 8);

  // 拖动状态
  const [draggingStart, setDraggingStart] = useState(false);
  const [draggingEnd, setDraggingEnd] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  // 扩大吸附判定范围
  const SNAP_PADDING = 10;

  const getSvgPoint = (e) => {
    if (!svgRef?.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  // 高亮吸附边线/角点状态
  const [highlight, setHighlight] = useState(null); // { cardId, type, edge/corner }

  // 拖动时检测吸附目标
  function getSnapHighlight(pos, excludeId) {
    if (!tasks) return null;
    for (const t of tasks) {
      if (t.id === excludeId) continue;
      const rect = { x: t.position.x - SNAP_PADDING, y: t.position.y - SNAP_PADDING, width: nodeRect.width + 2 * SNAP_PADDING, height: nodeRect.height + 2 * SNAP_PADDING };
      if (pos.x >= rect.x && pos.x <= rect.x + rect.width && pos.y >= rect.y && pos.y <= rect.y + rect.height) {
        // 只吸附中点
        const points = [
          { x: t.position.x + nodeRect.width / 2, y: t.position.y, type: 'mid', index: 0 },
          { x: t.position.x + nodeRect.width / 2, y: t.position.y + nodeRect.height, type: 'mid', index: 1 },
          { x: t.position.x, y: t.position.y + nodeRect.height / 2, type: 'mid', index: 2 },
          { x: t.position.x + nodeRect.width, y: t.position.y + nodeRect.height / 2, type: 'mid', index: 3 },
        ];
        for (let i = 0; i < points.length; i++) {
          const dist = Math.hypot(pos.x - points[i].x, pos.y - points[i].y);
          if (dist < 12) {
            return { cardId: t.id, type: points[i].type, index: points[i].index };
          }
        }
      }
    }
    return null;
  }

  // 拖动时动态高亮
  const handleStartMouseMove = (e) => {
    const pos = getSvgPoint(e);
    setDragPos(pos);
    setHighlight(getSnapHighlight(pos, toId));
  };
  const handleEndMouseMove = (e) => {
    const pos = getSvgPoint(e);
    setDragPos(pos);
    setHighlight(getSnapHighlight(pos, fromId));
  };
  // 拖动结束后清除高亮
  const handleStartMouseUp = (e) => {
    setDraggingStart(false);
    setHighlight(null);
    window.removeEventListener('mousemove', handleStartMouseMove);
    window.removeEventListener('mouseup', handleStartMouseUp);
    if (onUpdateLink && tasks && svgRef?.current) {
      const svgP = getSvgPoint(e);
      const found = tasks.find(t => {
        if (t.id === toId) return false;
        const rect = { x: t.position.x - SNAP_PADDING, y: t.position.y - SNAP_PADDING, width: nodeRect.width + 2 * SNAP_PADDING, height: nodeRect.height + 2 * SNAP_PADDING };
        return svgP.x >= rect.x && svgP.x <= rect.x + rect.width && svgP.y >= rect.y && svgP.y <= rect.y + rect.height;
      });
      if (found) {
        // 吸附到最近边缘点
        const foundRect = { x: found.position.x, y: found.position.y, ...nodeRect };
        const edge = getEdgePoint(foundRect, svgP);
        const anchor = { x: edge.x - found.position.x, y: edge.y - found.position.y };
        onUpdateLink(found.id, toId, anchor, toAnchor);
      }
    }
  };
  const handleEndMouseUp = (e) => {
    setDraggingEnd(false);
    setHighlight(null);
    window.removeEventListener('mousemove', handleEndMouseMove);
    window.removeEventListener('mouseup', handleEndMouseUp);
    if (onUpdateLink && tasks && svgRef?.current) {
      const svgP = getSvgPoint(e);
      const found = tasks.find(t => {
        if (t.id === fromId) return false;
        const rect = { x: t.position.x - SNAP_PADDING, y: t.position.y - SNAP_PADDING, width: nodeRect.width + 2 * SNAP_PADDING, height: nodeRect.height + 2 * SNAP_PADDING };
        return svgP.x >= rect.x && svgP.x <= rect.x + rect.width && svgP.y >= rect.y && svgP.y <= rect.y + rect.height;
      });
      if (found) {
        const foundRect = { x: found.position.x, y: found.position.y, ...nodeRect };
        const edge = getEdgePoint(foundRect, svgP);
        const anchor = { x: edge.x - found.position.x, y: edge.y - found.position.y };
        onUpdateLink(fromId, found.id, fromAnchor, anchor);
      }
    }
  };

  // 鼠标按下事件（补全）
  const handleStartMouseDown = (e) => {
    e.stopPropagation();
    setDraggingStart(true);
    const pos = getSvgPoint(e);
    setDragPos(pos);
    setHighlight(getSnapHighlight(pos, toId));
    window.addEventListener('mousemove', handleStartMouseMove);
    window.addEventListener('mouseup', handleStartMouseUp);
  };
  const handleEndMouseDown = (e) => {
    e.stopPropagation();
    setDraggingEnd(true);
    const pos = getSvgPoint(e);
    setDragPos(pos);
    setHighlight(getSnapHighlight(pos, fromId));
    window.addEventListener('mousemove', handleEndMouseMove);
    window.addEventListener('mouseup', handleEndMouseUp);
  };

  // 辅助：判断点在rect的哪条边
  function getSnapEdge(rect, pt) {
    const left = Math.abs(pt.x - rect.x);
    const right = Math.abs(pt.x - (rect.x + rect.width));
    const top = Math.abs(pt.y - rect.y);
    const bottom = Math.abs(pt.y - (rect.y + rect.height));
    const minDist = Math.min(left, right, top, bottom);
    if (minDist === left) return 'left';
    if (minDist === right) return 'right';
    if (minDist === top) return 'top';
    return 'bottom';
  }

  // 连线路径
  const x1 = draggingStart ? dragPos.x : start.x;
  const y1 = draggingStart ? dragPos.y : start.y;
  const x2 = draggingEnd ? dragPos.x : end.x;
  const y2 = draggingEnd ? dragPos.y : end.y;
  // 判断起点和终点吸附的边
  const startEdge = getSnapEdge(sourceRect, { x: x1, y: y1 });
  const endEdge = getSnapEdge(targetRect, { x: x2, y: y2 });
  // 控制点距离
  const dx = x2 - x1;
  const dy = y2 - y1;
  const mainDist = Math.sqrt(dx * dx + dy * dy);
  const ctrlLen = Math.max(20, Math.min(mainDist * 0.5, 80));
  // 起点控制点
  let c1x = x1, c1y = y1;
  if (startEdge === 'left') c1x -= ctrlLen;
  else if (startEdge === 'right') c1x += ctrlLen;
  else if (startEdge === 'top') c1y -= ctrlLen;
  else if (startEdge === 'bottom') c1y += ctrlLen;
  // 终点控制点
  let c2x = x2, c2y = y2;
  if (endEdge === 'left') c2x -= ctrlLen;
  else if (endEdge === 'right') c2x += ctrlLen;
  else if (endEdge === 'top') c2y -= ctrlLen;
  else if (endEdge === 'bottom') c2y += ctrlLen;
  // 路径
  let path = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

  // 曲线中点
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

  // 渲染高亮边线/角点
  let highlightElement = null;
  if (highlight) {
    const t = tasks.find(t => t.id === highlight.cardId);
    if (t) {
      const x = t.position.x, y = t.position.y, w = nodeRect.width, h = nodeRect.height;
      if (highlight.type === 'mid') {
        const midPos = [
          [x + w / 2, y],
          [x + w / 2, y + h],
          [x, y + h / 2],
          [x + w, y + h / 2],
        ][highlight.index];
        highlightElement = (
          <circle cx={midPos[0]} cy={midPos[1]} r={12} fill="none" stroke="#3b82f6" strokeWidth={3} />
        );
      }
    }
  }

  // 悬停状态
  const [hovered, setHovered] = useState(false);
  // 新增：输入框聚焦状态
  const [inputFocused, setInputFocused] = useState(false);
  // 新增：聚焦时hovered保持true
  const effectiveHovered = hovered || inputFocused;
  // 新增：选中状态
  const [selected, setSelected] = useState(false);

  // 点击连线切换选中
  const handleLineClick = (e) => {
    e.stopPropagation();
    setSelected(true);
  };
  // 点击空白处取消选中
  React.useEffect(() => {
    const handleDocClick = () => setSelected(false);
    if (selected) {
      document.addEventListener('mousedown', handleDocClick);
    } else {
      document.removeEventListener('mousedown', handleDocClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
    };
  }, [selected]);

  // 监听键盘删除事件
  React.useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e) => {
      // Mac: Backspace (key === 'Backspace')，Windows: Delete (key === 'Delete')
      if ((e.key === 'Backspace' || e.key === 'Delete') && onDelete) {
        onDelete(fromId, toId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected, onDelete, fromId, toId]);

  // 主线颜色
  const mainColor = color || '#333';
  // 高亮色
  const highlightColor = '#316acb';
  // 箭头颜色（动态）
  const arrowColor = mainColor;

  // 新增：本地输入状态
  const [inputValue, setInputValue] = useState(label);
  // label变化时同步inputValue
  React.useEffect(() => { setInputValue(label); }, [label]);

  // 修改连线样式
  const getStrokeDasharray = () => {
    switch (lineStyle) {
      case 'dashed': return '8 4';
      case 'dotted': return '3 3';
      default: return 'none';
    }
  };

  // 修改箭头样式
  const getArrowPath = () => {
    switch (arrowStyle) {
      case 'triangle': return 'M 0 0 L 5 2.5 L 0 5 z';
      case 'diamond': return 'M 0 2.5 L 2.5 0 L 5 2.5 L 2.5 5 z';
      case 'none': return '';
      default: return 'M 0 0 L 5 2.5 L 0 5 z';
    }
  };

  // 箭头markerId唯一化（增加lineStyle和arrowStyle）
  const markerId = `arrowhead-${fromId}-${toId}-${color.replace('#','')}-${lineStyle}-${arrowStyle}`;

  return (
    <g
      onClick={handleLineClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* marker定义 */}
      <defs>
        <marker
          id={markerId}
          markerWidth="5"
          markerHeight="5"
          refX="4.5"
          refY="2.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d={getArrowPath()} fill={arrowColor} />
        </marker>
      </defs>
      {highlightElement}
      {/* 判定区：粗透明线，提升悬停体验 */}
      <path
        d={path}
        stroke={color}
        strokeWidth={10}
        fill="none"
        opacity={0}
        style={{ cursor: 'pointer' }}
      />
      {/* 真实可见线 */}
      <path
        d={path}
        stroke={color}
        strokeWidth={effectiveHovered ? lineWidth * 1.5 : lineWidth}
        strokeDasharray={getStrokeDasharray()}
        fill="none"
        markerEnd={arrowStyle !== 'none' ? `url(#${markerId})` : ''}
        style={{ cursor: 'pointer', transition: 'stroke 0.2s, stroke-width 0.2s' }}
      />
      {/* 连线中点文本输入框 */}
      {!isMainChain && ((inputValue && inputValue !== '0') || effectiveHovered) && (
        <foreignObject
          x={mid.x - 20}
          y={mid.y - 13}
          width={40}
          height={20}
          style={{ overflow: 'visible', pointerEvents: 'auto' }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => {
              const val = e.target.value.trim();
              // 只允许非零正整数或空
              if (/^([1-9][0-9]*)$/.test(val) || val === '') {
                setInputValue(val);
              }
            }}
            onBlur={() => {
              setInputFocused(false);
              if (inputValue !== label) {
                onUpdateLabel && onUpdateLabel(fromId, toId, inputValue);
              }
            }}
            onFocus={() => setInputFocused(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.target.blur(); // 触发onBlur
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              fontSize: 12,
              textAlign: 'center',
              border: '1px solid #b3b3b3',
              borderRadius: 10,
              background: '#9ca3af',
              boxShadow: '0 1px 2px #0001',
              outline: 'none',
              padding: 0,
              color: '#fff'
            }}
            maxLength={8}
            spellCheck={false}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          />
        </foreignObject>
      )}
      {/* 起点handle */}
      {selected && (
        <circle
          cx={x1}
          cy={y1}
          r={8}
          fill={draggingStart ? '#007aff' : '#fff'}
          stroke="#007aff"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onMouseDown={handleStartMouseDown}
        />
      )}
      {/* 终点handle */}
      {selected && (
        <circle
          cx={x2}
          cy={y2}
          r={8}
          fill={draggingEnd ? '#34c759' : '#fff'}
          stroke="#34c759"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onMouseDown={handleEndMouseDown}
        />
      )}
    </g>
  );
};

export default LinkLine; 