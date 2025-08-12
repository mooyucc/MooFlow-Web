import React, { useState, useEffect, useRef } from 'react';
import { useTaskStore, defaultTaskStyle } from '../store/taskStore';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import DatePickerPortal from './DatePickerPortal';
import CollapseButton from './CollapseButton';
import { DatePicker, ConfigProvider, Popover, Calendar } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'antd/dist/reset.css';
import { useTranslation } from '../LanguageContext';

// 极简SVG图标，全部单色 currentColor，与主工具栏一致
const AddIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 1 7 7l-1 1a5 5 0 0 1-7-7" />
    <path d="M14 11a5 5 0 0 0-7-7l-1 1a5 5 0 0 0 7 7" />
  </svg>
);
const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const NODE_WIDTH = 180, NODE_HEIGHT = 72;

// 定义四个锚点名称
export const ANCHORS = {
  UpAnchor:    { x: NODE_WIDTH / 2, y: 0 },
  DownAnchor:  { x: NODE_WIDTH / 2, y: NODE_HEIGHT },
  LeftAnchor:  { x: 0, y: NODE_HEIGHT / 2 },
  RightAnchor: { x: NODE_WIDTH, y: NODE_HEIGHT / 2 },
};

const CalendarIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const CARD_PADDING_X = 18;
const CARD_TEXT_WIDTH = NODE_WIDTH - CARD_PADDING_X * 2;

// 渲染多种流程图形状
function renderShape(shape, props) {
  switch (shape) {
    case 'roundRect':
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={18} {...props} />;
    case 'rect':
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={0} {...props} />;
    case 'circle':
      return <ellipse cx={NODE_WIDTH/2} cy={NODE_HEIGHT/2} rx={NODE_HEIGHT/2} ry={NODE_HEIGHT/2} {...props} />;
    case 'ellipse':
      return <ellipse cx={NODE_WIDTH/2} cy={NODE_HEIGHT/2} rx={NODE_WIDTH/2} ry={NODE_HEIGHT/2} {...props} />;
    case 'diamond':
      return <polygon points="90,0 180,36 90,72 0,36" {...props} />;
    case 'parallelogram':
      return <polygon points="36,0 180,0 144,72 0,72" {...props} />;
    case 'hexagon':
      return <polygon points="45,0 135,0 180,36 135,72 45,72 0,36" {...props} />;
    case 'pentagon':
      return <polygon points="90,-36 165.4,18.6 136.6,108 43.4,108 14.6,18.6" {...props} />;
    case 'trapezoid':
      return <polygon points="36,0 144,0 180,72 0,72" {...props} />;
    case 'document':
      return <path d="M8,8 H172 Q180,8 180,24 V56 Q180,72 164,72 H16 Q8,72 8,56 V24 Q8,8 24,8 Z" {...props} />;
    case 'cloud':
      return <path d="M50,60 Q30,60 30,40 Q10,40 20,25 Q20,10 40,15 Q50,0 70,10 Q90,0 100,15 Q120,10 120,25 Q130,40 110,40 Q110,60 90,60 Q80,70 70,60 Q60,70 50,60 Z" transform="scale(1.5 1.1) translate(10,5)" {...props} />;
    case 'flag':
      return <path d="M20,10 L160,10 L140,40 L160,70 L20,70 Z" {...props} />;
    case 'arrowRight':
      return <polygon points="20,31 140,31 140,21 180,36 140,51 140,41 20,41" {...props} />;
    case 'arrowLeft':
      return <polygon points="160,31 40,31 40,21 0,36 40,51 40,41 160,41" {...props} />;
    case 'doubleArrow':
      return <polygon points="0,36 40,16 40,30 140,30 140,16 180,36 140,56 140,42 40,42 40,56 0,36" {...props} />;
    case 'star':
      return <polygon points="90,10 105,60 180,60 120,90 140,150 90,110 40,150 60,90 0,60 75,60" {...props} />;
    case 'heart':
      return <path d="M90,72 Q0,24 45,0 Q90,24 135,0 Q180,24 90,72 Z" {...props} />;
    case 'quote':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>""</text></g>;
    case 'brace':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>{}</text></g>;
    case 'bracket':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>[ ]</text></g>;
    case 'parenthesis':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>( )</text></g>;
    default:
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={18} {...props} />;
  }
}

