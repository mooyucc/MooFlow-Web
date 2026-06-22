import React, { useState, useEffect } from 'react';
import { useTaskStore, defaultTaskStyle } from '../../store/taskStore';
import dayjs from 'dayjs';
import { useTranslation } from '../../LanguageContext';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import { renderShape } from '../../utils/renderShape';
import { getShapeStrokeDasharray, getTaskShadowStyle } from '../../utils/taskNodeShape';
import { shouldShowCollapseButton } from '../../utils/taskNodeCollapse';
import { useTaskNodeEdit } from '../../canvas/hooks/useTaskNodeEdit';
import TaskNodeAnchors from './TaskNodeAnchors';
import TaskNodeTitle from './TaskNodeTitle';
import TaskNodeDateSection from './TaskNodeDateSection';
import TaskNodeCollapseControl from './TaskNodeCollapseControl';
import TaskNodeSelectionOutline from './TaskNodeSelectionOutline';
import TaskNodeCriticalOutline from './TaskNodeCriticalOutline';

/**
 * 任务节点视觉与交互内容（原点 0,0），供 SVG <g> 与 React Flow 节点复用。
 */
const TaskNodeBody = ({
  task,
  selected,
  multiSelected,
  isFirst,
  onEditingChange,
  onClick,
  onMouseDown,
  onAnchorMouseDown,
  onAnchorMouseEnter,
  onAnchorMouseLeave,
  showAnchors = true,
  cursor = 'move',
  isCritical = false,
  dimmed = false,
}) => {
  const updateTask = useTaskStore(state => state.updateTask);
  const allTasks = useTaskStore(state => state.tasks);
  const toggleCollapse = useTaskStore(state => state.toggleCollapse);
  const [t, lang] = useTranslation();
  const [date, setDate] = useState(task.date ? dayjs(task.date) : null);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [hoveredAnchorKey, setHoveredAnchorKey] = useState(null);

  const {
    shape = defaultTaskStyle.shape,
    fillColor = isFirst ? '#222' : defaultTaskStyle.fillColor,
    borderColor = defaultTaskStyle.borderColor,
    borderWidth = defaultTaskStyle.borderWidth,
    borderStyle = defaultTaskStyle.borderStyle,
  } = task;

  const finalFillColor = isFirst ? '#222' : fillColor;
  const { shadowColor, shadowOpacity } = getTaskShadowStyle(task);
  const showCollapseButton = shouldShowCollapseButton(task, allTasks);

  const { editing, title, setTitle, startEditing, commitEdit, cancelEdit } = useTaskNodeEdit({
    task,
    selected,
    t,
    updateTask,
    onEditingChange,
  });

  useEffect(() => {
    setDate(task.date ? dayjs(task.date) : null);
  }, [task.date]);

  return (
    <>
      <defs>
        <filter id={`cardShadow-${task.id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={shadowColor} floodOpacity={shadowOpacity} />
        </filter>
      </defs>
      <g
        onMouseDown={onMouseDown}
        onClick={onClick}
        style={{
          cursor: editing ? 'text' : cursor,
          opacity: dimmed ? 0.55 : 1,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {borderStyle !== 'none' && renderShape(shape, {
          fill: finalFillColor,
          stroke: borderColor,
          strokeWidth: borderWidth,
          style: { transition: 'all 0.2s cubic-bezier(.4,0,.2,1)' },
          strokeDasharray: getShapeStrokeDasharray(borderStyle),
          filter: !editing ? `url(#cardShadow-${task.id})` : undefined,
        })}
        {borderStyle === 'none' && renderShape(shape, {
          fill: finalFillColor,
          stroke: 'none',
          strokeWidth: 0,
          filter: !editing ? `url(#cardShadow-${task.id})` : undefined,
        })}

        {showAnchors && (
          <TaskNodeAnchors
            hover={hover}
            hoveredAnchorKey={hoveredAnchorKey}
            setHoveredAnchorKey={setHoveredAnchorKey}
            task={task}
            onAnchorMouseDown={onAnchorMouseDown}
            onAnchorMouseEnter={onAnchorMouseEnter}
            onAnchorMouseLeave={onAnchorMouseLeave}
          />
        )}

        <TaskNodeTitle
          task={task}
          isFirst={isFirst}
          editing={editing}
          title={title}
          setTitle={setTitle}
          t={t}
          onDoubleClick={startEditing}
          onBlur={commitEdit}
          onCancelEdit={cancelEdit}
        />

        {!editing && (
          <TaskNodeDateSection
            task={task}
            date={date}
            setDate={setDate}
            open={open}
            setOpen={setOpen}
            lang={lang}
            t={t}
            updateTask={updateTask}
          />
        )}

        {showCollapseButton && (
          <TaskNodeCollapseControl
            hover={hover}
            collapsed={task.collapsed}
            onToggle={() => toggleCollapse(task.id)}
          />
        )}

        <TaskNodeSelectionOutline
          shape={shape}
          selected={selected}
          multiSelected={multiSelected}
          hoveredAnchorKey={hoveredAnchorKey}
        />

        <TaskNodeCriticalOutline
          shape={shape}
          visible={isCritical}
          selected={selected || multiSelected}
        />

        {selected && !editing && !hoveredAnchorKey && (
          <text
            x={NODE_WIDTH / 2}
            y={NODE_HEIGHT + 20}
            fontSize={10}
            fill="#666"
            textAnchor="middle"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {t('press_space_to_edit')}
          </text>
        )}
      </g>
    </>
  );
};

export default TaskNodeBody;
