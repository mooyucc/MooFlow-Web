import React, { useRef, useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import TaskNode from './TaskNode';
import CanvasToolbar from './CanvasToolbar';
import LinkLine from './LinkLine';
import CanvasFileToolbar from './CanvasFileToolbar';
import CanvasThemeToolbar from './CanvasThemeToolbar';
import { addDays } from 'date-fns';
import FormatSidebar from './FormatSidebar';
import { useTranslation } from '../LanguageContext';
// 引入锚点常量
import { ANCHORS } from './TaskNode';

const CANVAS_SIZE = 100000; // 无限画布逻辑尺寸

const MainCanvas = () => {
  const [t, lang] = useTranslation(); // 移到最前面，防止未初始化
  const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const tasks = useTaskStore((state) => state.tasks);
  const addLink = useTaskStore((state) => state.addLink);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const deleteLink = useTaskStore((state) => state.deleteLink);
  const forceResetAnchors = useTaskStore((state) => state.forceResetAnchors);
  const updateLinkLabel = useTaskStore((state) => state.updateLinkLabel);
  const updateLinkStyle = useTaskStore((state) => state.updateLinkStyle);

  // 连线模式
  const [linking, setLinking] = useState(false);
  const [fromTask, setFromTask] = useState(null);

  const hasInitRef = useRef(false);

  // 新增 svgRef
  const svgRef = useRef(null);

  // 替换原有的selectedTaskId、selectedTaskIds、selectedLink等选中状态
  const [selectedElement, setSelectedElement] = useState(null); // { type: 'task', id } | { type: 'link', fromId, toId } | null

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [selectBox, setSelectBox] = useState(null); // 框选区域
  const [multiDragging, setMultiDragging] = useState(false);
  const multiDragOffset = useRef({ x: 0, y: 0 });
  const multiDragStart = useRef({ x: 0, y: 0 });
  const primaryDragId = useRef(null); // 新增：用于多选拖动时的主卡片ID

  // 鼠标事件类型
  const dragMode = useRef(null); // 'canvas' | 'select' | 'multiMove'

  // 对齐辅助线状态
  const [alignLines, setAlignLines] = useState([]);

  // 新增：磁吸算法
  function getSnappedPosition(dragId, x, y, width = 180, height = 72, threshold = 6) {
    let snapX = x, snapY = y;
    let minDeltaX = threshold, minDeltaY = threshold;
    let verticalLineX, horizontalLineY;

    const dragCenterX = x + width / 2;
    const dragCenterY = y + height / 2;

    tasks.forEach(t => {
      if (t.id === dragId) return;
      const tWidth = 180, tHeight = 72; // Assuming fixed size
      const tCenterX = t.position.x + tWidth / 2;
      const tCenterY = t.position.y + tHeight / 2;

      // Check for vertical center alignment
      const deltaX = Math.abs(dragCenterX - tCenterX);
      if (deltaX < minDeltaX) {
        minDeltaX = deltaX;
        snapX = tCenterX - width / 2;
        verticalLineX = tCenterX;
      }

      // Check for horizontal center alignment
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
  }

  // 获取中心任务的日期作为时间轴起点
  const firstTask = tasks[0];
  const startDate = firstTask && firstTask.date ? new Date(firstTask.date) : new Date();

  // 新增：时间颗粒度
  const [timeScale, setTimeScale] = useState('month'); // 'month' | 'week' | 'day'

  // === 新增：根据语言环境获取本周起点 ===
  function getWeekStart(date, lang) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    let day = d.getDay();
    if (lang === 'zh') {
      // 周一为一周第一天
      day = (day + 6) % 7; // 0=周一
    }
    d.setDate(d.getDate() - day);
    return d;
  }

  // === 修改：生成时间刻度 ===
  let ticks = [];
  const scale = 300; // 固定刻度宽度
  if (firstTask) {
    if (timeScale === 'month') {
      for (let i = -12; i < 60; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        ticks.push({
          label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
          date: d,
          x: firstTask.position.x + i * scale
        });
      }
    } else if (timeScale === 'week') {
      // 根据语言环境动态获取本周起点
      const start = getWeekStart(startDate, lang);
      for (let i = -52; i < 260; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i * 7);
        const weekNum = getWeekNumber(d, lang);
        ticks.push({
          label: `${d.getFullYear()}年第${weekNum}周`,
          date: d,
          x: firstTask.position.x + i * scale
        });
      }
    } else if (timeScale === 'day') {
      for (let i = -365; i < 365 * 5; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        ticks.push({
          label: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
          date: d,
          x: firstTask.position.x + i * scale
        });
      }
    }
  }

  // === 修改：getWeekNumber支持多语言 ===
  function getWeekNumber(d, lang) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    if (lang === 'zh') {
      // ISO 8601: 周一为一周第一天，第一周包含1月4日
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
      const week1 = new Date(date.getFullYear(), 0, 4);
      week1.setDate(week1.getDate() + 3 - ((week1.getDay() + 6) % 7));
      return 1 + Math.round((date - week1) / (7 * 24 * 3600 * 1000));
    } else {
      // 美式：周日为一周第一天
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
  }

  // 新增：画布属性状态提升
  const [canvasProps, setCanvasProps] = useState({
    colorScheme: '彩虹',
    themeIndex: 1,
    backgroundColor: '#ebebeb',
    fontFamily: '默认',
    lineWidth: '默认',
    rainbowBranch: true,
    showGrid: true,
    gridSize: 20,
    mainDirection: 'horizontal', // 新增主线方向，默认水平
  });

  const [isEditing, setIsEditing] = useState(false);

  const touchState = useRef({
    lastTouches: [],
    lastDistance: 0,
    mode: null, // 'pan' | 'zoom' | 'node-drag'
    dragNodeId: null,
    dragNodeOffset: { x: 0, y: 0 },
  });

  // 计算两点间距离
  function getTouchDistance(touches) {
    if (touches.length < 2) return 0;
    const [a, b] = touches;
    return Math.sqrt(
      Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2)
    );
  }

  // 计算两点中心
  function getTouchCenter(touches) {
    if (touches.length < 2) return { x: 0, y: 0 };
    const [a, b] = touches;
    return {
      x: (a.clientX + b.clientX) / 2,
      y: (a.clientY + b.clientY) / 2,
    };
  }

  useEffect(() => {
    if (hasInitRef.current) return;
    if (tasks.length === 0) return;
    const task = tasks[0];
    const cardX = task.position.x;
    const cardY = task.position.y;
    setTransform({
      scale: 1,
      offsetX: window.innerWidth / 2 - cardX,
      offsetY: window.innerHeight / 2 - cardY,
    });
    hasInitRef.current = true;
  }, [tasks.length]);

  // 鼠标按下
  const handleMouseDown = (e) => {
    if (e.button === 2) { // 右键拖动画布
      dragMode.current = 'canvas';
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 0) { // 左键框选
      if (e.target === svgRef.current) {
        dragMode.current = 'select';
        // 转换为画布坐标
        const sx = (px) => (px - transform.offsetX) / transform.scale;
        const sy = (py) => (py - transform.offsetY) / transform.scale;
        setSelectBox({ x1: sx(e.clientX), y1: sy(e.clientY), x2: sx(e.clientX), y2: sy(e.clientY) });
        setSelectedElement(null); // 清空选中状态
      } else {
        // 判断是否点在多选卡片上，准备批量移动
        const pt = e.target.closest('[data-task-id]');
        if (pt && selectedTaskIds.includes(Number(pt.dataset.taskId))) {
          dragMode.current = 'multiMove';
          primaryDragId.current = Number(pt.dataset.taskId);
          setMultiDragging(true);
          multiDragStart.current = { x: e.clientX, y: e.clientY };
          setAlignLines([]); // 开始拖动前清空
          
          const allTasks = useTaskStore.getState().tasks;
          multiDragOffset.current = {};

          // 新增：可复用的函数，用于获取一个折叠任务下所有被隐藏的后代
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

          const tasksToTrack = new Set(selectedTaskIds);
          selectedTaskIds.forEach(id => {
            const task = allTasks.find(t => t.id === id);
            if (task && task.collapsed) {
              const descendants = getHiddenDescendants(id, allTasks);
              descendants.forEach(desc => tasksToTrack.add(desc.id));
            }
          });

          tasksToTrack.forEach(id => {
            const t = allTasks.find(t => t.id === id);
            if (t) multiDragOffset.current[id] = { x: t.position.x, y: t.position.y };
          });
        }
      }
    }
  };

  // 鼠标移动
  const handleMouseMove = (e) => {
    if (dragMode.current === 'canvas' && dragging.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setTransform((prev) => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    } else if (dragMode.current === 'select' && selectBox) {
      // 转换为画布坐标
      const sx = (px) => (px - transform.offsetX) / transform.scale;
      const sy = (py) => (py - transform.offsetY) / transform.scale;
      const newBox = selectBox ? { ...selectBox, x2: sx(e.clientX), y2: sy(e.clientY) } : null;
      // 只有在 box 变化时才 setState
      if (JSON.stringify(selectBox) !== JSON.stringify(newBox)) {
        setSelectBox(newBox);
      }
    } else if (dragMode.current === 'multiMove' && multiDragging) {
      const dx = (e.clientX - multiDragStart.current.x) / transform.scale;
      const dy = (e.clientY - multiDragStart.current.y) / transform.scale;

      let primaryTaskNewPos = null;

      // 1. Calculate the raw new position of the primary dragged task
      const primaryTaskBase = multiDragOffset.current[primaryDragId.current];
      if (!primaryTaskBase) return;

      const rawX = primaryTaskBase.x + dx;
      const rawY = primaryTaskBase.y + dy;

      // 2. Get snapped position and alignment lines for the primary task
      const { x: snappedX, y: snappedY, lines: snapLines } = getSnappedPosition(
        primaryDragId.current,
        rawX,
        rawY,
        180, // task width
        72   // task height
      );
      // 只有在对齐线变化时才 setAlignLines
      setAlignLines(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(snapLines || [])) {
          return snapLines || [];
        }
        return prev;
      });

      // 3. Calculate the snap-adjusted delta
      const finalDx = snappedX - primaryTaskBase.x;
      const finalDy = snappedY - primaryTaskBase.y;

      // 4. Apply the same snap-adjusted delta to all selected tasks
      Object.keys(multiDragOffset.current).forEach(idStr => {
        const id = Number(idStr);
        const base = multiDragOffset.current[id];
        if (base) {
          const newPos = { x: base.x + finalDx, y: base.y + finalDy };
          useTaskStore.getState().updateTask(id, { position: newPos });
          forceResetAnchors(id);
        }
      });
    }
  };

  // 鼠标松开
  const handleMouseUp = (e) => {
    if (dragMode.current === 'canvas') {
      dragging.current = false;
    } else if (dragMode.current === 'select' && selectBox) {
      // 框选结束，计算选中卡片
      const { x1, y1, x2, y2 } = selectBox;
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      const ids = tasks.filter(t => {
        const x = t.position.x, y = t.position.y;
        return x + 180 > minX && x < maxX && y + 72 > minY && y < maxY;
      }).map(t => t.id);
      setSelectedTaskIds(ids);
      setSelectBox(null);
    } else if (dragMode.current === 'multiMove') {
      setMultiDragging(false);
      setAlignLines([]); // 拖动结束时清空
    }
    dragMode.current = null;
  };

  // 禁用浏览器默认缩放
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 禁用 Ctrl/Cmd + 加号/减号/0 的浏览器默认缩放
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };

    const handleWheel = (e) => {
      // 禁用浏览器默认的 Ctrl/Cmd + 滚轮缩放
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 缩放/平移
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // 缩放操作
      const scaleDelta = e.deltaY < 0 ? 1.1 : 0.9;
      setTransform((prev) => {
        // 计算以鼠标位置为中心的缩放
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const newScale = Math.max(0.1, Math.min(5, prev.scale * scaleDelta));
        
        // 计算鼠标在画布上的位置
        const canvasX = (mouseX - prev.offsetX) / prev.scale;
        const canvasY = (mouseY - prev.offsetY) / prev.scale;
        
        // 计算新的偏移量，保持鼠标位置不变
        const newOffsetX = mouseX - canvasX * newScale;
        const newOffsetY = mouseY - canvasY * newScale;
        
        return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
      });
    } else {
      // 平移操作
      setTransform((prev) => ({
        ...prev,
        offsetX: prev.offsetX - e.deltaX,
        offsetY: prev.offsetY - e.deltaY,
      }));
    }
  };

  // 连线模式下，点击节点
  const handleNodeClick = (task) => {
    if (!linking) return;
    if (fromTask && fromTask.id !== task.id) {
      // 默认锚点：from右中，to左中
      const fromAnchor = ANCHORS.RightAnchor;
      const toAnchor = ANCHORS.LeftAnchor;
      addLink(fromTask.id, task.id, fromAnchor, toAnchor);
      setFromTask(null);
      setLinking(false);
    } else {
      setFromTask(task);
    }
  };

  // 连线起点
  const handleStartLink = (task) => {
    setLinking(true);
    setFromTask(task);
  };

  // 删除任务
  const handleDeleteTask = (id) => {
    deleteTask(id);
    setLinking(false);
    setFromTask(null);
  };

  // 删除连线
  const handleDeleteLink = (fromId, toId) => {
    deleteLink(fromId, toId);
  };

  // 更新连线
  const handleUpdateLink = (newFromId, newToId, fromAnchor, toAnchor) => {
    deleteLink(newFromId, newToId);
    if (typeof newFromId === 'number' && typeof newToId === 'number') {
      addLink(newFromId, newToId, fromAnchor, toAnchor);
    }
  };

  // 计算所有任务节点的包围盒
  const CARD_WIDTH = 180;
  const CARD_HEIGHT = 72;
  const CARD_PADDING_Y = 68; // 卡片垂直间距

  /**
   * 检查两个矩形是否重叠
   * @param {object} rect1 - { x, y, width, height }
   * @param {object} rect2 - { x, y, width, height }
   * @returns {boolean}
   */
  const isColliding = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  /**
   * 寻找一个不会与其他任务卡片碰撞的可用位置
   * @param {object} proposedPosition - 期望放置的位置 { x, y }
   * @param {Array} allTasks - 所有任务的数组
   * @param {number|null} ignoreTaskId - 检查时需要忽略的任务ID（通常是正在移动或新建的那个）
   * @returns {object} - 最终可用的位置 { x, y }
   */
  const findAvailablePosition = (proposedPosition, allTasks, ignoreTaskId = null) => {
    let finalPosition = { ...proposedPosition };
    let collisionDetected = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // 防止无限循环

    do {
      collisionDetected = false;
      const finalRect = { ...finalPosition, width: CARD_WIDTH, height: CARD_HEIGHT };

      for (const task of allTasks) {
        if (task.id === ignoreTaskId) continue;

        const taskRect = { ...task.position, width: CARD_WIDTH, height: CARD_HEIGHT };

        if (isColliding(finalRect, taskRect)) {
          collisionDetected = true;
          // 如果发生碰撞，将Y坐标向下移动一个卡片高度加一个间距
          finalPosition.y = task.position.y + CARD_HEIGHT + CARD_PADDING_Y;
          break; // 从内层循环中断，重新检查新位置
        }
      }
      attempts++;
    } while (collisionDetected && attempts < MAX_ATTEMPTS);
    
    // 如果循环结束仍有碰撞（不太可能发生，除非空间极其拥挤），也返回最后尝试的位置
    return finalPosition;
  };

  // 计算所有可见任务的包围盒
  const getTasksBoundingBox = (tasksToBound) => {
    if (!tasksToBound || tasksToBound.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    tasksToBound.forEach(task => {
      const { x, y } = task.position;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + CARD_WIDTH);
      maxY = Math.max(maxY, y + CARD_HEIGHT);
    });

    return { minX, minY, maxX, maxY };
  };

  // 设置画布缩放比例
  const handleSetScale = (newScale) => {
    dragging.current = false;
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  // 自适应显示所有任务节点
  const handleFitView = () => {
    const currentVisibleTasks = getVisibleTasks(tasks);

    if (currentVisibleTasks.length === 0) {
      setTransform({
        scale: 1,
        offsetX: window.innerWidth / 2,
        offsetY: window.innerHeight / 2,
      });
      return;
    }

    const { minX, minY, maxX, maxY } = getTasksBoundingBox(currentVisibleTasks);
    const padding = 100;
    const boxWidth = maxX - minX + padding * 2;
    const boxHeight = maxY - minY + padding * 2;

    if (boxWidth <= 0 || boxHeight <= 0) return;

    const scaleX = window.innerWidth / boxWidth;
    const scaleY = window.innerHeight / boxHeight;
    const fitScale = Math.min(scaleX, scaleY, 2); // 最大放大2倍
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setTransform({
      scale: fitScale,
      offsetX: window.innerWidth / 2 - centerX * fitScale,
      offsetY: window.innerHeight / 2 - centerY * fitScale,
    });
  };

  // 画布空白处点击，取消选中并选中画布
  const handleCanvasClick = (e) => {
    if (e.target === svgRef.current) {
      setSelectedElement(null);
    }
  };

  // 拖动任务节点时的对齐辅助线计算
  const handleTaskDrag = (dragId, x, y, width, height) => {
    if (!dragId) {
      setAlignLines([]);
      return;
    }
    forceResetAnchors(dragId);
    const { lines } = getSnappedPosition(dragId, x, y, width, height);
    setAlignLines(lines || []);
  };

  // Delete键批量删除
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTaskIds && selectedTaskIds.length > 0) {
          // 批量删除多选卡片
          selectedTaskIds.forEach(id => deleteTask(id));
          setSelectedTaskIds([]);
          setSelectedElement(null);
        } else if (selectedElement?.type === 'task') {
          deleteTask(selectedElement.id);
          setSelectedElement(null);
        } else if (selectedElement?.type === 'link') {
          deleteLink(selectedElement.fromId, selectedElement.toId);
          setSelectedElement(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, selectedTaskIds, deleteTask, deleteLink, isEditing]);

  // 禁用右键菜单，防止右键拖动时弹出
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (dragMode.current === 'canvas' || e.target === svgRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 获取所有可见节点（未被折叠的任务）
  function getVisibleTasks(tasks, parentId = null) {
    const rootTask = tasks.length > 0 ? tasks[0] : null;
    if (!rootTask) return [];

    const hiddenTaskIds = new Set();
    const collapsedTasks = tasks.filter(t => t.collapsed);

    // 递归收集所有后代（子任务和细分任务）
    function collectAllDescendants(taskId, allTasks, hiddenSet) {
      // 子任务分支
      allTasks
        .filter(t => t.parentId === taskId)
        .forEach(child => {
          if (!hiddenSet.has(child.id)) {
            hiddenSet.add(child.id);
            collectAllDescendants(child.id, allTasks, hiddenSet);
          }
        });
      // 细分任务链
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        (task.links || []).forEach(link => {
          const targetTask = allTasks.find(t => t.id === link.toId);
          if (targetTask && targetTask.parentId === task.parentId) {
            if (!hiddenSet.has(targetTask.id)) {
              hiddenSet.add(targetTask.id);
              collectAllDescendants(targetTask.id, allTasks, hiddenSet);
            }
          }
        });
      }
    }

    for (const collapsedTask of collapsedTasks) {
      collectAllDescendants(collapsedTask.id, tasks, hiddenTaskIds);
    }
    
    // 递归获取可见任务
    function getVisible(currentParentId) {
      let result = [];
      tasks
        .filter(t => t.parentId === currentParentId && !hiddenTaskIds.has(t.id))
        .forEach(task => {
          result.push(task);
          if (!task.collapsed) {
            result = result.concat(getVisible(task.id));
          }
        });
      return result;
    }

    return getVisible(parentId);
  }

  // 只渲染未被折叠的节点
  const visibleTasks = getVisibleTasks(tasks);
  const visibleTaskIds = new Set(visibleTasks.map(t => t.id));

  // 自动对齐有date的任务到时间标尺（提取为函数）
  const handleAlignToTimeline = () => {
    if (!tasks.length) return;
    const firstTask = tasks[0];
    const startDate = firstTask && firstTask.date ? new Date(firstTask.date) : new Date();
    const startX = firstTask ? firstTask.position.x : 0;

    // 创建一个可变的任务副本，用于在循环中追踪更新后的位置
    const updatableTasks = JSON.parse(JSON.stringify(useTaskStore.getState().tasks));

    tasks.forEach(task => {
      if (task.date) {
        const taskDate = new Date(task.date);
        let diff = 0;
        if (timeScale === 'month') {
          diff = (taskDate.getFullYear() - startDate.getFullYear()) * 12 + (taskDate.getMonth() - startDate.getMonth());
        } else if (timeScale === 'week') {
          // ISO 8601: 以最近的周一为起点
          const start = new Date(startDate);
          start.setHours(0,0,0,0);
          let startDayOfWeek = (start.getDay() + 6) % 7; // 0=周一
          start.setDate(start.getDate() - startDayOfWeek); // 回退到最近的周一

          const t = new Date(taskDate);
          t.setHours(0,0,0,0);
          let tDayOfWeek = (t.getDay() + 6) % 7;
          t.setDate(t.getDate() - tDayOfWeek); // 回退到最近的周一

          diff = Math.floor((t - start) / (7 * 24 * 3600 * 1000));
        } else if (timeScale === 'day') {
          // 计算两个日期之间的天数差
          const start = new Date(startDate);
          start.setHours(0,0,0,0);
          const t = new Date(taskDate);
          t.setHours(0,0,0,0);
          diff = Math.floor((t - start) / (24 * 3600 * 1000));
        }
        const targetX = startX + diff * scale;
        // 只调整x坐标，y保持不变
        useTaskStore.getState().updateTask(task.id, { position: { x: targetX, y: task.position.y } });
        // 同步更新我们的可变副本，以便下一次循环检查时使用最新位置
        const taskInCopy = updatableTasks.find(t => t.id === task.id);
        if (taskInCopy) {
          taskInCopy.position.x = targetX;
        }
      }
    });
  };

  // 辅助函数：判断任务类型
  function getTaskType(task, tasks) {
    if (!task.parentId) return 'main'; // 主任务
    const parent = tasks.find(t => t.id === task.parentId);
    if (parent && !parent.parentId) return 'child'; // 子任务
    if (parent && parent.parentId) return 'fine'; // 细分任务
    return 'unknown';
  }

  // 键盘快捷键：Tab/Enter统一调用handleAddTask
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedElement?.type === 'task') return;
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleAddTask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, tasks]);

  // 自动推算B卡片日期的增强版label更新函数
  const handleUpdateLinkLabel = (fromId, toId, label) => {
    useTaskStore.getState().updateLinkLabel(fromId, toId, label);
    const tasks = useTaskStore.getState().tasks;
    // 1. 清空时，清除B卡片日期和autoDate标记
    if (label === '') {
      useTaskStore.getState().updateTask(toId, { date: null, autoDate: false });
      // 级联清空所有下游自动推算的卡片
      cascadeUpdateDates(toId);
      return;
    }
    // 2. 自动推算B卡片日期（多入线时取最大天数）
    // 找到所有指向toId的连线
    const incomingLinks = tasks.flatMap(t => (t.links || []).map(l => ({
      fromId: t.id,
      toId: l.toId,
      label: l.label
    }))).filter(l => l.toId === toId && /^\d+$/.test(l.label));
    if (incomingLinks.length > 0) {
      // 取label最大值的那根连线
      const maxLink = incomingLinks.reduce((max, cur) => parseInt(cur.label, 10) > parseInt(max.label, 10) ? cur : max, incomingLinks[0]);
      const taskA = tasks.find(t => t.id === maxLink.fromId);
      if (taskA && taskA.date) {
        const startDate = new Date(taskA.date);
        const days = parseInt(maxLink.label, 10);
        if (!isNaN(days) && days > 0) {
          const newDate = addDays(startDate, days);
          useTaskStore.getState().updateTask(toId, { date: newDate, autoDate: true });
          // 级联推算所有下游卡片
          cascadeUpdateDates(toId);
        }
      }
    }
  };

  // 递归/循环级联推算下游所有自动日期卡片
  function cascadeUpdateDates(startId) {
    const tasks = useTaskStore.getState().tasks;
    // 找到所有以startId为fromId的连线
    const outLinks = tasks.find(t => t.id === startId)?.links || [];
    for (const link of outLinks) {
      if (!/^\d+$/.test(link.label)) continue;
      const toTask = tasks.find(t => t.id === link.toId);
      // 只自动推算autoDate为true或未定义的卡片
      if (!toTask || (toTask.autoDate === false)) continue;
      // 取所有指向toTask的连线，找最大label
      const incomingLinks = tasks.flatMap(t => (t.links || []).map(l => ({
        fromId: t.id,
        toId: l.toId,
        label: l.label
      }))).filter(l => l.toId === toTask.id && /^\d+$/.test(l.label));
      if (incomingLinks.length > 0) {
        const maxLink = incomingLinks.reduce((max, cur) => parseInt(cur.label, 10) > parseInt(max.label, 10) ? cur : max, incomingLinks[0]);
        const taskA = tasks.find(t => t.id === maxLink.fromId);
        if (taskA && taskA.date) {
          const startDate = new Date(taskA.date);
          const days = parseInt(maxLink.label, 10);
          if (!isNaN(days) && days > 0) {
            const newDate = addDays(startDate, days);
            useTaskStore.getState().updateTask(toTask.id, { date: newDate, autoDate: true });
            // 递归处理下游
            cascadeUpdateDates(toTask.id);
          }
        }
      } else {
        // 没有有效入线，清空日期
        useTaskStore.getState().updateTask(toTask.id, { date: null, autoDate: false });
        cascadeUpdateDates(toTask.id);
      }
    }
  }

  // 挂载到window，便于TaskNode调用
  window.cascadeUpdateDates = cascadeUpdateDates;
  window.getSnappedPosition = getSnappedPosition; // 挂载到window

  // 挂载到window，便于导出PNG
  useEffect(() => {
    window.MooFlowSvgRef = svgRef;
    return () => { if (window.MooFlowSvgRef === svgRef) window.MooFlowSvgRef = null; };
  }, []);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // 判断是否点在节点上
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const pt = el && el.closest && el.closest('[data-task-id]');
      if (pt) {
        // 节点拖动
        const id = Number(pt.dataset.taskId);
        const t = tasks.find(t => t.id === id);
        if (t) {
          touchState.current.mode = 'node-drag';
          touchState.current.dragNodeId = id;
          touchState.current.dragNodeOffset = {
            x: t.position.x - (touch.clientX - transform.offsetX) / transform.scale,
            y: t.position.y - (touch.clientY - transform.offsetY) / transform.scale,
          };
        }
      } else {
        // 画布平移
        touchState.current.mode = 'pan';
      }
      touchState.current.lastTouches = [
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
      ];
    } else if (e.touches.length === 2) {
      // 缩放
      touchState.current.mode = 'zoom';
      touchState.current.lastDistance = getTouchDistance(e.touches);
      touchState.current.lastTouches = [
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
        { clientX: e.touches[1].clientX, clientY: e.touches[1].clientY },
      ];
      touchState.current.lastCenter = getTouchCenter(e.touches);
    }
  };

  const handleTouchMove = (e) => {
    if (touchState.current.mode === 'pan' && e.touches.length === 1) {
      const touch = e.touches[0];
      const last = touchState.current.lastTouches[0];
      const dx = touch.clientX - last.clientX;
      const dy = touch.clientY - last.clientY;
      setTransform(prev => ({ ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy }));
      touchState.current.lastTouches = [
        { clientX: touch.clientX, clientY: touch.clientY },
      ];
    } else if (touchState.current.mode === 'zoom' && e.touches.length === 2) {
      const newDistance = getTouchDistance(e.touches);
      const scaleDelta = newDistance / (touchState.current.lastDistance || 1);
      setTransform(prev => {
        let newScale = Math.max(0.1, Math.min(5, prev.scale * scaleDelta));
        // 缩放中心点保持不变
        const center = getTouchCenter(e.touches);
        const canvasX = (center.x - prev.offsetX) / prev.scale;
        const canvasY = (center.y - prev.offsetY) / prev.scale;
        const newOffsetX = center.x - canvasX * newScale;
        const newOffsetY = center.y - canvasY * newScale;
        return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
      });
      touchState.current.lastDistance = newDistance;
      touchState.current.lastTouches = [
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
        { clientX: e.touches[1].clientX, clientY: e.touches[1].clientY },
      ];
    } else if (touchState.current.mode === 'node-drag' && e.touches.length === 1) {
      const touch = e.touches[0];
      const id = touchState.current.dragNodeId;
      if (id) {
        const rawX = (touch.clientX - transform.offsetX) / transform.scale + touchState.current.dragNodeOffset.x;
        const rawY = (touch.clientY - transform.offsetY) / transform.scale + touchState.current.dragNodeOffset.y;
        
        // 新增：应用磁吸算法
        const { x: snappedX, y: snappedY } = getSnappedPosition(id, rawX, rawY);
        const finalPosition = findAvailablePosition({ x: snappedX, y: snappedY }, tasks, id);

        useTaskStore.getState().updateTask(id, { position: finalPosition });
        forceResetAnchors(id);
        handleTaskDrag(id, finalPosition.x, finalPosition.y, 180, 72);
      }
      touchState.current.lastTouches = [
        { clientX: touch.clientX, clientY: touch.clientY },
      ];
    }
  };

  const handleTouchEnd = (e) => {
    // 结束拖动/缩放，重置状态
    if (touchState.current.mode === 'node-drag') {
      setAlignLines([]);
    }
    touchState.current.mode = null;
    touchState.current.dragNodeId = null;
  };

  // 处理分支样式变更（支持多选和单选连线）
  const handleBranchStyleChange = (key, value) => {
    if (selectedLink) {
      // 处理选中连线的样式变更
      updateLinkStyle(selectedLink.fromId, selectedLink.toId, { [key]: value });
    } else if (selectedTaskIds.length > 0) {
      // 处理多选任务的连线样式变更
      const allTasks = useTaskStore.getState().tasks;

      selectedTaskIds.forEach(taskId => {
        // 找到链接到当前选中任务的源头任务
        const sourceTask = allTasks.find(source => 
          (source.links || []).some(link => link.toId === taskId)
        );

        if (sourceTask) {
          // 更新从源头到当前任务的连线样式
          updateLinkStyle(sourceTask.id, taskId, { [key]: value });
        }
      });
    }
  };

  // 辅助函数：根据任务ID找到其父任务指向它的那条连线
  const getParentLink = (taskId) => {
    // ... existing code ...
  };

  const [showFormatSidebar, setShowFormatSidebar] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null); // 新增：选中连线状态

  // 新增：根据selectedElement更新选中状态
  useEffect(() => {
    if (selectedElement?.type === 'task') {
      const task = tasks.find(t => t.id === selectedElement.id);
      setSelectedTask(task || null);
      setSelectedTasks([]);
      setSelectedLink(null);
    } else if (selectedTaskIds.length > 0) {
      const selectedTaskObjects = tasks.filter(t => selectedTaskIds.includes(t.id));
      setSelectedTask(null);
      setSelectedTasks(selectedTaskObjects);
      setSelectedLink(null);
    } else if (selectedElement?.type === 'link') {
      setSelectedTask(null);
      setSelectedTasks([]);
      setSelectedLink(selectedElement);
    } else {
      setSelectedTask(null);
      setSelectedTasks([]);
      setSelectedLink(null);
    }
  }, [selectedElement, selectedTaskIds, tasks]);

  const handleTaskStyleChange = (key, value) => {
    const ids = selectedTaskIds.length > 0 ? selectedTaskIds : (selectedElement?.type === 'task' ? [selectedElement.id] : []);
    if (ids.length === 0) return;
    
    ids.forEach(id => {
      useTaskStore.getState().updateTask(id, { [key]: value }, false);
    });
    // For now, let's not save snapshot on every style change to avoid flooding undo stack.
    // Consider adding a specific "save history" button or debouncing this.
  };

  // 读取主线方向
  const mainDirection = canvasProps.mainDirection || 'horizontal';

  // 在MainCanvas组件内部添加autoArrangeTasks函数
  const autoArrangeTasks = () => {
    const allTasks = useTaskStore.getState().tasks;
    const updateTask = useTaskStore.getState().updateTask;
    const mainDirection = canvasProps.mainDirection || 'horizontal';

    const startX = 100, startY = 200;
    const mainGapH = 300, childGapH = 180, fineGapH = 180;
    const mainGapV = 180, childGapV = 300, fineGapV = 300;

    const mainTasks = allTasks.filter(t => !t.parentId);
    const centerTask = allTasks[0];

    if (mainDirection === 'vertical') {
      // 主线任务纵向排列在中心任务下方
      mainTasks.forEach((mainTask, i) => {
        const mainX = startX;
        const mainY = startY + i * mainGapV;
        updateTask(mainTask.id, { position: { x: mainX, y: mainY } });

        // 子任务横向排列在主线任务右侧
        const children = allTasks.filter(t => t.parentId === mainTask.id);
        children.forEach((child, j) => {
          const childX = mainX + (j + 1) * childGapV;
          const childY = mainY;
          updateTask(child.id, { position: { x: childX, y: childY } });

          // 细分任务横向排列在子任务右侧
          const fineTasks = allTasks.filter(t => t.parentId === child.id);
          fineTasks.forEach((fine, k) => {
            const fineX = childX + (k + 1) * fineGapV;
            const fineY = childY;
            updateTask(fine.id, { position: { x: fineX, y: fineY } });
          });
        });
      });
    } else {
      // 主线任务横向一排
      mainTasks.forEach((mainTask, i) => {
        const mainX = startX + i * mainGapH;
        const mainY = startY;
        updateTask(mainTask.id, { position: { x: mainX, y: mainY } });

        // 子任务纵向排列在主线任务正下方
        const children = allTasks.filter(t => t.parentId === mainTask.id);
        children.forEach((child, j) => {
          const childX = mainX;
          const childY = mainY + (j + 1) * childGapH;
          updateTask(child.id, { position: { x: childX, y: childY } });

          // 细分任务纵向排列在子任务正下方
          const fineTasks = allTasks.filter(t => t.parentId === child.id);
          fineTasks.forEach((fine, k) => {
            const fineX = childX;
            const fineY = childY + (k + 1) * fineGapH;
            updateTask(fine.id, { position: { x: fineX, y: fineY } });
          });
        });
      });
    }

    // --- 立即批量更新所有连线锚点 ---
    const tasksNow = useTaskStore.getState().tasks;
    const addLink = useTaskStore.getState().addLink;
    const CARD_WIDTH = 180, CARD_HEIGHT = 72;
    tasksNow.forEach(fromTask => {
      (fromTask.links || []).forEach(link => {
        const toTask = tasksNow.find(t => t.id === link.toId);
        if (!toTask) return;
        // 计算中心点
        const fromCenter = {
          x: fromTask.position.x + CARD_WIDTH / 2,
          y: fromTask.position.y + CARD_HEIGHT / 2
        };
        const toCenter = {
          x: toTask.position.x + CARD_WIDTH / 2,
          y: toTask.position.y + CARD_HEIGHT / 2
        };
        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;
        let fromAnchor, toAnchor;
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平为主，左右中点
          fromAnchor = ANCHORS.RightAnchor;
          toAnchor = ANCHORS.LeftAnchor;
        } else {
          // 垂直为主，上下中点
          fromAnchor = dy > 0 ? ANCHORS.DownAnchor : ANCHORS.UpAnchor;
          toAnchor = dy > 0 ? ANCHORS.UpAnchor : ANCHORS.DownAnchor;
        }
        // 用addLink覆盖锚点
        addLink(fromTask.id, link.toId, fromAnchor, toAnchor, link.label);
      });
    });
    // 画布缩放比例恢复100%，中心任务放到左1/4、垂直居中
    const centerTaskNow = tasksNow[0];
    if (centerTaskNow) {
      setTransform({
        scale: 1,
        offsetX: window.innerWidth / 4 - centerTaskNow.position.x,
        offsetY: window.innerHeight / 2 - centerTaskNow.position.y - CARD_HEIGHT / 2
      });
    }
  };

  // 监听布局方向变化，自动排列卡片
  useEffect(() => {
    autoArrangeTasks();
    // eslint-disable-next-line
  }, [canvasProps.mainDirection]);

  // 统一新建任务逻辑，参考原有的连线锚点和卡片避让逻辑
  const handleAddTask = () => {
    if (!selectedElement?.type === 'task') return;
    const task = tasks.find(t => t.id === selectedElement.id);
    if (!task) return;
    let newTask = null;
    let newType = '';
    let newTitle = '';
    let newParentId = null;
    let newLevel = 0;
    let newPosition = { x: task.position.x + 300, y: task.position.y };
    let fromAnchor = { x: 180, y: 36 }, toAnchor = { x: 0, y: 36 };
    if (task.type === 'center') {
      // 新建主线任务，横/纵向排列
      const siblings = tasks.filter(t => t.parentId === null);
      if ((canvasProps.mainDirection || 'horizontal') === 'horizontal') {
        let maxX = task.position.x;
        if (siblings.length > 0) {
          maxX = Math.max(...siblings.map(c => c.position.x), maxX);
        }
        newPosition = { x: maxX + 300, y: task.position.y };
      } else {
        let maxY = task.position.y;
        if (siblings.length > 0) {
          maxY = Math.max(...siblings.map(c => c.position.y), maxY);
        }
        newPosition = { x: task.position.x, y: maxY + 180 };
      }
      newType = 'main';
      newTitle = '主线任务';
      newParentId = null; // 关键修正，主线任务parentId为null
      newLevel = 1;
      fromAnchor = { x: 180, y: 36 };
      toAnchor = { x: 0, y: 36 };
    } else if (task.type === 'main') {
      // 新建子任务，主线方向决定排列方式
      const children = tasks.filter(t => t.parentId === task.id);
      if ((canvasProps.mainDirection || 'horizontal') === 'horizontal') {
        // 横向主线，子任务纵向排列
        let newY = task.position.y + 180;
        if (children.length > 0) {
          newY = Math.max(...children.map(c => c.position.y)) + 180;
        }
        newPosition = { x: task.position.x, y: newY };
        fromAnchor = { x: 90, y: 72 }; // 下中
        toAnchor = { x: 90, y: 0 };    // 上中
      } else {
        // 纵向主线，子任务横向排列
        let maxX = task.position.x;
        if (children.length > 0) {
          maxX = Math.max(...children.map(c => c.position.x), maxX);
        }
        newPosition = { x: maxX + 300, y: task.position.y };
        fromAnchor = { x: 180, y: 36 }; // 右中
        toAnchor = { x: 0, y: 36 };     // 左中
      }
      newType = 'sub';
      newTitle = '子任务';
      newParentId = task.id;
      newLevel = 2;
    } else if (task.type === 'sub' || task.type === 'detail') {
      // 新建细分任务，横向排列
      const siblings = tasks.filter(t => t.parentId === task.id);
      let maxX = task.position.x;
      if (siblings.length > 0) {
        maxX = Math.max(...siblings.map(c => c.position.x), maxX);
      }
      newPosition = { x: maxX + 300, y: task.position.y };
      newType = 'detail';
      newTitle = '细分任务';
      newParentId = task.id;
      newLevel = (task.level || 2) + 1;
      fromAnchor = { x: 180, y: 36 };
      toAnchor = { x: 0, y: 36 };
    }
    // 避让重叠
    const finalPosition = findAvailablePosition(newPosition, tasks);
    newTask = {
      id: Date.now(),
      title: newTitle,
      position: finalPosition,
      links: [],
      parentId: newParentId,
      level: newLevel,
      type: newType,
      // 不再自动继承日期
    };
    // 计算连线颜色
    let linkColor = '#86868b';
    if (task.type === 'center' && newType === 'main') {
      linkColor = '#e11d48'; // 主链
    } else if (task.type === 'main' && newType === 'main') {
      linkColor = '#e11d48'; // 主链
    } else if (task.type === 'main' && newType === 'sub') {
      linkColor = '#ff9800'; // 子任务
    } else if ((task.type === 'sub' && newType === 'detail') || (task.type === 'detail' && newType === 'detail')) {
      linkColor = '#86868b'; // 细分任务
    }
    useTaskStore.getState().addTask(newTask);
    // 只对子任务和细分任务addLink，主线任务之间不addLink
    if (task.type === 'main' && newType === 'sub') {
      useTaskStore.getState().addLink(task.id, newTask.id, fromAnchor, toAnchor, '', { color: '#ff9800' });
    } else if ((task.type === 'sub' && newType === 'detail') || (task.type === 'detail' && newType === 'detail')) {
      useTaskStore.getState().addLink(task.id, newTask.id, fromAnchor, toAnchor, '', { color: '#86868b' });
    }
  };

  // 新增锚点连线模式状态
  const [linkingAnchor, setLinkingAnchor] = useState(null); // { fromTaskId, fromAnchorKey, fromPos, mousePos }
  const [hoveredAnchor, setHoveredAnchor] = useState(null); // { taskId, anchorKey, pos }

  // 处理锚点按下，进入锚点连线模式
  const handleAnchorMouseDown = (task, anchorKey, pos, e) => {
    setLinkingAnchor({
      fromTaskId: task.id,
      fromAnchorKey: anchorKey,
      fromPos: { x: task.position.x + pos.x, y: task.position.y + pos.y },
      mousePos: { x: task.position.x + pos.x, y: task.position.y + pos.y },
    });
    // 监听全局鼠标移动和松开
    const handleMove = evt => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      setLinkingAnchor(anchor => anchor ? { ...anchor, mousePos: { x: svgP.x, y: svgP.y } } : null);
    };
    const handleUp = evt => {
      // 判断是否在另一个锚点上
      if (hoveredAnchor && hoveredAnchor.taskId !== linkingAnchor?.fromTaskId) {
        // 建立连线
        const toTask = tasks.find(t => t.id === hoveredAnchor.taskId);
        if (toTask) {
          const fromAnchor = ANCHORS[linkingAnchor.fromAnchorKey];
          const toAnchor = ANCHORS[hoveredAnchor.anchorKey];
          addLink(linkingAnchor.fromTaskId, toTask.id, fromAnchor, toAnchor);
        }
      }
      setLinkingAnchor(null);
      setHoveredAnchor(null);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };
  // 处理锚点悬停
  const handleAnchorMouseEnter = (task, anchorKey, pos, e) => {
    setHoveredAnchor({ taskId: task.id, anchorKey, pos });
  };
  const handleAnchorMouseLeave = (task, anchorKey, pos, e) => {
    setHoveredAnchor(null);
  };

  // 新增：ESC中断锚点连线
  useEffect(() => {
    if (!linkingAnchor) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setLinkingAnchor(null);
        setHoveredAnchor(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [linkingAnchor]);

  return (
    <div
      className="canvas-container bg-white dark:bg-[#242424]"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        // 新增：画布背景色
        background: canvasProps.backgroundColor || '#fff',
        fontFamily: canvasProps.fontFamily === '默认' ? undefined : canvasProps.fontFamily,
        touchAction: 'none', // 禁用默认手势，支持触屏
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 时间颗粒度切换工具栏（右下角） */}
      <div style={{
        position: 'fixed',
        right: 32,
        bottom: 20, // 原为32，改为20
        zIndex: 100,
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '6px 12px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        border: '1px solid #e0e0e0',
      }}>
        <span style={{ fontSize: 12, color: '#666', marginRight: 8 }}>{t('timeline.granularity')}</span>
        <button
          onClick={() => setTimeScale('month')}
          style={{
            padding: '2px 10px',
            borderRadius: 15,
            border: 'none',
            background: timeScale === 'month' ? '#316acb' : '#f0f0f0',
            color: timeScale === 'month' ? '#fff' : '#333',
            fontWeight: timeScale === 'month' ? 700 : 400,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >{t('timeline.month_short')}</button>
        <button
          onClick={() => setTimeScale('week')}
          style={{
            padding: '2px 10px',
            borderRadius: 15,
            border: 'none',
            background: timeScale === 'week' ? '#316acb' : '#f0f0f0',
            color: timeScale === 'week' ? '#fff' : '#333',
            fontWeight: timeScale === 'week' ? 700 : 400,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >{t('timeline.week_short')}</button>
        <button
          onClick={() => setTimeScale('day')}
          style={{
            padding: '2px 10px',
            borderRadius: 15,
            border: 'none',
            background: timeScale === 'day' ? '#316acb' : '#f0f0f0',
            color: timeScale === 'day' ? '#fff' : '#333',
            fontWeight: timeScale === 'day' ? 700 : 400,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >{t('timeline.day_short')}</button>
      </div>
      <CanvasToolbar 
        onStartLink={() => setLinking(true)} 
        onSetScale={handleSetScale}
        onFitView={handleFitView}
        onAlignToTimeline={handleAlignToTimeline}
        scale={transform.scale}
        onAddTask={handleAddTask}
        hasSelectedTask={selectedElement?.type === 'task'}
      />
      <CanvasFileToolbar 
        canvasProps={canvasProps}
        setCanvasProps={setCanvasProps}
        selectedTaskId={selectedElement?.type === 'task' ? selectedElement.id : null}
        setSelectedTaskId={setSelectedElement}
        selectedTaskIds={selectedTaskIds}
        selectedLink={selectedLink}
        onBranchStyleChange={handleBranchStyleChange}
        autoArrangeTasks={autoArrangeTasks} // 传递给FileToolbar
      />
      <CanvasThemeToolbar canvasProps={canvasProps} setCanvasProps={setCanvasProps} />
      <FormatSidebar
        visible={showFormatSidebar}
        onClose={() => setShowFormatSidebar(false)}
        canvasProps={canvasProps}
        onCanvasChange={setCanvasProps}
        selectedTask={selectedTask}
        selectedTasks={selectedTasks}
        selectedTaskIds={selectedTaskIds}
        selectedLink={selectedLink}
        onTaskStyleChange={handleTaskStyleChange}
        onBranchStyleChange={handleBranchStyleChange}
      />
      <svg
        ref={svgRef}
        className="canvas-content"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          // 网格开关与大小
          backgroundImage: canvasProps.showGrid ? `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)` : 'none',
          backgroundSize: canvasProps.showGrid ? `${canvasProps.gridSize || 40}px ${canvasProps.gridSize || 40}px` : 'none',
        }}
        viewBox={`${-transform.offsetX / transform.scale} ${-transform.offsetY / transform.scale} ${window.innerWidth / transform.scale} ${window.innerHeight / transform.scale}`}
        onClick={handleCanvasClick}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
          </marker>
          {/* 虚拟连线专用小箭头 */}
          <marker
            id="virtual-arrowhead"
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
        {/* 所有链式连线（主线和细分任务） */}
        {(() => {
          // 获取所有唯一的parentId，包括null
          const allParentIds = [...new Set(tasks.map(t => t.parentId))];
          const lines = [];

          allParentIds.forEach(pid => {
            // 只对主线任务（parentId为null的是主线）应用自动链式连线
            if (pid !== null) return;

            // 找出所有属于当前父节点的同级任务
            const siblings = tasks.filter(t => t.parentId === pid);
            if (siblings.length < 2) return; // 至少需要两个任务才能形成连线

            // 按主线方向排序
            if (mainDirection === 'horizontal') {
              siblings.sort((a, b) => a.position.x - b.position.x);
            } else {
              siblings.sort((a, b) => a.position.y - b.position.y);
            }

            // 在排序后的同级任务之间创建连线
            for (let i = 0; i < siblings.length - 1; i++) {
              const from = siblings[i];
              const to = siblings[i + 1];
              if (!visibleTaskIds.has(from.id) || !visibleTaskIds.has(to.id)) continue;

              // 判断是否为主线（parentId为null的是主线）
              const isMainChain = pid === null;

              // 从store中找到对应的link，以获取其样式和label
              const linkData = (from.links || []).find(l => l.toId === to.id);

              // 根据主线方向设置锚点
              const fromAnchor = mainDirection === 'horizontal'
                ? ANCHORS.RightAnchor // 右中
                : ANCHORS.DownAnchor; // 下中
              const toAnchor = mainDirection === 'horizontal'
                ? ANCHORS.LeftAnchor   // 左中
                : ANCHORS.UpAnchor;  // 上中

              lines.push(
                <LinkLine
                  key={`chain-${from.id}-${to.id}`}
                  source={from}
                  target={to}
                  fromId={from.id}
                  toId={to.id}
                  fromAnchor={fromAnchor}
                  toAnchor={toAnchor}
                  tasks={tasks}
                  svgRef={svgRef}
                  color={isMainChain ? "#e11d48" : (linkData?.color || "#86868b")}
                  isMainChain={isMainChain}
                  label={linkData?.label || ''}
                  lineStyle={linkData?.lineStyle || 'solid'}
                  arrowStyle={linkData?.arrowStyle || 'normal'}
                  lineWidth={linkData?.lineWidth || 2}
                  onUpdateLabel={(fromId, toId, label) => {
                    if (!isMainChain) {
                      // 确保连线存在，以便更新或创建label
                      useTaskStore.getState().addLink(fromId, toId, fromAnchor, toAnchor, label);
                      handleUpdateLinkLabel(fromId, toId, label);
                    }
                  }}
                  selected={selectedElement?.type === 'link' && selectedElement.fromId === from.id && selectedElement.toId === to.id}
                  onClick={() => setSelectedElement({ type: 'link', fromId: from.id, toId: to.id })}
                />
              );
            }
          });
          
          return lines;
        })()}
        {/* 其它所有连线（子任务连线、细分任务连线、自定义连线） */}
        {tasks.flatMap((task) =>
          Array.isArray(task.links) ? task.links.map((link) => {
            const target = tasks.find((t) => t.id === link.toId);
            if (!target) return null;

            // 如果是主线任务之间的同级连线，则不渲染，因为已经由上面的"链式连线"逻辑自动处理
            const fromTask = tasks.find(t => t.id === task.id);
            if (fromTask && fromTask.parentId === target.parentId && fromTask.parentId === null) {
              return null;
            }

            if (!visibleTaskIds.has(task.id) || !visibleTaskIds.has(link.toId)) return null;

            // --- 使用 getTaskType 判断连线类型 ---
            const fromType = getTaskType(fromTask, tasks);
            const toType = getTaskType(target, tasks);
            let lineColor = link.color || '#86868b';
            // 只有在没有自定义颜色时才使用默认逻辑
            if (!link.color) {
              // 只有主任务->子任务、子任务->子任务为橙色，其余全部灰色
              if (
                (fromType === 'main' && toType === 'child' && target.parentId === fromTask.id) ||
                (fromType === 'child' && toType === 'child' && fromTask.parentId === target.parentId)
              ) {
                lineColor = '#ff9800';
              } else {
                lineColor = '#86868b';
              }
            }

            return target ? (
              <LinkLine
                key={`${task.id}-${link.toId}`}
                source={task}
                target={target}
                fromId={task.id}
                toId={link.toId}
                fromAnchor={link.fromAnchor}
                toAnchor={link.toAnchor}
                onDelete={handleDeleteLink}
                onUpdateLink={handleUpdateLink}
                tasks={tasks}
                svgRef={svgRef}
                label={typeof link.label === 'string' ? link.label : ''}
                onUpdateLabel={handleUpdateLinkLabel}
                // 使用保存的样式，如果没有则使用默认值
                lineStyle={link.lineStyle || 'solid'}
                arrowStyle={link.arrowStyle || 'normal'}
                lineWidth={link.lineWidth || 2}
                color={lineColor}
                selected={selectedElement?.type === 'link' && selectedElement.fromId === task.id && selectedElement.toId === link.toId}
                onClick={() => setSelectedElement({ type: 'link', fromId: task.id, toId: link.toId })}
              />
            ) : null;
          }) : []
        )}
        {/* 对齐辅助线 */}
        {alignLines.map((line, idx) =>
          line.type === 'horizontal' && typeof line.y === 'number' && !isNaN(line.y) ? (
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
          ) : line.type === 'vertical' && typeof line.x === 'number' && !isNaN(line.x) ? (
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
          ) : null
        )}
        {/* 框选区域 */}
        {selectBox && (
          <rect
            x={Math.min(selectBox.x1, selectBox.x2)}
            y={Math.min(selectBox.y1, selectBox.y2)}
            width={Math.abs(selectBox.x2 - selectBox.x1)}
            height={Math.abs(selectBox.y2 - selectBox.y1)}
            fill="#316acb22"
            stroke="#316acb"
            strokeDasharray="4 2"
            pointerEvents="none"
          />
        )}
        {/* 任务节点 */}
        {visibleTasks.map((task, idx) => (
          <TaskNode
            key={task.id}
            task={task}
            onClick={e => {
              if (e.ctrlKey || e.metaKey) {
                // 多选逻辑如有需要可扩展
              } else {
                setSelectedElement({ type: 'task', id: task.id });
              }
              handleNodeClick(task);
            }}
            onStartLink={handleStartLink}
            onDelete={handleDeleteTask}
            selected={selectedElement?.type === 'task' && selectedElement.id === task.id}
            multiSelected={selectedTaskIds.includes(task.id)}
            onDrag={handleTaskDrag}
            data-task-id={task.id}
            isFirst={task.id === (tasks[0]?.id)}
            onEditingChange={setIsEditing}
            transform={transform}
            onAnchorMouseDown={handleAnchorMouseDown}
            onAnchorMouseEnter={handleAnchorMouseEnter}
            onAnchorMouseLeave={handleAnchorMouseLeave}
          />
        ))}
        {/* 虚拟连线：锚点拖动时渲染 */}
        {linkingAnchor && (
          <line
            x1={linkingAnchor.fromPos.x}
            y1={linkingAnchor.fromPos.y}
            x2={linkingAnchor.mousePos.x}
            y2={linkingAnchor.mousePos.y}
            stroke="#316acb"
            strokeWidth={2}
            strokeDasharray="4 4"
            markerEnd="url(#virtual-arrowhead)"
            pointerEvents="none"
          />
        )}
        {/* 时间标尺（底部固定，随画布缩放/平移） */}
        <g>
          {/* 标尺主线 */}
          {ticks.length > 0 && typeof ticks[0].x === 'number' && typeof ticks[ticks.length - 1].x === 'number' && !isNaN(ticks[0].x) && !isNaN(ticks[ticks.length - 1].x) && (
            <line
              x1={ticks[0].x - 100}
              x2={ticks[ticks.length - 1].x + 100}
              y1={window.innerHeight / transform.scale - 60 - transform.offsetY / transform.scale}
              y2={window.innerHeight / transform.scale - 60 - transform.offsetY / transform.scale}
              stroke="#bfc8d6"
              strokeWidth={2}
            />
          )}
          {/* 今日日期垂线 */}
          {(() => {
            if (ticks.length === 0) return null;
            // 计算今天在标尺上的x坐标
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const firstTick = ticks[0];
            const firstX = firstTick.x;
            const scale = 300; // 固定刻度宽度
            let todayX = null;
            if (timeScale === 'month') {
              const monthDiff = (today.getFullYear() - firstTick.date.getFullYear()) * 12 + (today.getMonth() - firstTick.date.getMonth());
              // 计算天数在本月内的比例
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              const dayRatio = (today.getDate() - 1) / daysInMonth;
              todayX = firstX + monthDiff * scale + dayRatio * scale;
            } else if (timeScale === 'week') {
              // 用 getWeekStart 动态获取本地化的周起点
              const firstWeekStart = getWeekStart(firstTick.date, lang);
              const todayWeekStart = getWeekStart(today, lang);
              // 计算今天距离firstWeekStart的周数
              const weekDiff = Math.floor((todayWeekStart - firstWeekStart) / (7 * 24 * 3600 * 1000));
              // 计算今天在本周内的天数（以本地化为准）
              let todayDayOfWeek;
              if (lang === 'zh') {
                todayDayOfWeek = (today.getDay() + 6) % 7;
              } else {
                todayDayOfWeek = today.getDay();
              }
              const dayRatio = todayDayOfWeek / 7;
              todayX = firstX + weekDiff * scale + dayRatio * scale;
            } else if (timeScale === 'day') {
              const dayDiff = Math.floor((today - firstTick.date) / (24 * 3600 * 1000));
              todayX = firstX + dayDiff * scale;
            }
            // 只在范围内渲染
            if (todayX === null || todayX < ticks[0].x - 100 || todayX > ticks[ticks.length - 1].x + 100) return null;
            return (
              <>
                <circle
                  cx={todayX}
                  cy={window.innerHeight / transform.scale - 60 - transform.offsetY / transform.scale}
                  r={9}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth={3}
                  opacity={0.95}
                  pointerEvents="none"
                />
                <text
                  x={todayX}
                  y={window.innerHeight / transform.scale - 60 - transform.offsetY / transform.scale + 24}
                  fontSize={14}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif"
                  fill="#e11d48"
                  textAnchor="middle"
                  style={{ fontWeight: 400, letterSpacing: 1, opacity: 0.95 }}
                  pointerEvents="none"
                >
                  {t('timeline.today')}
                </text>
              </>
            );
          })()}
          {/* 月份刻度 */}
          {ticks.map((m, idx) => (
            <g key={m.label + '-' + idx}>
              <line
                x1={m.x}
                x2={m.x}
                y1={window.innerHeight / transform.scale - 70 - transform.offsetY / transform.scale}
                y2={window.innerHeight / transform.scale - 50 - transform.offsetY / transform.scale}
                stroke="#bfc8d6"
                strokeWidth={1.5}
              />
              {/* 上部主刻度文字 */}
              {timeScale === 'month' && (
                <text
                  x={m.x}
                  y={window.innerHeight / transform.scale - 80 - transform.offsetY / transform.scale}
                  fontSize={15}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif"
                  fill="#888"
                  textAnchor="middle"
                  style={{ fontWeight: 400, letterSpacing: 1 }}
                >
                  {t('timeline.month', {
                    year: m.date.getFullYear(),
                    month: m.date.getMonth() + 1,
                  })}
                </text>
              )}
              {timeScale === 'week' && (
                <text
                  x={m.x}
                  y={window.innerHeight / transform.scale - 80 - transform.offsetY / transform.scale}
                  fontSize={15}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif"
                  fill="#888"
                  textAnchor="middle"
                  style={{ fontWeight: 400, letterSpacing: 1 }}
                >
                  {t('timeline.week', {
                    year: m.date.getFullYear(),
                    week: getWeekNumber(m.date, lang),
                  })}
                </text>
              )}
              {timeScale === 'day' && (
                <text
                  x={m.x}
                  y={window.innerHeight / transform.scale - 80 - transform.offsetY / transform.scale}
                  fontSize={14}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif"
                  fill="#888"
                  textAnchor="middle"
                  style={{ fontWeight: 400, letterSpacing: 1 }}
                >
                  {t('timeline.day', {
                    year: m.date.getFullYear(),
                    month: m.date.getMonth() + 1,
                    day: m.date.getDate(),
                  })}
                </text>
              )}
              {/* 下部副刻度文字 */}
              {timeScale === 'week' && getWeekNumber(m.date, lang) === getWeekNumber(new Date(m.date.getFullYear(), m.date.getMonth(), 1), lang) && (
                <text
                  x={m.x}
                  y={window.innerHeight / transform.scale - 30 - transform.offsetY / transform.scale}
                  fontSize={14}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif"
                  fill="#316acb"
                  textAnchor="middle"
                  style={{ fontWeight: 500, letterSpacing: 1, opacity: 0.7 }}
                >
                  {t('timeline.month', {
                    year: m.date.getFullYear(),
                    month: m.date.getMonth() + 1,
                  })}
                </text>
              )}
              {timeScale === 'day' && m.date.getDate() === 1 && (
                <text
                  x={m.x}
                  y={window.innerHeight / transform.scale - 30 - transform.offsetY / transform.scale}
                  fontSize={14}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', Arial, sans-serif"
                  fill="#316acb"
                  textAnchor="middle"
                  style={{ fontWeight: 500, letterSpacing: 1, opacity: 0.7 }}
                >
                  {t('timeline.month', {
                    year: m.date.getFullYear(),
                    month: m.date.getMonth() + 1,
                  })}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
      {/* 连线模式提示 */}
      {linking && (
        <div className="absolute top-20 left-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded shadow z-50">
          {fromTask ? "请选择目标任务节点" : "请选择起点任务节点"}
        </div>
      )}
    </div>
  );
};

export default MainCanvas;