const TaskNode = ({ task, onClick, onStartLink, onDelete, selected, onDrag, multiSelected, isFirst, onEditingChange, transform, onAnchorMouseDown, onAnchorMouseEnter, onAnchorMouseLeave }) => {
  const updateTask = useTaskStore((state) => state.updateTask);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addLink = useTaskStore((state) => state.addLink);
  const moveTaskSilently = useTaskStore((state) => state.moveTaskSilently);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(task.date ? dayjs(task.date) : null);
  const [open, setOpen] = useState(false);
  const timeTextRef = useRef();
  const [anchorRect, setAnchorRect] = useState(null);
  const [dragStartPos, setDragStartPos] = useState(null);
  const allTasks = useTaskStore(state => state.tasks);
  const toggleCollapse = useTaskStore(state => state.toggleCollapse);
  const [t, lang] = useTranslation();
  const [hoveredAnchorKey, setHoveredAnchorKey] = useState(null);
  
  const rootTask = allTasks.length > 0 ? allTasks[0] : null;
  const isMainTask = rootTask && task.parentId === rootTask.id;
  const isSubTask = rootTask && task.id !== rootTask.id && task.parentId !== rootTask.id;

  const children = allTasks.filter(t => t.parentId === task.id);
  const hasChildren = children.length > 0;

  const fineGrainedTasks = (task.links || [])
    .map(link => {
      const target = allTasks.find(t => t.id === link.toId);
      // 确保是细分任务（同级且有连线）
      if (target && target.parentId === task.parentId) {
        return target;
      }
      return null;
    })
    .filter(Boolean);
  const hasFineGrainedTasks = fineGrainedTasks.length > 0;

  // 新增：判断当前任务自身是否为一个"细分任务"
  const isFineGrainedTask = allTasks.some(t => 
    t.id !== task.id &&
    t.parentId === task.parentId &&
    (t.links || []).some(link => link.toId === task.id)
  );

  const showCollapseButton = (hasChildren || (isSubTask && hasFineGrainedTasks)) && !isFineGrainedTask;
  const [hover, setHover] = useState(false);

  // 读取样式属性，提供默认值
  const {
    shape = defaultTaskStyle.shape,
    fillColor = isFirst ? "#222" : defaultTaskStyle.fillColor,
    borderColor = defaultTaskStyle.borderColor,
    borderWidth = defaultTaskStyle.borderWidth,
    borderStyle = defaultTaskStyle.borderStyle,
  } = task;

  // 强制中心任务使用黑色背景，防止被其他地方修改
  const finalFillColor = isFirst ? "#222" : fillColor;

  // 阴影颜色：重要/次要任务与边框同色，一般任务为默认色
  const shadowColor =
    task.importantLevel === 'important' ? '#e11d48' :
    task.importantLevel === 'secondary' ? '#ff9800' :
    '#222';
  const shadowOpacity = (task.importantLevel === 'important' || task.importantLevel === 'secondary') ? 0.28 : 0.18;

  useEffect(() => {
    setDate(task.date ? dayjs(task.date) : null);
  }, [task.date]);

  useEffect(() => {
    if (typeof onEditingChange === 'function') {
      onEditingChange(editing);
    }
  }, [editing, onEditingChange]);

  // 拖拽逻辑
  const handleMouseDown = (e) => {
    // 多选且当前节点被选中时，不处理拖动，交给MainCanvas
    if (multiSelected) return;
    // 拖动开始时保存快照
    useTaskStore.getState()._saveSnapshot();
    setDragging(true);
    // 修正：offset 计算要考虑 transform
    const screenX = task.position.x * transform.scale + transform.offsetX;
    const screenY = task.position.y * transform.scale + transform.offsetY;
    setOffset({
      x: e.clientX - screenX,
      y: e.clientY - screenY,
    });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.stopPropagation();

    // 统一的函数，用于获取一个折叠任务下所有被隐藏的后代
    const getHiddenDescendants = (parentId, tasks) => {
      let hidden = [];
      const queue = [parentId];
      const visited = new Set([parentId]);

      while (queue.length > 0) {
        const currentId = queue.shift();
        const currentTask = tasks.find(t => t.id === currentId);
        if (!currentTask) continue;

        // 1. 获取并处理层级子任务 (parentId)
        const children = tasks.filter(t => t.parentId === currentId);
        for (const child of children) {
          if (!visited.has(child.id)) {
            visited.add(child.id);
            hidden.push(child);
            queue.push(child.id); // 总是加入队列以遍历其所有后代
          }
        }

        // 2. 获取并处理细分任务 (同级并通过 link 连接)
        (currentTask.links || []).forEach(link => {
          const targetTask = tasks.find(t => t.id === link.toId);
          // 细分任务是具有相同父ID的同级任务
          if (targetTask && targetTask.parentId === currentTask.parentId) {
            if (!visited.has(targetTask.id)) {
              visited.add(targetTask.id);
              hidden.push(targetTask);
              queue.push(targetTask.id); // 总是加入队列以遍历其后续的细分任务链
            }
          }
        });
      }
      return hidden;
    };

    if (!transform) return;
    // 修正：拖动时先算出鼠标对应的屏幕坐标，再反推回画布坐标
    const newScreenX = e.clientX - offset.x;
    const newScreenY = e.clientY - offset.y;
    const rawX = (newScreenX - transform.offsetX) / transform.scale;
    const rawY = (newScreenY - transform.offsetY) / transform.scale;

    if (dragStartPos && (Math.abs(e.clientX - dragStartPos.x) > 2 || Math.abs(e.clientY - dragStartPos.y) > 2)) {
      if (typeof window.getSnappedPosition === 'function') {
        const { x, y, lines } = window.getSnappedPosition(task.id, rawX, rawY, NODE_WIDTH, NODE_HEIGHT);
        moveTaskSilently(task.id, { x, y }); // 使用无快照的移动
        if (onDrag) {
          onDrag(task.id, x, y, NODE_WIDTH, NODE_HEIGHT); // onDrag 现在只负责传递对齐线
        }
      } else {
        // Fallback if the function is not available
        moveTaskSilently(task.id, { x: rawX, y: rawY });
        if (onDrag) {
          onDrag(task.id, rawX, rawY, NODE_WIDTH, NODE_HEIGHT);
        }
      }
    }
    
    // 联动拖动折叠的子节点
    if (task.collapsed) {
      const descendants = getHiddenDescendants(task.id, useTaskStore.getState().tasks);
      const taskNow = useTaskStore.getState().tasks.find(t => t.id === task.id);
      if (taskNow) {
        const dx = taskNow.position.x - task.position.x;
        const dy = taskNow.position.y - task.position.y;
        descendants.forEach(desc => {
          const originalPos = allTasks.find(t => t.id === desc.id)?.position;
          if (originalPos) {
            moveTaskSilently(desc.id, { x: originalPos.x + dx, y: originalPos.y + dy });
          }
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    setDragStartPos(null);
    if (onDrag) {
      onDrag(null); // 拖动结束时清空对齐线
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // 编辑逻辑
  const handleDoubleClick = (e) => {
    setEditing(true);
    setTitle(getDisplayTitle()); // 进入编辑时同步显示文本
    e.stopPropagation();
  };

  // 新增：键盘事件处理 - 按空格键进入编辑状态，在编辑状态下阻止Enter键触发其他功能
  const handleKeyDown = (e) => {
    // 在编辑状态下，阻止Enter键触发其他功能（如新建任务）
    if (editing && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // 只有在选中状态且未在编辑状态时，按空格键才进入编辑
    if (selected && !editing && e.key === ' ' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      setEditing(true);
      setTitle(getDisplayTitle());
    }
  };

  // 监听全局键盘事件
  useEffect(() => {
    if (selected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selected, editing, task.id]);

  // 新增：在编辑状态下阻止全局Enter键事件，但允许输入框的Enter键事件
  useEffect(() => {
    if (editing) {
      const handleGlobalKeyDown = (e) => {
        if (e.key === 'Enter') {
          // 如果事件目标是输入框，不阻止事件
          if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            return;
          }
          // 否则阻止事件传播到MainCanvas
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      document.addEventListener('keydown', handleGlobalKeyDown, true); // 使用捕获阶段
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, true);
      };
    }
  }, [editing, task.id]);

  const handleInputBlur = () => {
    setEditing(false);
    // 如果输入内容和翻译文本一致，保存原始 key，否则保存用户输入
    let saveTitle = title;
    if (defaultTitleMap[task.title] && title === t(defaultTitleMap[task.title])) {
      saveTitle = task.title; // 保持原始 key
    }
    updateTask(task.id, { title: saveTitle });
  };

  // 添加任务
  const handleAddTask = (e) => {
    e.stopPropagation();
    const newTask = {
      id: Date.now(),
      title: t('new_task'),
      position: { x: task.position.x + 300, y: task.position.y }, // 右侧 300px
      links: [],
      parentId: task.id,
      level: (task.level || 0) + 1,
    };
    addTask(newTask);
    // 右中点 (fromAnchor) 和左中点 (toAnchor)
    const fromAnchor = ANCHORS.RightAnchor;
    const toAnchor = ANCHORS.LeftAnchor;
    addLink(task.id, newTask.id, fromAnchor, toAnchor);
  };

  // 删除任务
  const handleDeleteTask = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(task.id);
    else deleteTask(task.id);
  };

  // 连线
  const handleStartLink = (e) => {
    e.stopPropagation();
    if (onStartLink) onStartLink(task);
  };

  // 动态计算第一个子任务的实际方位，决定折叠/展开按钮和连线锚点
  // let collapseBtnAnchor = { x: ANCHORS.DownAnchor.x - 10, y: ANCHORS.DownAnchor.y + 4 }; // 默认下方
  // if (showCollapseButton) {
  //   let targetNodeForPositioning = null;
  //   if (isSubTask && hasFineGrainedTasks) {
  //     targetNodeForPositioning = fineGrainedTasks.sort((a,b) => a.position.x - b.position.x || a.position.y - b.position.y)[0];
  //   } 
  //   else if (hasChildren) {
  //     targetNodeForPositioning = children.sort((a,b) => a.position.y - b.position.y || a.position.x - b.position.x)[0];
  //   }
  //   if (targetNodeForPositioning) {
  //     const firstChild = targetNodeForPositioning;
  //     const dx = (firstChild.position.x + ANCHORS.RightAnchor.x / 2) - (task.position.x + ANCHORS.RightAnchor.x / 2);
  //     const dy = (firstChild.position.y + ANCHORS.DownAnchor.y / 2) - (task.position.y + ANCHORS.DownAnchor.y / 2);
  //     if (Math.abs(dx) > Math.abs(dy) * 1.5) {
  //       if (dx > 0) {
  //         collapseBtnAnchor = { x: ANCHORS.RightAnchor.x, y: ANCHORS.RightAnchor.y - 10 }; // 右
  //       } else {
  //         collapseBtnAnchor = { x: -20, y: ANCHORS.LeftAnchor.y - 10 }; // 左
  //       }
  //     } else {
  //       if (dy > 0) {
  //         collapseBtnAnchor = { x: ANCHORS.DownAnchor.x - 10, y: ANCHORS.DownAnchor.y + 4 }; // 下
  //       } else {
  //         collapseBtnAnchor = { x: ANCHORS.UpAnchor.x - 10, y: -20 }; // 上
  //       }
  //     }
  //   }
  // }
  // 改为固定右上角（贴边）
  const collapseBtnAnchor = { x: NODE_WIDTH - 6, y: -6 };

  // 主体形状渲染
  function getShapeStrokeDasharray(style) {
    if (style === 'dashed') return '8,4';
    if (style === 'none') return '0';
    return undefined;
  }

  // 默认任务名 key 映射
  const defaultTitleMap = {
    '中心任务': 'center_task',
    '主线任务': 'main_task',
    '子任务': 'child_task',
    '细分任务': 'fine_task',
    '新任务': 'new_task',
  };

  // 新增：获取当前显示的标题（用于编辑时初始值）
  const getDisplayTitle = () => {
    if (defaultTitleMap[task.title]) {
      return t(defaultTitleMap[task.title]);
    }
    return task.title;
  };

  const [title, setTitle] = useState(getDisplayTitle());

  // 新增：每次 task.title 或语言变化时，若未在编辑状态，title 跟随显示文本
  useEffect(() => {
    if (!editing) {
      setTitle(getDisplayTitle());
    }
    // eslint-disable-next-line
  }, [task.title, lang, editing]);

  return (
    <>
      <defs>
        <filter id={`cardShadow-${task.id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={shadowColor} floodOpacity={shadowOpacity}/>
        </filter>
      </defs>
      <g
        transform={`translate(${task.position.x}, ${task.position.y})`}
        onMouseDown={handleMouseDown}
        onClick={onClick}
        style={{ cursor: editing ? 'default' : 'move' }}
        data-task-id={task.id}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* 主体形状：支持多种流程图形状 */}
        {borderStyle !== 'none' && renderShape(shape, {
          fill: finalFillColor,
          stroke: borderColor,
          strokeWidth: borderWidth,
          style: {transition: 'all 0.2s cubic-bezier(.4,0,.2,1)'},
          strokeDasharray: getShapeStrokeDasharray(borderStyle),
          filter: !editing ? `url(#cardShadow-${task.id})` : undefined
        })}
        {borderStyle === 'none' && renderShape(shape, {
          fill: finalFillColor,
          stroke: 'none',
          strokeWidth: 0,
          filter: !editing ? `url(#cardShadow-${task.id})` : undefined
        })}
        {/* 鼠标悬停时显示锚点，并支持交互 */}
        {hover && (
          <g>
            {Object.entries(ANCHORS).map(([key, pos]) => (
              <circle
                key={key}
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
                  onAnchorMouseDown && onAnchorMouseDown(task, key, pos, e);
                }}
                onMouseEnter={e => {
                  setHoveredAnchorKey(key);
                  onAnchorMouseEnter && onAnchorMouseEnter(task, key, pos, e);
                }}
                onMouseLeave={e => {
                  setHoveredAnchorKey(null);
                  onAnchorMouseLeave && onAnchorMouseLeave(task, key, pos, e);
                }}
              />
            ))}
          </g>
        )}
        {/* 工具栏：仅选中时显示 */}
        {/* 右侧添加细分任务按钮 */}
        {/* 下方添加子任务按钮 */}
        {editing ? (
          <foreignObject x={0} y={0} width={NODE_WIDTH} height={NODE_HEIGHT}>
            <input
              style={{
                width: '100%',
                height: '100%',
                textAlign: task.textAlign || 'center',
                fontSize: task.fontSize || 16,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontWeight: task.fontWeight || 500,
                color: isFirst ? '#fff' : (task.color || '#222'),
                fontFamily: task.fontFamily || '思源黑体',
                borderRadius: 18,
                cursor: 'text',
                fontStyle: task.fontStyle || 'normal',
                textDecoration: task.textDecoration || 'none',
              }}
              value={title}
              autoFocus
              onChange={e => setTitle(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleInputBlur();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditing(false);
                  setTitle(getDisplayTitle()); // 恢复原始文本
                }
              }}
            />
          </foreignObject>
        ) : (
          <>
            {/* 居中标题 */}
            <text
              x={task.textAlign === 'left' ? CARD_PADDING_X : task.textAlign === 'right' ? NODE_WIDTH - CARD_PADDING_X : NODE_WIDTH / 2}
              y={(() => {
                // 自动换行算法（提前算一次，供y和内容共用）
                const ctx = document.createElement('canvas').getContext('2d');
                ctx.font = `${task.fontWeight || 600} ${task.fontSize || 14}px ${task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif'}`;
                const words = (task.title || '').split('');
                let lines = [], line = '';
                for (let i = 0; i < words.length; i++) {
                  const testLine = line + words[i];
                  const w = ctx.measureText(testLine).width;
                  if (w > CARD_TEXT_WIDTH && line) {
                    lines.push(line);
                    line = words[i];
                  } else {
                    line = testLine;
                  }
                }
                if (line) lines.push(line);
                // 居中：首行y=32，第二行y=32+18=50
                return lines.length > 1 ? 20 : 32;
              })()}
              fontSize={task.fontSize || 16}
              fontWeight={task.fontWeight || 600}
              fontStyle={task.fontStyle || 'normal'}
              fill={isFirst ? '#fff' : (task.color || '#222')}
              fontFamily={task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif'}
              style={{
                userSelect: 'none',
                cursor: 'pointer',
                textAnchor: task.textAlign === 'left' ? 'start' : task.textAlign === 'right' ? 'end' : 'middle',
                textDecoration: task.textDecoration || 'none',
              }}
              onDoubleClick={handleDoubleClick}
            >
              {(() => {
                const ctx = document.createElement('canvas').getContext('2d');
                ctx.font = `${task.fontWeight || 600} ${task.fontSize || 14}px ${task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif'}`;
                const words = (task.title || '').split('');
                let lines = [], line = '';
                for (let i = 0; i < words.length; i++) {
                  const testLine = line + words[i];
                  const w = ctx.measureText(testLine).width;
                  if (w > CARD_TEXT_WIDTH && line) {
                    lines.push(line);
                    line = words[i];
                  } else {
                    line = testLine;
                  }
                }
                if (line) lines.push(line);
                // 动态翻译：如果是默认 key，则用 t(key)
                return lines.map((l, idx) => (
                  <tspan key={idx} x={task.textAlign === 'left' ? CARD_PADDING_X : task.textAlign === 'right' ? NODE_WIDTH - CARD_PADDING_X : NODE_WIDTH / 2} dy={idx === 0 ? 0 : 18}>
                    {defaultTitleMap[l] ? t(defaultTitleMap[l]) : l}
                  </tspan>
                ));
              })()}
            </text>
            {/* 居中时间模块，保持胶囊自适应宽度 */}
            <foreignObject x={0} y={40} width={NODE_WIDTH} height={28}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ConfigProvider locale={lang === 'zh' ? zhCN : enUS}>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#555',
                      background: 'rgba(243, 243, 246, 0.8)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: task.autoDate ? 'not-allowed' : 'pointer',
                      userSelect: 'none',
                      marginTop: 0,
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      height: 24,
                    }}
                    onClick={() => {
                      if (!task.autoDate) setOpen(true);
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
                      <CalendarIcon size={12} />
                    </span>
                    {date ? date.format(lang === 'zh' ? 'YYYY年M月D日' : 'YYYY/M/D') : t('set_date')}
                  </div>
                  <DatePicker
                    value={date}
                    onChange={value => {
                      setDate(value);
                      updateTask(task.id, { date: value ? value.toDate() : null, autoDate: false });
                      // 新增：自动级联推算下游卡片
                      if (window.cascadeUpdateDates) {
                        window.cascadeUpdateDates(task.id);
                      }
                    }}
                    onOk={value => {
                      setDate(value);
                      updateTask(task.id, { date: value ? value.toDate() : null, autoDate: false });
                      setOpen(false);
                      // 新增：自动级联推算下游卡片
                      if (window.cascadeUpdateDates) {
                        window.cascadeUpdateDates(task.id);
                      }
                    }}
                    open={task.autoDate ? false : open}
                    onOpenChange={task.autoDate ? undefined : setOpen}
                    showToday
                    showTime={false}
                    showOk
                    format={lang === 'zh' ? 'YYYY年M月D日' : 'YYYY/M/D'}
                    inputReadOnly
                    getPopupContainer={() => document.body}
                    suffixIcon={null}
                    allowClear={true}
                    disabled={task.autoDate}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      width: 0,
                      height: 0,
                      pointerEvents: 'none',
                    }}
                    renderExtraFooter={() => (
                      <button
                        style={{
                          color: '#e11d48',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          margin: '0 auto',
                          display: 'block',
                          fontSize: 14,
                          padding: 4
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setDate(null);
                          updateTask(task.id, { date: null, autoDate: false });
                          setOpen(false);
                        }}
                      >
                        {t('clear_date')}
                      </button>
                    )}
                  />
                </ConfigProvider>
              </div>
            </foreignObject>
          </>
        )}
        {/* 悬停桥梁，覆盖卡片下方到按钮gap的区域，避免鼠标移到按钮时按钮消失，但不覆盖按钮本身 */}
        {showCollapseButton && (
          <rect
            x={NODE_WIDTH / 2 - 24}
            y={NODE_HEIGHT}
            width={48}
            height={8} // 只覆盖gap
            fill="transparent"
            pointerEvents="all"
          />
        )}
        {/* 折叠/展开按钮：有子任务且悬停时显示，或者有子任务且已折叠时始终显示，直接内联SVG */}
        {(showCollapseButton && (hover || task.collapsed)) && (
          <g
            transform={`translate(${collapseBtnAnchor.x}, ${collapseBtnAnchor.y})`}
            style={{ cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); toggleCollapse(task.id); }}
          >
            <circle cx="8" cy="8" r="8" fill="#fff" stroke="#e0e0e5" strokeWidth="1" />
            {/* 横线，始终显示 */}
            <line x1="4" y1="8" x2="12" y2="8" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
            {/* 竖线，仅在折叠时显示（即+号） */}
            {task.collapsed && (
              <line x1="8" y1="4" x2="8" y2="12" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>
        )}
        {/* 高亮边框：仅在未悬停锚点时显示 */}
        {(selected || multiSelected) && !hoveredAnchorKey && (() => {
          const isPolygon = !['rect', 'roundRect', 'ellipse', 'circle'].includes(shape);
          const commonProps = {
            fill: 'none',
            stroke: '#1251a580',
            strokeWidth: 2,
            pointerEvents: 'none',
          };
          let shapeProps = {};
          if (shape === 'rect' || shape === 'roundRect') {
            shapeProps = {
              x: -4,
              y: -4,
              width: NODE_WIDTH + 8,
              height: NODE_HEIGHT + 8,
              rx: shape === 'roundRect' ? 22 : 0,
              style: { transition: 'all 0.18s cubic-bezier(.4,0,.2,1)' },
            };
          } else if (shape === 'ellipse' || shape === 'circle') {
            shapeProps = {
              cx: NODE_WIDTH / 2,
              cy: NODE_HEIGHT / 2,
              rx: (shape === 'ellipse' ? NODE_WIDTH / 2 : NODE_HEIGHT / 2) + 4,
              ry: NODE_HEIGHT / 2 + 4,
              style: { transition: 'all 0.18s cubic-bezier(.4,0,.2,1)' },
            };
          } else {
            const scaleFactor = 1.08;
            const centerX = NODE_WIDTH / 2;
            const centerY = NODE_HEIGHT / 2;
            const transform = `translate(${centerX}, ${centerY}) scale(${scaleFactor}) translate(${-centerX}, ${-centerY})`;
            shapeProps = {
              transform,
              style: { transition: 'transform 0.18s cubic-bezier(.4,0,.2,1)' },
            };
          }
          return renderShape(shape, { ...commonProps, ...shapeProps });
        })()}
        {/* 键盘提示：选中且未编辑时显示空格键提示 */}
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

export default TaskNode;