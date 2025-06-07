import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import TaskNode from './TaskNode';
import CollapseButton from './CollapseButton';

const TaskTree = ({ parentId = null, level = 0, onSelect }) => {
  const tasks = useTaskStore(state =>
    state.tasks.filter(t => t.parentId === parentId)
  );
  const toggleCollapse = useTaskStore(state => state.toggleCollapse);
  const allTasks = useTaskStore.getState().tasks;
  const [hoverId, setHoverId] = useState(null);

  return (
    <ul style={{ listStyle: 'none', marginLeft: level * 24, paddingLeft: 0 }}>
      {tasks.map(task => {
        const hasChildren = allTasks.some(t => t.parentId === task.id);
        return (
          <li key={task.id}>
            <div
              style={{ display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setHoverId(task.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              {/* 只有悬停且有子任务时显示按钮 */}
              {hasChildren && hoverId === task.id && (
                <CollapseButton collapsed={task.collapsed} onClick={() => toggleCollapse(task.id)} />
              )}
              <TaskNode task={task} onClick={() => onSelect?.(task.id)} />
            </div>
            {/* 递归渲染子节点 */}
            {!task.collapsed && (
              <TaskTree parentId={task.id} level={level + 1} onSelect={onSelect} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default TaskTree; 